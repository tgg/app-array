import * as signalr from '@microsoft/signalr';
import { DiagramModel } from '@projectstorm/react-diagrams';
import { toast } from 'react-toastify';
import { CacheInfo } from '../Model/CacheInfo';
import { JsonType, ResponseFactory } from '../Model/Responses/Response';
import { SystemDiagramModel } from '../Model/SystemDiagramModel';

export class ComponentService {
    private cacheInfo: CacheInfo;
    private onConnected: () => void;
    private onError: (err: any) => void;
    private onCommandReceived: (payload: any) => void;
    private socket?: signalr.HubConnection;

    constructor(cacheInfo: CacheInfo, onConnected: () => void, onError: (err: any) => void, onCommandReceived: (payload: any) => void) {
        this.cacheInfo = cacheInfo;
        this.onConnected = onConnected;
        this.onError = onError;
        this.onCommandReceived = onCommandReceived;
    }

    async connect() {
        let url =  `${this.cacheInfo.host}${this.cacheInfo.path}`;

		this.socket = new signalr.HubConnectionBuilder()
								.configureLogging(signalr.LogLevel.Debug)
								.withUrl(url, signalr.HttpTransportType.WebSockets)
								.build();
								
        this.socket.on('statusUpdated', this.onCommandReceived);
        this.socket.onclose(this.onError);
		await this.socket?.start().then(this.onConnected).catch(this.onError);
    }

    async disconnect() {
        await this.socket?.stop();
    }

    async sendCommand(payload: any) {
        this.socket?.send("sendCommand", payload);
    }
}