import * as signalr from '@microsoft/signalr';
import JSEncrypt from 'jsencrypt';
import { AuthenticationPopupState } from '../Components/AuthenticationPopup';
import { CacheInfo } from '../Model/CacheInfo';
import { RequestFactory } from '../Model/Communication/Request';

export class ComponentService {
    private cacheInfo: CacheInfo;
    private onConnected: () => void;
    private onError: (err: any) => void;
    private onCommandReceived: (payload: any) => void;
    private onStatusUpdated: (payload: any) => void;
    private onCredentialResponse: (payload: any) => void;
    private tokenReceived: (payload: any) => void;
    private socket?: signalr.HubConnection;

    constructor(cacheInfo: CacheInfo, onConnected: () => void, onError: (err: any) => void, 
                    onCommandReceived: (payload: any) => void, onStatusUpdated: (payload: any) => void, onCredentialResponse: (payload: any) => void,
                    tokenReceived: (payload: any) => void) {
        this.cacheInfo = cacheInfo;
        this.onConnected = onConnected;
        this.onError = onError;
        this.onCommandReceived = onCommandReceived;
        this.onStatusUpdated = onStatusUpdated;
        this.onCredentialResponse = onCredentialResponse;
        this.tokenReceived = tokenReceived;
    }

    async connect() {
        let url =  `${this.cacheInfo.host}${this.cacheInfo.path}`;

		this.socket = new signalr.HubConnectionBuilder()
								.configureLogging(signalr.LogLevel.Debug)
								.withUrl(url, signalr.HttpTransportType.WebSockets)
								.build();
								
        this.socket.on('getCommandResult', this.onCommandReceived);
        this.socket.on('statusUpdated', this.onStatusUpdated);
        this.socket.on('onCredentialResponse', this.onCredentialResponse)
        this.socket.on('tokenReceived', this.tokenReceived);
        this.socket.onclose(this.onError);
		await this.socket?.start().then(this.onConnected).catch(this.onError);
    }

    async disconnect() {
        await this.socket?.stop();
    }

    sendCommand(id: string, payload: any, componentId: string) {
        const req = new RequestFactory().builSendCommandRequest(id, payload, componentId);
        this.socket?.send("sendCommand", JSON.stringify(req));
    }

    encryptMessage(msg: any): any {
        var encrypt = new JSEncrypt({log: true});
        encrypt.setPublicKey(this.cacheInfo.encryptionKey.toString());
        return encrypt.encrypt(JSON.stringify(msg));
    }

	sendTextCredentials(creds: Map<String, String>) {
        this.socket?.send("sendTextCredentials", this.encryptMessage(creds));
	}

	sendVaultCredentials(creds: AuthenticationPopupState) {
        this.socket?.send("sendVaultCredentials", this.encryptMessage(creds));
	}

	requestToken() {
        this.socket?.send("requestToken");
	}
}