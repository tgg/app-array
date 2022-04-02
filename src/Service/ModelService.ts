import * as signalr from '@microsoft/signalr';

export class ModelService {
    host: String;

    constructor(host: String) {
        this.host = host;
    }

    connect(onConnected: () => void, onError: (err: any) => void): void{
        let url = this.host + "/model";

		const socket = new signalr.HubConnectionBuilder()
								.configureLogging(signalr.LogLevel.Debug)
								.withUrl(url, signalr.HttpTransportType.WebSockets)
								.build();
								
		socket.on('sendModelResponse', this.sendModelResponse);
        socket.on('newModelReceived', this.newModelReceived);
		socket.start().then(onConnected).catch(onError);
    }
    
    sendModelResponse(payload: any) {
        throw new Error('Method not implemented.');
    }

    newModelReceived(payload: any) {
        throw new Error('Method not implemented.');
    }
;
}