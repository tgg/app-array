export interface Request {};

export interface SendCommandInfo extends Request {
    commandId: String,
    command: String;
}

export interface SendCommandRequest extends SendCommandInfo {
    componentId: String;
}

export class RequestFactory {
    builSendCommandRequest(commandId: String, command: String, componentId: String): SendCommandRequest {
        const req = {commandId, command, componentId};
        return req;
    }
}