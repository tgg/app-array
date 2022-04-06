import * as signalr from '@microsoft/signalr';
import { CacheInfo } from '../Model/CacheInfo';
import { RequestFactory } from '../Model/Communication/Request';
import { AppArray } from '../Model/Model';

export class ComponentService {
    private component: AppArray.Model.Component;
    private cacheInfo: CacheInfo;
    private onConnected: () => void;
    private onError: (err: any) => void;
    private onCommandReceived: (payload: any) => void;
    private onStatusUpdated: (payload: any) => void;
    private socket?: signalr.HubConnection;

    constructor(cacheInfo: CacheInfo, component: AppArray.Model.Component, onConnected: () => void, onError: (err: any) => void, onCommandReceived: (payload: any) => void, onStatusUpdated: (payload: any) => void) {
        this.cacheInfo = cacheInfo;
        this.component = component;
        this.onConnected = onConnected;
        this.onError = onError;
        this.onCommandReceived = onCommandReceived;
        this.onStatusUpdated = onStatusUpdated;
    }

    async connect() {
        let url =  `${this.cacheInfo.host}${this.cacheInfo.path}`;

		this.socket = new signalr.HubConnectionBuilder()
								.configureLogging(signalr.LogLevel.Debug)
								.withUrl(url, signalr.HttpTransportType.WebSockets)
								.build();
								
        this.socket.on('getCommandResult', this.onCommandReceived);
        this.socket.on('statusUpdated', this.onStatusUpdated);
        this.socket.onclose(this.onError);
		await this.socket?.start().then(this.onConnected).catch(this.onError);
    }

    async disconnect() {
        await this.socket?.stop();
    }

    sendCommand(id: string, payload: any) {
        const req = new RequestFactory().builSendCommandRequest(id, payload, this.component.id)
        this.socket?.send("sendCommand", JSON.stringify(req));
    }
}