import { AppArray } from './Model'
import { Channel, Cmd, Status } from './Executor'
import { Environment } from './Environment'

function StartComponent(context: Environment): Cmd<Uint8Array,any> {
    let startTrail = {
        status: Status.STARTED,
        at: new Date(),
        by: 'me',
        on : 'self'
    };

    return {
        launchTrail: startTrail,
        channels: {
            out: new Channel<Uint8Array>('out')
        },
        run(args: string[]) {
            console.log('starting %s at: %s', args.join(', '), startTrail.at.toISOString());

            return new Promise((resolve, reject) => {
                if (this.channels.out.onReceive) {
                    let e = new TextEncoder();
                    this.channels.out.onReceive(e.encode('Hello from'));
                    this.channels.out.onReceive(e.encode('My callback'));
                }

                resolve({
                    completedAt: new Date(),
                    result: 'Bravo!'
                })
            })
        }
    }
}

function StopComponent(context: Environment): Cmd<Uint8Array,any> {
    let startTrail = {
        status: Status.STARTED,
        at: new Date(),
        by: 'me',
        on : 'self'
    };

    return {
        launchTrail: startTrail,
        channels: {
            out: new Channel<Uint8Array>('dummy')
        },
        run(args: string[]) {
            console.log('stopping %s at: %s', args.join(', '), startTrail.at.toISOString());

            return new Promise((resolve, reject) => {
                if (this.channels.out.onReceive) {
                    let e = new TextEncoder();
                    this.channels.out.onReceive(e.encode('Bye from'));
                    this.channels.out.onReceive(e.encode('My other callback'));
                    this.channels.out.onReceive(e.encode('Failing now'));
                }

                reject({
                    completedAt: new Date(),
                    result: 'Failed!'
                })
            })
        }
    }
}

// Gruik alert!
(window as any)['StartComponent'] = StartComponent;
(window as any)['StopComponent'] = StopComponent;

let Producer: AppArray.Model.Component = {
    id: 'Producer',
    type: 'component',
    commands: {
        start: {
            type: 'shell',
            steps: ['/app/bin/server.sh start']
        },
        stop: {
            type: 'shell',
            steps: ['/app/bin/server.sh stop']
        }
    },
    provides: [ {
        id: 'produced files',
        kind: AppArray.Model.PortKind.Read
    }]
}

let Consumer: AppArray.Model.Component = {
    id: 'Consumer',
    type: 'component',
    tags: { type: 'batch' },
    commands: {
        start: {
            type: 'shell',
            steps: ['ls -l /usr']
        }
    },
    provides: [ {
        id: 'zip file',
        kind: AppArray.Model.PortKind.Read
    }],
    consumes: ['produced files']
}

export const Demo: AppArray.Model.Application = {
    id: 'Demo',
    type: 'application',
    components: [Producer, Consumer]
}
