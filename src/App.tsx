import React from 'react';
import './App.css';
import createEngine, {
	DagreEngine,
	DiagramEngine,
	DiagramModel,
	PathFindingLinkFactory
} from '@projectstorm/react-diagrams';
import { CanvasWidget } from '@projectstorm/react-canvas-core';

import { DemoButton, DemoWorkspaceWidget } from './Components/DemoWorkspaceWidget';
import { DemoCanvasWidget } from './Components/DemoCanvasWidget';
import { ComponentNodeFactory } from './Components/Diagram/ComponentNodeFactory';
import { LoadButton } from './Components/LoadButton';
import { ClearButton } from './Components/ClearButton';
import KeepModelCheckbox from './Components/KeepModelCheckbox';
import { AppArray } from './Model/CacheInfo';

class SystemWidget extends React.Component<{ engine: DiagramEngine }, { model: DiagramModel }> {
	engine: DagreEngine;
	cacheInfo: AppArray.CacheInfo;

	constructor(props: any) {
		super(props);
		const model = new DiagramModel();
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

		const cacheInfoValue = localStorage.getItem(AppArray.LOCAL_STORAGE_NAME.CACHE);
		this.cacheInfo = cacheInfoValue !== null ? new AppArray.CacheInfo(JSON.parse(cacheInfoValue)) : new AppArray.CacheInfo(null);

		this.state = {
			model
		}
	}

	onModelChange = (model: DiagramModel) => {
		this.props.engine.setModel(model);
		this.setState({ model }, () => {
			this.autoDistribute();
		})
	};

	onCheckBoxChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
		let checked = event.target.checked;
		this.cacheInfo!.keepModel = checked;
		this.cacheInfo!.save();
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
					<LoadButton onModelChange={(model) => this.onModelChange(model)}/>
					<ClearButton onModelChange={(model) => this.onModelChange(model)}/>
				</>}
				options={
					<>
					<KeepModelCheckbox checked={this.cacheInfo.keepModel} onChange={this.onCheckBoxChanged} />
					</>
				}>
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
