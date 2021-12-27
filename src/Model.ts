export namespace AppArray.Model {
    export enum CommandStatus {
        STARTING,
        STARTED,
        RUNNING,
        STOPPING,
        STOPPED
    }
    export interface CommandResult {
        launchedAt: Date,
        status: CommandStatus,
        completedAt?: Date,
        completionCode?: number
    }
    export type CommandOutput = (out: string) => void;
    export type CommandCompletion = (completionCode: number) => number;
    export type Command = (args: string[], stdOutHandler?: CommandOutput, stdErrHandler?: CommandOutput, completionHandler?: CommandCompletion) => CommandResult;
    export type CommandMap = {
        [id: string]: Command;
    }

    export type Query = (args: string[]) => any;
    export type QueryMap = {
        [id: string]: Query;
    }

    export type Tags = {
        // e.g. "lang"= ["c++", "java"], "src" = "https://githhub.com/user/repo",
        // compile time or runtime deps, documentation, URL, etc.
        // group
        [key: string]: string | string[];
    }
    export interface Element {
        name: string;
        tags?: Tags;
    }
    export type ElementMap = {
        [id: string]: Element;
    }
    export interface LiveElement extends Element {
        commands?: CommandMap;
        queries?: QueryMap;
    }

    export type BusinessObject = string;
    export enum PortKind {
        Read = 1 << 1,
        Write = 1 << 2,
        ReadWrite = Read | Write
    }
    export type Port = {
        id: string;
        businessObject?: BusinessObject;
        kind: PortKind;
    }
    export type Service<T> = {
        host: T;
        port: string;
    }

    export interface Component extends LiveElement {
        instance?: string;
        depends?: Component[];
        provides?: Port[];
        consumes?: Service<Application | Component>[];
    }
    export interface Application extends LiveElement {
        provides?: Port[];
        consumes?: Service<Application>[];
        components: Component[];
    }
}
