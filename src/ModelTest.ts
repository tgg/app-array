import { AppArray } from './Model'

function StartComponent(args: string[]) : AppArray.Model.Command<Uint8Array,any> {
    let startTrail = {
        status: AppArray.Model.CommandStatus.STARTED,
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
        status: AppArray.Model.CommandStatus.STARTED,
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
    name: 'Database',
    tags: { group: 'core', type: 'database' }
}

let EventBus: AppArray.Model.Component = {
    name: 'EventBus',
    tags: { group: 'core' },
    commands: {
        start: StartComponent,
        stop: StopComponent
    }
}

let Cache: AppArray.Model.Component = {
    name: 'Cache',
    tags: { group: 'core' },
    depends: [EventBus, DB]
}

let PositionService: AppArray.Model.Component = {
    name: 'PositionService',
    tags: { group: 'TradePosition' },
    depends: [EventBus, DB],
    provides: [{
        id: '/api/Position',
        businessObject: 'Position',
        kind: AppArray.Model.PortKind.Read
    }]
}

let Spreadsheet: AppArray.Model.Component = {
    name: 'Spreadsheet',
    tags: { group: 'TradePosition' },
    consumes: [{
        host: PositionService,
        port: '/api/Position'
    }]
}

export const FO: AppArray.Model.Application = {
    name: 'FOApp',
    components: [DB, EventBus, Cache, PositionService, Spreadsheet]
}
