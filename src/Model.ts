
export namespace AppArray.Model {
    export enum Status {
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

    export type Context = {
        [key: string]: string;
    }

    // That's how to extend a type :-)
    export type Environment = Context & { id: string }

    export type ChannelMap<S> = {
        [id: string]: Channel<S>;
    }

    export interface CommandResult<T> {
        completedAt: Date,
        result: T,
    }

    export interface StatusTrail {
        status: Status;
        at: Date;
        by: string;
        on: string;
    }

    export interface Command<S,T> {
        launchTrail: StatusTrail;
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
        id: string;
        tags?: Tags;
    }
    export type ElementMap = {
        [id: string]: Element;
    }
    export interface LiveElement extends Element {
        commands?: CommandMap;
    }

    export type BusinessObject = string;
    export enum PortKind { // Access Control?
        Read = 1 << 1,
        Write = 1 << 2,
        ReadWrite = Read | Write // CRUD? + execute? publish? subscribes?
    }
    export type PortId = string;
    export type Port = {
        id: PortId;
        object?: BusinessObject;
        kind: PortKind;
        protocol?: string;
    }

    export interface Component extends LiveElement {
        type: 'component';
        provides?: Port[];
        consumes?: PortId[];
    }
    // groups with composite pattern
    export interface Application extends LiveElement {
        type: 'application';
        provides?: Port[];
        consumes?: PortId[];
        components: Component[];
    }
}
