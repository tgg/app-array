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
    token: String;
    encryptionKey: String;

    constructor(json?: any) {
        this.keepModel = json?.keepModel ?? false;
        this.disconnected = json?.disconnected ?? false;
        this.model = json?.model ?? "";
        this.host = json?.host ?? "";
        this.token = json?.token ?? "";
        this.path = "";
        this.encryptionKey = "";
    }

    save(): void{
        localStorage.setItem(LOCAL_STORAGE_NAME.CACHE, JSON.stringify({ ...this, path: undefined, encryptionKey: undefined }));
    };

    hasTokenAndKey(): boolean{
        return this.token !== "" && this.encryptionKey !== "";
    }
}