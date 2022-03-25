export namespace AppArray {
    export interface CacheModelInfo {
        keepModel: boolean,
        filename?: String
    }

    export enum LOCAL_STORAGE_NAME {
        CACHE = "appArrayCacheInfo"
    };

    export class CacheInfo implements CacheModelInfo {
        keepModel: boolean;
        filename: String;

        constructor(json?: any) {
            this.keepModel = json?.keepModel ?? false;
            this.filename = json?.filename ?? "";
        }

        save(): void{
		    localStorage.setItem(LOCAL_STORAGE_NAME.CACHE, JSON.stringify(this));
        };
    }
}