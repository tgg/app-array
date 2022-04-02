import { Environment } from "../Model/Environment";
import * as signalr from '@microsoft/signalr';

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

export interface Cmd<S,T> {
    launchTrail: StatusTrail;
    channels: ChannelMap<S>;
    run(args: string[]): Promise<CommandResult<T>>;
}
export interface Executor<S,T> {
    runner(steps: string[]): (context: Environment) => Cmd<S,T>;
}

// We are not using eval here, but we should be careful about security
// nonetheless. Besides, we may want to have TS compiler do some checks
// for us.
export class JavaScriptExecutor implements Executor<Uint8Array,any>{
    type = 'javascript';

    runner(steps: string[]): (context: Environment) => Cmd<Uint8Array, any> {
        if (steps.length !== 1) {
            throw new Error("Only one function call supported!");
        }

        let name = steps[0];
        return (window as any)[name];
    }
}

export class ShellExecutor implements Executor<Uint8Array,any> {
        type = 'shell';
        socket: signalr.HubConnection;
        
        constructor(socket: signalr.HubConnection) {
            this.socket = socket;
        }
        
        runner(steps: string[]): (context: Environment) => Cmd<Uint8Array, any> {
            const out = new Channel<Uint8Array>('out');
            const te = new TextEncoder();
            
            let startTrail = {
                status: Status.STARTED,
                at: new Date(),
                by: 'me',
                on : 'self'
            };
            
            return (ctx: Environment) => {
                let sock = this.socket;
                
                return {
                    launchTrail: startTrail,
                    channels: {
                        out: out
                    },
                    run(args: string[]) {
                        return new Promise((resolve, reject) => {
                            // Loop with each command
                            steps.forEach(step => {
                                sock.invoke('sendCommand', step);
                            });
                            
                            // TODO: Wait until nothing left to read
                            
                            resolve({
                                completedAt: new Date(),
                                result: 'Bravo!'
                            })
                        })
                    }
                }
            }
        }
    }