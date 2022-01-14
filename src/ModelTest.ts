import { AppArray } from './Model'

function StartComponent(args: string[]) : AppArray.Model.Command<Uint8Array,any> {
    let startTrail = {
        status: AppArray.Model.Status.STARTED,
        at: new Date(),
        by: 'me',
        on : 'self'
    };

    console.log('starting %s at: %s', args.join(', '), startTrail.at.toISOString());

    return {
        launchTrail: startTrail,
        channels: {
            out: new AppArray.Model.Channel<Uint8Array>('dummy')
        },
        run() {
            console.info('Starting!');

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

function StopComponent(args: string[]) : AppArray.Model.Command<Uint8Array,any> {
    let startTrail = {
        status: AppArray.Model.Status.STARTED,
        at: new Date(),
        by: 'me',
        on : 'self'
    };

    console.log('stopping %s at: %s', args.join(', '), startTrail.at.toISOString());

    return {
        launchTrail: startTrail,
        channels: {
            out: new AppArray.Model.Channel<Uint8Array>('dummy')
        },
        run() {
            console.info('Stopping!');

            return new Promise((resolve, reject) => {
                if (this.channels.out.onReceive) {
                    let e = new TextEncoder();
                    this.channels.out.onReceive(e.encode('Hello from'));
                    this.channels.out.onReceive(e.encode('My callback'));
                }

                reject({
                    completedAt: new Date(),
                    result: 'Failed!'
                })
            })
        }
    }
}

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
        start: StartComponent,
        stop: StopComponent
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
