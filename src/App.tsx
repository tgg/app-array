import React from 'react';
import './App.css';
import createEngine, {
	DagreEngine,
	DiagramEngine,
	DiagramModel,
	PathFindingLinkFactory
} from '@projectstorm/react-diagrams';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
import { ComponentNodeModel } from './Components/Diagram/ComponentNodeModel';
import { EnvironmentComboBox } from './Components/StatusBar/EnvironmentComboBox';
import { Environment, environmentsToOptions } from './Model/Environment';

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
	environments: any;
	environment: String;
}

class SystemWidget extends React.Component<SystemWidgetProps, SystemWidgetState> {
	distributionEngine: DagreEngine;
	modelService: ModelService;
	init: boolean;

	constructor(props: any) {
		super(props);
		this.init = true;
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
			environments: [],
			environment: "",
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
		let appEnvs:Environment[] | undefined;
		if(valid) {
			this.props.cacheInfo.path = path;
		}
		if(this.state.model instanceof SystemDiagramModel) {
			const systemModel = this.state.model as SystemDiagramModel;
			this.props.cacheInfo.path = `/${systemModel.getApplication().id}`;
			appEnvs = systemModel.getApplication().environments;
		}
		if(!this.init) {
			this.props.diagramEngine.setModel(this.state.model);
			this.setState({environments: environmentsToOptions(appEnvs) });
			this.updateCacheModel();
		} else {
			this.init = false;
		}
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

	onModelChange = (model: DiagramModel) => {
		this.setState({ model }, async () => {
			await this.modelService.sendModel(model);
		});
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
		this.updateNodes();
	}

	onEnvironmentChanged = (value: any, action: any) => {
		this.setState({ environment: value.value }, () => {
			this.updateNodes();
		});
	}

	setCacheModel = () => {
		if(this.props.cacheInfo.model !== "") {
			const application = JSON.parse(this.props.cacheInfo.model as string) as AppArray.Model.Application;
			const model = new SystemDiagramModel(application);
			this.setState({ model }, () => {
				this.modelService.sendModel(model);
			})
		}
	}

	componentDidMount = async () => {
		if(!this.props.cacheInfo.disconnected)
		{
			await this.updateDisconnected();
			if(!this.state.connected)
			{
				this.onModelSaved(false, "");
			}
			this.setCacheModel();
		}
		else 
		{
			this.onModelSaved(false, "");
			this.setCacheModel();
		}
	}

	async componentWillUnmount() {
		await this.modelService.disconnect();
	}

	updateNodes = () => {
		const model = this.props.diagramEngine.getModel();
		const nodes = model.getNodes();
		nodes.forEach((val, i, arr) => {
			const node = val as ComponentNodeModel;
			if(node.widget)
				node.widget.onDisconnected();
		});
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
					<EnvironmentComboBox environments={this.state.environments} onChange={this.onEnvironmentChanged}></EnvironmentComboBox>
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
	const factory = new ComponentNodeFactory(cacheInfo);
	engine.getNodeFactories().registerFactory(factory);

	return <SystemWidget diagramEngine={engine} cacheInfo={cacheInfo} />;
}

export default App;
