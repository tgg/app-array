import { AppArray } from './Model'

let Copier: AppArray.Model.Component = {
    id: 'Copier',
    type: 'component',
    commands: {
        start: {
            type: 'shell',
            steps: ['/app/bin/server.sh start']
        },
        stop: {
            type: 'shell',
            steps: ['/app/bin/server.sh stop']
        },
        status: {
            type: 'shell',
            steps: ['/app/bin/server.sh status']
        }
    },
    provides: [ {
        id: 'source',
        kind: AppArray.Model.PortKind.Write
    },
    {
        id: 'destination',
        kind: AppArray.Model.PortKind.Read
    }]
}

let Zipper: AppArray.Model.Component = {
    id: 'Zipper',
    type: 'component',
    tags: { type: 'batch' },
    commands: {
        start: {
            type: 'shell',
            steps: ['/app/bin/batch.sh']
        }
    },
    provides: [ {
        id: 'output',
        kind: AppArray.Model.PortKind.Read
    }],
    consumes: ['destination']
}

export const Demo: AppArray.Model.Application = {
    id: 'Demo',
    type: 'application',
    components: [Copier, Zipper],
    environments: [
        {
            id: 'my own machine',
            Copier: {
                host: 'localhost',
                source: 'file:///tmp/app/in',
                destination: 'file:///tmp/app/out'
            },
            Zipper: {
                host: 'localhost',
                output: 'file:///tmp/my.tgz'
            }
        }
    ]
}
