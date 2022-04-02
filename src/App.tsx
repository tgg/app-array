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
import { LoadButton } from './Components/Toolbar/LoadButton';
import { ClearButton } from './Components/Toolbar/ClearButton';
import { KeepModelCheckbox } from './Components/Toolbar/KeepModelCheckbox';
import { CacheInfo, LOCAL_STORAGE_NAME } from './Model/CacheInfo';
import { AppArray } from './Model/Model';
import { SystemDiagramModel } from './Model/SystemDiagramModel';
import { ConnectedStatusText } from './Components/StatusBar/ConnectedStatusText';

class SystemWidget extends React.Component<{ engine: DiagramEngine }, { model: DiagramModel, checked: boolean }> {
	engine: DagreEngine;
	cacheInfo: CacheInfo;

	constructor(props: any) {
		super(props);
		const cacheInfoValue = localStorage.getItem(LOCAL_STORAGE_NAME.CACHE);
		this.cacheInfo = cacheInfoValue !== null ? new CacheInfo(JSON.parse(cacheInfoValue)) : new CacheInfo(null);
		
		let model = new DiagramModel();

		if(this.cacheInfo.model !== "") {
			const application = JSON.parse(this.cacheInfo.model as string) as AppArray.Model.Application;
			model = new SystemDiagramModel(application);
		}
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
			model,
			checked: !this.cacheInfo.keepModel
		};
	}

	updateCacheModel = () => {
		if (this.cacheInfo.keepModel && this.state.model instanceof SystemDiagramModel) {
			const systemModel = this.state.model as SystemDiagramModel;
			this.cacheInfo.model = JSON.stringify(systemModel.getApplication());
		}
		else {
			this.cacheInfo.model = "";
		}
		this.cacheInfo.save();
	};

	onModelChange = (model: DiagramModel) => {
		this.props.engine.setModel(model);
		this.setState({ model }, () => {
			this.autoDistribute();
		});
		this.updateCacheModel();
	};

	onCheckBoxChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState(state => ({
			checked: !event.target.checked
		}));
		this.cacheInfo.keepModel = this.state.checked;
		this.updateCacheModel();
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
					<KeepModelCheckbox checked={!this.state.checked} onChange={this.onCheckBoxChanged} />
					</>
				}
				statusItems={
					<>
					<ConnectedStatusText></ConnectedStatusText>
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
