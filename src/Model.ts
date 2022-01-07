import { DefaultNodeFactory } from "@projectstorm/react-diagrams";

export namespace AppArray.Model {
    export enum CommandStatus {
        UNKNOWN,
        STARTING,
        STARTED,
        RUNNING,
        STOPPING,
        STOPPED
    }

    export class Channel<S> {
        readonly id: string;

        constructor(id: string) {
            this.id = id;
        }

        public onReceive?: (data: S | null) => boolean;
        public canSend(): boolean { return false; };
        public send(data: S): Promise<void> {
            throw new Error('send not supported');
        }
    }

    export type ChannelMap<S> = {
        [id: string]: Channel<S>;
    }

    export interface CommandResult<T> {
        completedAt: Date,
        result: T,
    }

    export interface CommandStatusTrail {
        status: CommandStatus;
        at: Date;
        by: string;
        on: string;
    }

    export interface Command<S,T> {
        launchTrail: CommandStatusTrail;
        channels: ChannelMap<S>;
        // We could also have args here?
        run(): Promise<CommandResult<T>>;
    }
    export type CommandOutput = (out: string) => void;
    export type CommandCompletion = (completionCode: number) => number;
    export type CommandRunner<S,T> = (args: string[]) => Command<S,T>;
    export type CommandMap = {
        [id: string]: CommandRunner<Uint8Array,any>;
    }

    export type Tags = {
        // e.g. "lang"= ["c++", "java"], "src" = "https://github.com/user/repo",
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
    }

    export type BusinessObject = string;
    export enum PortKind {
        Read = 1 << 1,
        Write = 1 << 2,
        ReadWrite = Read | Write // CRUD? + execute?
    }
    export type Port = {
        id: string;
        businessObject?: BusinessObject; // many?
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
