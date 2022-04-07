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
import { EnvironmentComboBox, EnvironmentOptions } from './Components/StatusBar/EnvironmentComboBox';
import { Environment, environmentsToOptions } from './Model/Environment';

export interface SystemWidgetProps {
	diagramEngine: DiagramEngine;
	cache: CacheInfo;
}

export interface SystemWidgetState {
	model: DiagramModel;
	checked: boolean;
	disconnected: boolean;
	connected: boolean;
	connectionInfo: String;
	environments: any;
	environment: EnvironmentOptions | undefined | null;
	path: String;
}

class SystemWidget extends React.Component<SystemWidgetProps, SystemWidgetState> {
	distributionEngine: DagreEngine;
	modelService: ModelService;
	init: boolean;

	constructor(props: any) {
		super(props);
		this.init = true;
		this.props.cache.host = "http://localhost:9090";
		this.modelService = new ModelService(this.props.cache, this.onConnected, this.onConnectionError, this.onModelSaved);
		
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
			checked: !this.props.cache.keepModel,
			connected: false,
			disconnected: !this.props.cache.disconnected,
			connectionInfo: this.props.cache.host,
			environments: [],
			environment: undefined,
			path: "",
		};
	}

	onConnected = () => {
		toast.success("Connected")
		this.setState({connected: true, connectionInfo: this.props.cache.host});
		this.modelService.sendModel(this.state.model);
	}

	onConnectionError = (err: any) => {
		toast.error("Connection lost to " + this.props.cache.host)
		this.setState({connected: false, connectionInfo: `${err} on ${this.props.cache.host}`});
	}

	onModelSaved = (valid: boolean, paths: String[]) => {
		let appEnvs:Environment[] | undefined;
		if(this.state.model instanceof SystemDiagramModel) {
			const systemModel = this.state.model as SystemDiagramModel;
			appEnvs = systemModel.getApplication().environments;
		}
		if(!this.init) {
			this.props.diagramEngine.setModel(this.state.model);
			const environments = environmentsToOptions(paths, appEnvs);
			const env = environments.find(e => e.path === this.state.path);
			if(env !== undefined) {
				this.setState({environment: env, path: env.path, environments: environments });
			}
			else {
				this.setState({environment: null, path: "", environments: environments });
			}
			this.updateCacheModel();
		} else {
			this.init = false;
		}
		setTimeout(() => {
			this.autoDistribute();
		}, 1000);
	}

	updateCacheModel = () => {
		if (this.props.cache.keepModel && this.state.model instanceof SystemDiagramModel) {
			const systemModel = this.state.model as SystemDiagramModel;
			this.props.cache.model = JSON.stringify(systemModel.getApplication());
		}
		else {
			this.props.cache.model = "";
		}
		this.props.cache.save();
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
		this.props.cache.keepModel = this.state.checked;
		this.updateCacheModel();
	}

	updateDisconnected = async () => {
		if (this.props.cache.disconnected) {
			await this.modelService.disconnect();
		}
		else {
			await this.modelService.connect();
		}
		this.props.cache.save();
	};

	onDisconnectedChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState(state => ({
			disconnected: !event.target.checked
		}));
		this.props.cache.disconnected = this.state.disconnected;
		this.updateDisconnected();
		this.updateNodes();
	}

	onEnvironmentChanged = (value: any, action: any) => {
		this.setState({ environment: value, path: value !== null ? value.path : "" }, () => {
			this.updateNodes();
		});
	}

	setCacheModel = () => {
		if(this.props.cache.model !== "") {
			const application = JSON.parse(this.props.cache.model as string) as AppArray.Model.Application;
			const model = new SystemDiagramModel(application);
			this.setState({ model }, () => {
				this.modelService.sendModel(model);
			})
		}
	}

	componentDidMount = async () => {
		if(!this.props.cache.disconnected)
		{
			await this.updateDisconnected();
			if(!this.state.connected)
			{
				this.onModelSaved(false, []);
			}
			this.setCacheModel();
		}
		else 
		{
			this.onModelSaved(false, []);
			this.setCacheModel();
		}
	}

	async componentWillUnmount() {
		await this.modelService.disconnect();
	}

	updateNodes = () => {
		const model = this.props.diagramEngine.getModel();
		if(model instanceof SystemDiagramModel) {
			const systemModel = model as SystemDiagramModel;
			const nodes = systemModel.getNodes();
			nodes.forEach((val, i, arr) => {
				const node = val as ComponentNodeModel;
				node.environment = systemModel.getApplication().environments?.find(e => e.id === this.state.environment?.value);
				node.path = this.state.environment?.path;
				if(node.widget)
					node.widget.updateConnection();
			});
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
					<EnvironmentComboBox environments={this.state.environments} onChange={this.onEnvironmentChanged} value={this.state.environment}></EnvironmentComboBox>
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
					<ConnectedStatusText isConnected={this.state.connected} host={this.state.connectionInfo} path={this.state.path}></ConnectedStatusText>
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

	return <SystemWidget diagramEngine={engine} cache={cacheInfo} />;
}

export default App;
