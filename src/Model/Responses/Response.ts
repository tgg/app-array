export enum JsonType {
	TypeError    = "Error",
	TypeNewModel = "NewModel"
}

export interface Response {};
export interface HubResponse extends Response {
    msg: Object;
    type: JsonType;
    statusCode: String;
}

export interface NewModelResponse extends Response {
    id: String;
    path: String;
}

export class ResponseFactory {

    buildNewModelResponseDirectly(json: any): NewModelResponse {
        const hubResp = this.buildHubResponse(json);
        return this.buildNewModelResponse(hubResp.msg);
    }

    buildNewModelResponse(msg: Object): NewModelResponse {
        const resp = msg as NewModelResponse;
        return resp;
    }

    buildHubResponse(json: any): HubResponse {
        const resp = JSON.parse(json) as HubResponse;
        return resp;
    }
}