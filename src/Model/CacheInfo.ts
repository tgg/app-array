import _ from "lodash";

export interface CacheModelInfo {
    keepModel: boolean,
    disconnected: boolean,
    filename?: String,
    host: String
}

export enum LOCAL_STORAGE_NAME {
    CACHE = "appArrayCacheInfo"
};

export class CacheInfo implements CacheModelInfo {
    keepModel: boolean;
    disconnected: boolean;
    model: String;
    host: String;
    path: String;

    constructor(json?: any) {
        this.keepModel = json?.keepModel ?? false;
        this.disconnected = json?.disconnected ?? false;
        this.model = json?.model ?? "";
        this.host = json?.host ?? "";
        this.path = "";
    }

    save(): void{
        localStorage.setItem(LOCAL_STORAGE_NAME.CACHE, JSON.stringify({ ...this, path: undefined }));
    };
}