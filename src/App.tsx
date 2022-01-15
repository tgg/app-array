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

class DemoWidget extends React.Component<{ model: SystemDiagramModel; engine: DiagramEngine }, any> {
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

	render() {
		return (
			<DemoWorkspaceWidget buttons={<DemoButton onClick={this.autoDistribute}>Re-distribute</DemoButton>}>
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
	let eventBusStartCommand = FO.components[1].commands?.start!;
	let eventBusStart = new JavaScriptExecutor().runner(eventBusStartCommand.steps);
	let d = new TextDecoder();
	let instance = eventBusStart({ id: 'empty'});
	instance.channels.out.onReceive = (data: Uint8Array | null) => {
		if (data) {
			console.info(d.decode(data));
		}
		return true;
	};

	instance.run([]);

	return <DemoWidget model={model} engine={engine} />;
}

export default App;
