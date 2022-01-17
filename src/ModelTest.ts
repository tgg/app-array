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

let DB: AppArray.Model.Component = {
    id: 'Database',
    type: 'component',
    tags: { group: 'core', type: 'database' },
    provides: [ {
        id: 'raw data',
        kind: AppArray.Model.PortKind.ReadWrite
    }]
}

let EventBus: AppArray.Model.Component = {
    id: 'EventBus',
    type: 'component',
    tags: { group: 'core' },
    commands: {
        start: {
            type: 'javascript',
            steps: ['StartComponent']
        },
        stop: {
            type: 'javascript',
            steps: ['StopComponent']
        }
    },
    provides: [ {
        id: 'raw events',
        kind: AppArray.Model.PortKind.ReadWrite
    }]
}

let Cache: AppArray.Model.Component = {
    id: 'Cache',
    type: 'component',
    tags: { group: 'core' },
    consumes: [
        'raw events',
        'raw data'
    ]
}

let PositionService: AppArray.Model.Component = {
    id: 'PositionService',
    type: 'component',
    tags: { group: 'TradePosition' },
    provides: [{
        id: '/api/Position',
        object: 'Position',
        kind: AppArray.Model.PortKind.Read,
        protocol: 'REST'
    }],
    consumes: [
        'raw events',
        'raw data'
    ]
}

let Spreadsheet: AppArray.Model.Component = {
    id: 'Spreadsheet',
    type: 'component',
    tags: { group: 'TradePosition' },
    consumes: ['/api/Position']
}

export const FO: AppArray.Model.Application = {
    id: 'FOApp',
    type: 'application',
    components: [DB, EventBus, Cache, PositionService, Spreadsheet]
}
