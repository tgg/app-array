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
import { CustomCheckbox } from './Components/Toolbar/CustomCheckbox';
import { CacheInfo, LOCAL_STORAGE_NAME } from './Model/CacheInfo';
import { AppArray } from './Model/Model';
import { SystemDiagramModel } from './Model/SystemDiagramModel';
import { ConnectedStatusText } from './Components/StatusBar/ConnectedStatusText';
import { ModelService } from './Service/ModelService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export interface SystemWidgetProps {
	diagramEngine: DiagramEngine;
	cacheInfo: CacheInfo;
}

export interface SystemWidgetState {
	model: DiagramModel;
	checked: boolean;
	disconnected: boolean;
	connected: boolean;
	connectionInfo: String;
}

class SystemWidget extends React.Component<SystemWidgetProps, SystemWidgetState> {
	distributionEngine: DagreEngine;
	modelService: ModelService;

	constructor(props: any) {
		super(props);
		this.props.cacheInfo.host = "http://localhost:9090";
		this.modelService = new ModelService(this.props.cacheInfo, this.onConnected, this.onConnectionError, this.onModelSaved);
		
		let model = new DiagramModel();
		
		this.distributionEngine = new DagreEngine({
			graph: {
				rankdir: 'LR',
				ranker: 'longest-path',
				marginx: 25,
				marginy: 25
			},
			includeLinks: false
		});
		this.props.diagramEngine.setModel(model)

		this.state = {
			model,
			checked: !this.props.cacheInfo.keepModel,
			connected: false,
			disconnected: !this.props.cacheInfo.disconnected,
			connectionInfo: this.props.cacheInfo.host,
		};
	}

	onConnected = () => {
		toast.success("Connected")
		this.setState({connected: true, connectionInfo: this.props.cacheInfo.host});
		this.modelService.sendModel(this.state.model);
	}

	onConnectionError = (err: any) => {
		toast.error("Connection lost to " + this.props.cacheInfo.host)
		this.setState({connected: false, connectionInfo: `${err} on ${this.props.cacheInfo.host}`});
	}

	onModelSaved = (valid: boolean, path: String) => {
		if(valid) {
			this.props.cacheInfo.path = path;
		}
		else if(this.state.model instanceof SystemDiagramModel) {
			const systemModel = this.state.model as SystemDiagramModel;
			this.props.cacheInfo.path = `/${systemModel.getApplication().id}`;
		}
		this.props.diagramEngine.setModel(this.state.model);
		this.updateCacheModel();
		setTimeout(() => {
			this.autoDistribute();
		}, 1000);
	}

	updateCacheModel = () => {
		if (this.props.cacheInfo.keepModel && this.state.model instanceof SystemDiagramModel) {
			const systemModel = this.state.model as SystemDiagramModel;
			this.props.cacheInfo.model = JSON.stringify(systemModel.getApplication());
		}
		else {
			this.props.cacheInfo.model = "";
		}
		this.props.cacheInfo.save();
	};

	onModelChange = async (model: DiagramModel) => {
		this.setState({ model });
		await this.modelService.sendModel(model);
	};

	onKeepModelChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState(state => ({
			checked: !event.target.checked
		}));
		this.props.cacheInfo.keepModel = this.state.checked;
		this.updateCacheModel();
	}

	updateDisconnected = async () => {
		if (this.props.cacheInfo.disconnected) {
			await this.modelService.disconnect();
		}
		else {
			await this.modelService.connect();
		}
		this.props.cacheInfo.save();
	};

	onDisconnectedChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState(state => ({
			disconnected: !event.target.checked
		}));
		this.props.cacheInfo.disconnected = this.state.disconnected;
		this.updateDisconnected();
	}

	componentDidMount = async () => {
		await this.updateDisconnected();

		if(this.props.cacheInfo.model !== "") {
			const application = JSON.parse(this.props.cacheInfo.model as string) as AppArray.Model.Application;
			const model = new SystemDiagramModel(application);
			this.setState({ model })
			this.modelService.sendModel(model);
		}
	}

	autoDistribute = () => {
		this.distributionEngine.redistribute(this.state.model);
		this.reroute();
		this.props.diagramEngine.repaintCanvas();
	};

	reroute() {
		this.props.diagramEngine
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
					<ToastContainer />
					<CustomCheckbox checked={!this.state.checked} onChange={this.onKeepModelChanged} label="Keep model" />
					<CustomCheckbox checked={!this.state.disconnected} onChange={this.onDisconnectedChanged} label="Disconnected" />
					</>
				}
				statusItems={
					<>
					<ConnectedStatusText isConnected={this.state.connected} path={this.state.connectionInfo}></ConnectedStatusText>
					</>
				}>
				<DemoCanvasWidget>
					<CanvasWidget engine={this.props.diagramEngine} />
				</DemoCanvasWidget>
			</DemoWorkspaceWidget>
		);
	}
}

function App() {
	const cacheInfoValue = localStorage.getItem(LOCAL_STORAGE_NAME.CACHE);
	const cacheInfo = cacheInfoValue !== null ? new CacheInfo(JSON.parse(cacheInfoValue)) : new CacheInfo(null);
	let engine = createEngine();
	engine.getNodeFactories().registerFactory(new ComponentNodeFactory(cacheInfo));

	return <SystemWidget diagramEngine={engine} cacheInfo={cacheInfo} />;
}

export default App;
