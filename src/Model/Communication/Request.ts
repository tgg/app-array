export interface Request {};

export interface SendCommandRequest extends Request {
    commandId: String,
    command: String;
    id: String;
}

export class RequestFactory {
    builSendCommandRequest(commandId: String, command: String, id: String): SendCommandRequest {
        const req = {commandId, command, id};
        return req;
    }
}