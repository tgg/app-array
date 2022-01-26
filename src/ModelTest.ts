import { AppArray } from './Model'

let Producer: AppArray.Model.Component = {
    id: 'Producer',
    type: 'component',
    commands: {
        start: {
            type: 'shell',
            steps: ['ls','pwd']
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
            steps: ['/app/bin/batch.sh']
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
