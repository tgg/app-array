import { AppArray } from './Model'

function StartComponent(args: string[], stdOutHandler?: AppArray.Model.CommandOutput, stdErrHandler?: AppArray.Model.CommandOutput, completionHandler?: AppArray.Model.CommandCompletion): AppArray.Model.CommandResult {
    let launchedAt = new Date();
    console.log('started %s at: %s', args.join(', '), launchedAt.toISOString());

    return {
        launchedAt: launchedAt,
        status: AppArray.Model.CommandStatus.STARTED
    }
}

function StopComponent(args: string[], stdOutHandler?: AppArray.Model.CommandOutput, stdErrHandler?: AppArray.Model.CommandOutput, completionHandler?: AppArray.Model.CommandCompletion): AppArray.Model.CommandResult {
    let launchedAt = new Date();
    console.log('stopped %s at: %s', args.join(', '), launchedAt.toISOString());

    return {
        launchedAt: launchedAt,
        status: AppArray.Model.CommandStatus.STOPPED
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
