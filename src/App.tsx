import React from 'react';
//import logo from './logo.svg';
import './App.css';

import createEngine, {
	DagreEngine,
	DiagramEngine,
	PathFindingLinkFactory
} from '@projectstorm/react-diagrams';

import { DemoButton, DemoWorkspaceWidget } from './DemoWorkspaceWidget';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { DemoCanvasWidget } from './DemoCanvasWidget';
import { FO } from './ModelTest';
import { SystemDiagramModel } from './SystemDiagramModel';
import { JavaScriptExecutor } from './Executor';

class SystemWidget extends React.Component<{ model: SystemDiagramModel; engine: DiagramEngine }, any> {
	engine: DagreEngine;

	constructor(props: any) {
		super(props);
		this.engine = new DagreEngine({
			graph: {
				rankdir: 'LR',
				ranker: 'longest-path',
				marginx: 25,
				marginy: 25
			},
			includeLinks: false
		});
	}

	autoDistribute = () => {
		this.engine.redistribute(this.props.model);
		this.reroute();
		this.props.engine.repaintCanvas();
	};

	componentDidMount(): void {
		setTimeout(() => {
			this.autoDistribute();
		}, 500);
	}

	reroute() {
		this.props.engine
			.getLinkFactories()
			.getFactory<PathFindingLinkFactory>(PathFindingLinkFactory.NAME)
			.calculateRoutingMatrix();
	}

	startAll = () => {
		console.info(this.props);
		let app = this.props.model.getApplication();
		let eventBusStartCommand = app.components[1].commands?.start!;
		let eventBusStart = new JavaScriptExecutor().runner(eventBusStartCommand.steps);
		let d = new TextDecoder();
		let instance = eventBusStart({ id: 'thisEnvironment'});
		instance.channels.out.onReceive = (data: Uint8Array | null) => {
			if (data) {
				console.info(d.decode(data));
			}
			return true;
		};

		instance.run(['Hello', 'world!']);
	}

	stopAll = () => {
		let app = this.props.model.getApplication();
		let eventBusStopCommand = app.components[1].commands?.stop!;
		let eventBusStop = new JavaScriptExecutor().runner(eventBusStopCommand.steps);
		let d = new TextDecoder();
		let instance = eventBusStop({ id: 'thisEnvironment'});
		instance.channels.out.onReceive = (data: Uint8Array | null) => {
			if (data) {
				console.info(d.decode(data));
			}
			return true;
		};

		instance.run(['Bye', 'world!']);
	}

	render() {
		return (
			<DemoWorkspaceWidget buttons={<><DemoButton onClick={this.autoDistribute}>Re-distribute</DemoButton><DemoButton onClick={this.autoDistribute}>Load ...</DemoButton><DemoButton onClick={this.startAll}>Start All</DemoButton><DemoButton onClick={this.stopAll}>Stop All</DemoButton></>}>
				<DemoCanvasWidget>
					<CanvasWidget engine={this.props.engine} />
				</DemoCanvasWidget>
			</DemoWorkspaceWidget>
		);
	}
}

function App() {
	let engine = createEngine();
	console.info(JSON.stringify(FO));
	let model = new SystemDiagramModel(FO);
	engine.setModel(model);

	return <SystemWidget model={model} engine={engine} />;
}

export default App;
