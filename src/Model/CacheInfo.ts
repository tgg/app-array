export interface CacheModelInfo {
    keepModel: boolean,
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

    constructor(json?: any) {
        this.keepModel = json?.keepModel ?? false;
        this.disconnected = json?.disconnected ?? false;
        this.model = json?.model ?? "";
        this.host = json?.host ?? "";
    }

    save(): void{
        localStorage.setItem(LOCAL_STORAGE_NAME.CACHE, JSON.stringify(this));
    };
}