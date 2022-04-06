import * as React from 'react';
import * as signalr from '@microsoft/signalr';
import { DiagramEngine} from '@projectstorm/react-diagrams';
import { map } from 'lodash';
import { toast } from 'react-toastify';
import { ComponentNodeModel } from './ComponentNodeModel';
import { Context, Environment } from '../../Model/Environment';
import { Executor, ShellExecutor } from '../../Service/Executor';
import { CacheInfo } from '../../Model/CacheInfo';
import { KeyCommand } from '../../Model/Model';
import { ConnectedStatusText } from '../StatusBar/ConnectedStatusText';
import { ComponentService } from '../../Service/ComponentService';
import { CommandResponse, JsonType, ResponseFactory, UpdateResponse, UpdateStatus } from '../../Model/Communication/Response';
import { isThisTypeNode } from 'typescript';

const styled_1  = require("@emotion/styled");
const DefaultPortLabelWidget_1 = require("@projectstorm/react-diagrams/")

enum ComponentStyleStatus {
	UNKNOWN = "UNKNOWN",
	STOPPING = "STOPPING",
	STARTING = "STARTING",
	STARTED = "STARTED",
	STOPPED = "STOPPED",
	CHECKING = "CHECKING",
}

export interface ComponentNodeWidgetProps {
	node: ComponentNodeModel;
	engine: DiagramEngine;
	cache: CacheInfo;
}

export interface ComponentNodeWidgetState {
	connected: boolean;
	status: ComponentStyleStatus;
}

export class ComponentNodeWidget extends React.Component<ComponentNodeWidgetProps, ComponentNodeWidgetState>  {
	Border = styled_1.default.div `
	
	`;
	Node = styled_1.default.div `
		background-clip: content-box;
		background-color: ${(p: { background: any; }) => p.background};
		border-radius: 5px;
		font-family: sans-serif;
		color: white;
		overflow: visible;
		font-size: 11px;
		
	`;
	Title = styled_1.default.div `
		background: rgba(0, 0, 0, 0.3);
		display: flex;
		white-space: nowrap;
		justify-items: center;
	`;
    TitleName = styled_1.default.div `
		flex-grow: 1;
		padding: 5px 5px;
	`;
    Ports = styled_1.default.div `
		display: flex;
		background-image: linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2));
	`;
    PortsContainer = styled_1.default.div `
		flex-grow: 1;
		display: flex;
		flex-direction: column;

		&:first-of-type {
			margin-right: 10px;
		}

		&:only-child {
			margin-right: 0px;
		}
	`;
	PortLabel = styled_1.default.div `
		display: flex;
		margin-top: 1px;
		align-items: center;
	`;
    Label = styled_1.default.div `
		padding: 0 5px;
		flex-grow: 1;
	`;
    Port = styled_1.default.div `
		width: 15px;
		height: 15px;
		background: rgba(255, 255, 255, 0.1);

		&:hover {
			background: rgb(192, 255, 0);
		}
	`;
	ButtonsPanel = styled_1.default.div `
		display: flex;
		
	`;
	Button_start = styled_1.default.button `
		background-color: rgba(255, 100, 100, 0);;
		border: none;
		color: white;
		cursor: pointer;
		font-size:22px;
		&:hover {
			color: #499F36;
		}
	`;
	Button_stop = styled_1.default.button `
		background-color: rgba(255, 100, 100, 0);;
		border: none;
		color: white;
		cursor: pointer;
		font-size:22px;
		&:hover {
			color: #cf142b;
		}
	`;
	Button_status = styled_1.default.button `
		background-color: rgba(255, 100, 100, 0);;
		border: none;
		color: white;
		cursor: pointer;
		font-size:22px;
		&:hover {
			color: blue;
		}
	`;
	Icon = styled_1.default('i')`
	`;

	
	private hasStart:boolean;
	private hasStop:boolean;
	private hasStatus:boolean;

	private executor?: Executor<Uint8Array,any>;
	private componentService?: ComponentService;
	generatePort: (port: any) => React.FunctionComponentElement<{ engine: DiagramEngine; port: any; key: any; }>;

	constructor(args: ComponentNodeWidgetProps | Readonly<ComponentNodeWidgetProps>) {
        super(args);
		this.props.node.widget = this;
        this.generatePort = (port) => {
            return React.createElement(DefaultPortLabelWidget_1.DefaultPortLabel, { engine: this.props.engine, port: port, key: port.getID() });
        };
		this.hasStart = this.props.node.hasCommand(KeyCommand.START);
		this.hasStop = this.props.node.hasCommand(KeyCommand.STOP);
		this.hasStatus = this.props.node.hasCommand(KeyCommand.STATUS);

		if(this.props.node.hasEnvironment()) {
			this.componentService = new ComponentService(this.props.cache, this.props.node.component, this.onConnected, this.onError, this.getCommandResult, this.onStatusUpdated);
			this.executor = new ShellExecutor(this.componentService);
		}

		this.state = {
			status: ComponentStyleStatus.UNKNOWN,
			connected: false
		}
    }

	getCommandResult = (payload: any) => {
		const resp = new ResponseFactory().buildInnerResponse<CommandResponse>(payload);
		switch(resp.commandId) {
			case KeyCommand.START:
			case KeyCommand.STATUS:
				this.setState({ status: resp.status == UpdateStatus.StatusOk ? ComponentStyleStatus.STARTED : ComponentStyleStatus.STOPPED });
				break;
			case KeyCommand.STOP:
				this.setState({ status: resp.status == UpdateStatus.StatusOk ? ComponentStyleStatus.STOPPED : ComponentStyleStatus.UNKNOWN });
				break;
		}
		console.log(`Received result ${resp.result} for command ${resp.command} for component ${resp.componentId}`);
	}

	onStatusUpdated = (payload: any) => {
		const resp = new ResponseFactory().buildHubResponse(payload);
		if(resp.type === JsonType.TypeUpdate) {
			const updateResponse = new ResponseFactory().buildInnerResponse<UpdateResponse>(payload);
			if(updateResponse.componentId === this.props.node.component.id) {
				this.setState({ status: updateResponse.status == UpdateStatus.StatusOk ? ComponentStyleStatus.STARTED : ComponentStyleStatus.STOPPED });
			}
		} else {
			console.log(resp.msg);
		}
	}

	onConnected = () => {
		toast.success(`Component connected ${this.props.node.component.id} to ${this.props.cache.path}`);
		this.setState({connected: true});
	}
	
	onError = (err: any) => {
		toast.error(`Component ${this.props.node.component.id} failed to connect to ${this.props.cache.path} : ${err}`);
		this.setState({connected: false});
	}
	
	start = () => {
		if(!this.props.node.hasEnvironment())
			return;
		let cmd = this.props.node.component.commands?.start!;
		this.setState({status: ComponentStyleStatus.STARTING});
		let runner = this.executor!.runner(KeyCommand.START, cmd.steps);
		let d = new TextDecoder();
		let context = { test: new Map<string, string>() }
		let instance = runner({ id: 'thisEnvironment', context });
		instance.channels.out.onReceive = (data: Uint8Array | null) => {
			if (data) {
				console.info(d.decode(data));
			}
			return true;
		};
		
		instance.run([]);
	}

	stop = () => {
		if(!this.props.node.hasEnvironment())
			return;
		let cmd = this.props.node.component.commands?.stop!;
		this.setState({status: ComponentStyleStatus.STOPPING});
		let runner = this.executor!.runner(KeyCommand.STOP, cmd.steps);
		let d = new TextDecoder();
		let context = { test: new Map<string, string>() }
		let instance = runner({ id: 'thisEnvironment', context });
		instance.channels.out.onReceive = (data: Uint8Array | null) => {
			if (data) {
				console.info(d.decode(data));
			}
			return true;
		};
		
		instance.run([]);
	}

	status = () => {
		if(!this.props.node.hasEnvironment())
			return;
		let cmd = this.props.node.component.commands?.status!;
		this.setState({status: ComponentStyleStatus.CHECKING});
		let runner = this.executor!.runner(KeyCommand.STATUS, cmd.steps);
		let d = new TextDecoder();
		let context = { test: new Map<string, string>() }
		let instance = runner({ id: 'thisEnvironment', context });
		instance.channels.out.onReceive = (data: Uint8Array | null) => {
			if (data) {
				console.info(d.decode(data));
			}
			return true;
		};
		
		instance.run([]);
	}

	async componentDidMount() {
		if(this.props.node.hasEnvironment())
			await this.componentService!.connect();
	}

	async componentWillUnmount() {
		if(this.props.node.hasEnvironment())
			this.componentService!.disconnect();
	}

	onDisconnected = () => {
		if(!this.props.node.hasEnvironment())
			return;
		if (this.props.cache.disconnected) {
			this.componentService!.disconnect();
		}
		else {
			this.componentService!.connect();
		}
	}

	render() {
        return (
				<this.Border className={this.state.status}>
					<this.Node
						background={this.props.node.getOptions().color}
						selected={this.props.node.isSelected()}
						data-default-node-name={this.props.node.getOptions().name}>

						<this.Title>
							<this.TitleName>{this.props.node.getOptions().name}</this.TitleName>
							<ConnectedStatusText justDot={true} isConnected={this.state.connected} path={this.props.cache.path}></ConnectedStatusText>
						</this.Title>

						<this.Ports>
							<this.PortsContainer>
								{map(this.props.node.getInPorts(), this.generatePort)}
							</this.PortsContainer>

							<this.PortsContainer>
								{map(this.props.node.getOutPorts(), this.generatePort)}
							</this.PortsContainer>

						</this.Ports>

						<this.ButtonsPanel>
							{this.hasStart &&
								<this.Button_start onClick={this.start}>
									<this.Icon className="fa fa-play-circle"></this.Icon>
								</this.Button_start>
							}

							{this.hasStop &&
								<this.Button_stop onClick={this.stop}>
									<this.Icon className="fa fa-stop-circle"></this.Icon>
								</this.Button_stop>
							}

							{this.hasStatus &&
								<this.Button_status onClick={this.status}>
									<this.Icon className="fa fa-question-circle"></this.Icon>
								</this.Button_status>
							}
							
						</this.ButtonsPanel>


					</this.Node>
				</this.Border>);
    }
	
}
