import * as signalr from '@microsoft/signalr';
import { DiagramModel } from '@projectstorm/react-diagrams';
import { toast } from 'react-toastify';
import { CacheInfo } from '../Model/CacheInfo';
import { JsonType, ResponseFactory } from '../Model/Responses/Response';
import { SystemDiagramModel } from '../Model/SystemDiagramModel';

export class ModelResponseHandler {
    handleSendModelResponse(payload: any, onModelSaved: (valid: boolean, path: String) => void) {
        const resp = new ResponseFactory().buildHubResponse(payload);
        if(resp.type === JsonType.TypeError) {
            toast.error(`Error while sending model (${resp.statusCode}) : ${resp.msg}`)
            onModelSaved(false, "");
        } 
        else if(resp.type === JsonType.TypeNewModel) {
            const newModelResp = new ResponseFactory().buildNewModelResponseDirectly(payload);
            toast.info(`Model ${newModelResp.id} registered with path ${newModelResp.path}`)
            onModelSaved(true, newModelResp.path);
        }
        else {
            console.log(`Incorrect message received handleSendModelResponse : ${resp}`)
            onModelSaved(false, "");
        }
    }

    handleNewModelReceived(payload: any) {
        const newModelResp = new ResponseFactory().buildNewModelResponseDirectly(payload);
        toast.info(`New model have been registered with path ${newModelResp.path}`)
    }
}

export class ModelService {
    private cacheInfo: CacheInfo;
    private onConnected: () => void;
    private onError: (err: any) => void;
    private onModelSaved: (valid: boolean, path: String) => void;
    private socket?: signalr.HubConnection;

    constructor(cacheInfo: CacheInfo, onConnected: () => void, onError: (err: any) => void, onModelSaved: (valid: boolean, path: String) => void) {
        this.cacheInfo = cacheInfo;
        this.onConnected = onConnected;
        this.onError = onError;
        this.onModelSaved = onModelSaved;
    }

    async connect() {
        let url = this.cacheInfo.host + "/model";

		this.socket = new signalr.HubConnectionBuilder()
								.configureLogging(signalr.LogLevel.Debug)
								.withUrl(url, signalr.HttpTransportType.WebSockets)
								.build();
								
        this.socket.on('sendModelResponse', data => {
            new ModelResponseHandler().handleSendModelResponse(data, this.onModelSaved);
        });
        this.socket.on('newModelReceived', data => {
            new ModelResponseHandler().handleNewModelReceived(data);
        });
        this.socket.onclose(this.onError);
		await this.socket?.start().then(this.onConnected).catch(this.onError);
    }

    async disconnect() {
        await this.socket?.stop();
    }

    async sendModel(model: DiagramModel) {
        if(model instanceof SystemDiagramModel && !this.cacheInfo.disconnected && this.socket?.connectionId) {
            const systemModel = model as SystemDiagramModel;
            await this.socket?.send("sendModel", JSON.stringify(systemModel.getApplication()))
        } else {
            this.onModelSaved(false, "");
        }
    }
}