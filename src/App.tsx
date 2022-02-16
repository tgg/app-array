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

	render() {
		return (
			<DemoWorkspaceWidget buttons={
				<>
					<DemoButton onClick={this.autoDistribute}>Re-distribute</DemoButton>
					<LoadButton onModelChange={(model) => {
						this.props.engine.setModel(model);
						this.setState({ model }, () => {
							this.autoDistribute();
						})
					}}/>
				</>}>
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
