import React, { useState } from 'react';
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
import { ComponentService } from './Service/ComponentService';
import { CommandDownloadResponse, CommandResponse, JsonType, ResponseFactory, TokenResponse, UpdateResponse } from './Model/Communication/Response';
import { AuthenticationPopup, AuthenticationPopupState } from './Components/AuthenticationPopup';

export interface SystemWidgetProps {
	diagramEngine: DiagramEngine;
	cache: CacheInfo;
}

export interface SystemWidgetState {
	model: DiagramModel;
	checked: boolean;
	disconnected: boolean;
	connectedModel: boolean;
	connectedComponent: boolean;
	connectionInfoModel: String;
	connectionInfoComponent: String;
	environments: any;
	environment: EnvironmentOptions | undefined | null;
	path: String;
	displayPopup: boolean;
}

class SystemWidget extends React.Component<SystemWidgetProps, SystemWidgetState> {
	distributionEngine: DagreEngine;
	modelService: ModelService;
	componentService: ComponentService;
	init: boolean;

	constructor(props: any) {
		super(props);
		this.init = true;
		this.props.cache.host = this.props.cache.host == "" ? process.env.REACT_APP_BACKEND_HOST! : this.props.cache.host;
		this.modelService = new ModelService(this.props.cache, this.onModelServiceConnected, this.onModelServiceConnectionError, this.onModelSaved);
		this.componentService = new ComponentService(this.props.cache, this.onComponentServiceConnected, this.onComponentServiceError, 
															this.getCommandResult, this.onStatusUpdated, this.onCredentialResponse, this.tokenReceived);
		
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
			connectedModel: false,
			connectedComponent: false,
			disconnected: !this.props.cache.disconnected,
			connectionInfoModel: this.props.cache.host,
			connectionInfoComponent: this.props.cache.host,
			environments: [],
			environment: undefined,
			path: "",
			displayPopup: false,
		};
	}

	onModelServiceConnected = () => {
		toast.success("Connected")
		this.setState({connectedModel: true, connectionInfoModel: this.props.cache.host});
		this.modelService.sendModel(this.state.model);
	}

	onModelServiceConnectionError = (err: any) => {
		toast.error("Connection lost to " + this.props.cache.host)
		this.setState({connectedModel: false, connectionInfoModel: `${err} on ${this.props.cache.host}`});
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

	onComponentServiceConnected = () => {
		toast.success(`Connected to ${this.props.cache.path}`);
		this.setState({connectedComponent: true});
	}
	
	onComponentServiceError = (err: any) => {
		toast.error(`Failed to connect to ${this.props.cache.path}`);
		this.setState({connectedComponent: false});
	}

	getCommandResult = (payload: any) => {
		const resp = new ResponseFactory().buildHubResponse(payload);
		if(resp.type === JsonType.TypeCommandResponse) {
			const updateResponse = new ResponseFactory().buildInnerResponse<CommandResponse>(payload);
			this.updateNodes((node: ComponentNodeModel) => {
				if(updateResponse.componentId === node.component.id && node.widget)
					node.widget.getCommandResult(updateResponse);
			})
		} else if(resp.type === JsonType.TypeCommandDownloadResponse) {
			const downloadResponse = new ResponseFactory().buildInnerResponse<CommandDownloadResponse>(payload);
			this.updateNodes((node: ComponentNodeModel) => {
				if(downloadResponse.componentId === node.component.id && node.widget)
					node.widget.downloadFile(downloadResponse);
			})
		}
	}

	onStatusUpdated = (payload: any) => {
		const resp = new ResponseFactory().buildHubResponse(payload);
		if(resp.type === JsonType.TypeUpdate) {
			const updateResponse = new ResponseFactory().buildInnerResponse<UpdateResponse>(payload);
			this.updateNodes((node: ComponentNodeModel) => {
				if(updateResponse.componentId === node.component.id && node.widget)
					node.widget.onStatusUpdated(updateResponse);
			})
		} else if (resp.type === JsonType.TypeInfo) {
			toast.info(resp.msg);
		} else {
			console.log(resp.msg);
		}
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
			await this.componentServiceDisconnect();
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

	componentServiceDisconnect =  async () => {
		if(this.state.connectedComponent) {
			await this.componentService.disconnect();
			this.updateNodes(this.initializeNodeConnection);
		}
	}

	updateDisconnected = async () => {
		if (this.props.cache.disconnected) {
			await this.modelService.disconnect();
			await this.componentServiceDisconnect();
		}
		else {
			await this.modelService.connect();
			if(this.state.path.trim() !== "") {
                await this.componentService.connect();
				this.updateNodes(this.initializeNodeConnection);
			}
		}
		this.props.cache.save();
	};

	onDisconnectedChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState(state => ({
			disconnected: !event.target.checked
		}));
		this.props.cache.disconnected = this.state.disconnected;
		this.updateDisconnected();
	}

	onEnvironmentChanged = (value: any, action: any) => {
		this.setState({ environment: value, path: value !== null ? value.path : "" }, async () => {
			await this.componentServiceDisconnect();
			this.props.cache.path = this.state.path;
			if(this.state.path.trim() !== "" && !this.props.cache.disconnected) {
				await this.componentService.connect();
				this.updateNodes(this.initializeNodeConnection);
			}
		});
	}

	submitClearCredentials = (creds: any) => {
		this.setState({displayPopup: false});
		if(this.state.connectedComponent) {
			this.componentService.sendTextCredentials(creds);
		}
	}

	submitVaultCredentials = (creds: any) => {
		this.setState({displayPopup: false});
		if(this.state.connectedComponent) {
			this.componentService.sendVaultCredentials(creds);
		}
	}

	closeCredentials = () => {
		this.setState({displayPopup: false});
	}

	onCredentialResponse = (payload: any) => {
		const resp = new ResponseFactory().buildHubResponse(payload);
		if(resp.type === JsonType.TypeCredentialResponse) {
			toast.warn(resp.msg);
			if(this.props.cache.hasTokenAndKey()) {
				this.setState({displayPopup: true});
			} else if(this.state.connectedComponent) {
				toast.warn("No token & key found, requesting...");
				this.componentService.requestToken();
			}
		}
	}

	tokenReceived = (payload: any) => {
		const resp = new ResponseFactory().buildHubResponse(payload);
		if(resp.type === JsonType.TypeTokenResponse) {
			const tokenResp = new ResponseFactory().buildInnerResponse<TokenResponse>(payload);
			this.props.cache.encryptionKey = tokenResp.publicKey;
			this.props.cache.token = tokenResp.token;
			this.props.cache.save();
			this.setState({displayPopup: true});
		}
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
			if(!this.state.connectedModel)
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

	initializeNodeConnection = (node: ComponentNodeModel) => {
		node.service = this.componentService;
		if(node.widget)
			node.widget.updateConnection();
	}

	updateNodes = (nodeAction: (node: ComponentNodeModel) => void) => {
		const model = this.props.diagramEngine.getModel();
		if(model instanceof SystemDiagramModel) {
			const systemModel = model as SystemDiagramModel;
			const nodes = systemModel.getNodes();
			nodes.forEach((val, i, arr) => {
				const node = val as ComponentNodeModel;
				nodeAction(node);
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
					<ConnectedStatusText justDot isConnected={this.state.connectedComponent} host={this.state.connectionInfoComponent} path={this.state.path}></ConnectedStatusText>
					<ConnectedStatusText isConnected={this.state.connectedModel} host={this.state.connectionInfoModel} path=""></ConnectedStatusText>
					</>
				}>
				<DemoCanvasWidget>
					<CanvasWidget engine={this.props.diagramEngine} />
				</DemoCanvasWidget>
				{this.state.displayPopup && <AuthenticationPopup submitVaultCredentials={this.submitVaultCredentials} submitClearCredentials={this.submitClearCredentials} closeCredentials={this.closeCredentials}></AuthenticationPopup>}
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
