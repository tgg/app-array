import * as signalr from '@microsoft/signalr';
import { DiagramModel } from '@projectstorm/react-diagrams';
import { toast } from 'react-toastify';
import { JsonType, ResponseFactory } from '../Model/Responses/Response';
import { SystemDiagramModel } from '../Model/SystemDiagramModel';

export class ModelResponseHandler {
    handleSendModelResponse(payload: any) {
        const resp = new ResponseFactory().buildHubResponse(payload);
        if(resp.type === JsonType.TypeError)
        {
            toast.error(`Error while sending model (${resp.statusCode}) : ${resp.msg}`)
        } 
        else if(resp.type === JsonType.TypeNewModel)
        {
            this.handleNewModelReceived(payload);
        }
        else {
            toast.info(resp);
        }
    }

    handleNewModelReceived(payload: any) {
        const newModelResp = new ResponseFactory().buildNewModelResponseDirectly(payload);
        toast.info(`Model ${newModelResp.id} registered with path ${newModelResp.path}`)
    }
}

export class ModelService {
    host: String;
    socket?: signalr.HubConnection;

    constructor(host: String) {
        this.host = host;
    }

    connect(onConnected: () => void, onError: (err: any) => void): void{
        let url = this.host + "/model";

		this.socket = new signalr.HubConnectionBuilder()
								.configureLogging(signalr.LogLevel.Debug)
								.withUrl(url, signalr.HttpTransportType.WebSockets)
								.build();
								
        this.socket.on('sendModelResponse', this.sendModelResponse);
        this.socket.on('newModelReceived', this.newModelReceived);
        this.socket.onclose(onError);
		this.socket?.start().then(onConnected).catch(onError);
    }

    sendModel(model: DiagramModel): void {
        if(model instanceof SystemDiagramModel) {
            const systemModel = model as SystemDiagramModel;
            this.socket?.send("sendModel", JSON.stringify(systemModel.getApplication()))
        }
    }
    
    sendModelResponse(payload: any) {
        new ModelResponseHandler().handleSendModelResponse(payload);
    }

    newModelReceived(payload: any) {
        new ModelResponseHandler().handleNewModelReceived(payload);        
    }
}