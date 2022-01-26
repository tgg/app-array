import React, { useRef } from 'react';
//import logo from './logo.svg';
import './App.css';
import createEngine, {
	DagreEngine,
	DiagramEngine,
	PathFindingLinkFactory
} from '@projectstorm/react-diagrams';
import styled from '@emotion/styled';

import { DemoButton, DemoWorkspaceWidget } from './DemoWorkspaceWidget';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { DemoCanvasWidget } from './DemoCanvasWidget';
import { Demo } from './ModelTest';
import { SystemDiagramModel } from './SystemDiagramModel';
import { JavaScriptExecutor } from './Executor';
import { AppArray } from './Model';
import { ComponentNodeFactory } from './ComponentNodeFactory';

const Input = styled.input`
    display: none;
`

interface LoadButtonProps {
	onModelChange: (model: SystemDiagramModel) => void;
}
const LoadButton = ({ onModelChange }: LoadButtonProps) => {
	const inputFile = useRef(null)

	const handleFileUpload = (e: any) => {
		const { files } = e.target;
		if (files && files.length) {
			const file = files[0];
			const fileReader = new FileReader();
			fileReader.readAsText(file, "UTF-8");
			fileReader.onload = event => {
				const newFO = JSON.parse(event?.target?.result as string) as AppArray.Model.Application;
				let model = new SystemDiagramModel(newFO);
				onModelChange(model)

			};
		}
	};

	return <>
		<Input
			accept=".json"
			ref={inputFile}
			onChange={handleFileUpload}
			type="file"
		/>
		<DemoButton onClick={() => (inputFile?.current as unknown as any).click()}>Load ...</DemoButton>
	</>
}

class SystemWidget extends React.Component<{ engine: DiagramEngine }, { model: SystemDiagramModel; }> {
	engine: DagreEngine;

	constructor(props: any) {
		super(props);
		console.info(JSON.stringify(Demo));
		const model = new SystemDiagramModel(Demo);
		props.engine.setModel(model);
		this.engine = new DagreEngine({
			graph: {
				rankdir: 'LR',
				ranker: 'longest-path',
				marginx: 25,
				marginy: 25
			},
			includeLinks: false
		});

		this.state = {
			model
		}
	}

	autoDistribute = () => {
		this.engine.redistribute(this.state.model);
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
		let app = this.state.model.getApplication();
		let eventBusStartCommand = app.components[1].commands?.start!;
		let eventBusStart = new JavaScriptExecutor().runner(eventBusStartCommand.steps);
		let d = new TextDecoder();
		let instance = eventBusStart({ id: 'thisEnvironment' });
		instance.channels.out.onReceive = (data: Uint8Array | null) => {
			if (data) {
				console.info(d.decode(data));
			}
			return true;
		};

		instance.run(['Hello', 'world!']);
	}

	stopAll = () => {
		let app = this.state.model.getApplication();
		let eventBusStopCommand = app.components[1].commands?.stop!;
		let eventBusStop = new JavaScriptExecutor().runner(eventBusStopCommand.steps);
		let d = new TextDecoder();
		let instance = eventBusStop({ id: 'thisEnvironment' });
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
			<DemoWorkspaceWidget buttons={<><DemoButton onClick={this.autoDistribute}>Re-distribute</DemoButton><LoadButton onModelChange={(model) => {
				this.props.engine.setModel(model);
				this.setState({ model }, () => {
					this.autoDistribute();
				})
			}} /><DemoButton onClick={this.startAll}>Start All</DemoButton><DemoButton onClick={this.stopAll}>Stop All</DemoButton></>}>
				<DemoCanvasWidget>
					<CanvasWidget engine={this.props.engine} />
				</DemoCanvasWidget>
			</DemoWorkspaceWidget>
		);
	}
}

function App() {
	let engine = createEngine();
	engine.getNodeFactories().registerFactory(new ComponentNodeFactory());

	return <SystemWidget engine={engine} />;
}

export default App;
