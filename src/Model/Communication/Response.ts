import { SendCommandInfo } from "./Request";

export enum JsonType {
	TypeError    = "Error",
	TypeNewModel = "NewModel",
    TypeExistingModel = "ExistingModel",
	TypeMessage  = "Message",
	TypeUpdate   = "Update",
	TypeCommandResponse = "CommandResponse",
    TypeCommandDownloadResponse = "CommandDownloadResponse",
    TypeInfo = "Info",
	TypeCredentialResponse = "CredentialResponse",
	TypeTokenResponse = "TokenResponse",
}

export enum UpdateStatus {
    StatusOk = 0,
    StatusNok = 1
}

export interface Response {};
export interface HubResponse extends Response {
    msg: Object;
    type: JsonType;
    statusCode: String;
}

export interface NewModelResponse extends Response {
    id: String;
    paths: String[];
    msg: String;
}

export interface UpdateResponse extends Response {
    componentId: String;
    status: UpdateStatus;
}

export interface CommandResponse extends UpdateResponse, SendCommandInfo {
    result: String;
}

export interface CommandDownloadResponse extends CommandResponse {
    filename: String;
}

export interface TokenResponse extends Response {
	msg: String
	token: String
	publicKey: String
}

export class ResponseFactory {
    buildInnerResponse<T extends Response>(json: any): T {
        const hubResp = this.buildHubResponse(json);
        const resp = hubResp.msg as T;
        return resp;
    }

    buildHubResponse(json: any): HubResponse {
        const resp = JSON.parse(json) as HubResponse;
        return resp;
    }
}