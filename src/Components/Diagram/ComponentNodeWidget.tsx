import * as React from 'react';
import { DiagramEngine} from '@projectstorm/react-diagrams';
import { map } from 'lodash';
import { toast } from 'react-toastify';
import { ComponentNodeModel } from './ComponentNodeModel';
import { Executor, ShellExecutor } from '../../Service/Executor';
import { CacheInfo } from '../../Model/CacheInfo';
import { AppArray, KeyCommand } from '../../Model/Model';
import { ComponentService } from '../../Service/ComponentService';
import { CommandDownloadResponse, CommandResponse, JsonType, ResponseFactory, UpdateResponse, UpdateStatus } from '../../Model/Communication/Response';

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
	Button_website = styled_1.default.button `
		background-color: rgba(255, 100, 100, 0);;
		border: none;
		color: white;
		cursor: pointer;
		font-size:22px;
		&:hover {
			color: purple;
		}
	`;
	Button_other = styled_1.default.button `
		background-color: rgba(255, 100, 100, 0);;
		border: none;
		color: white;
		cursor: pointer;
		font-size:20px;
		&:hover {
			color: blue;
		}
	`;
	Icon = styled_1.default('i')`
	`;

	
	private hasStart:boolean;
	private hasStop:boolean;
	private hasStatus:boolean;
	private hasDownload:boolean;
	private hasWebsite:boolean;

	private hasTerminal:boolean;

	private executor?: Executor<Uint8Array,any>;
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
		this.hasDownload = this.props.node.hasCommand(KeyCommand.DOWNLOAD);
		this.hasWebsite = this.props.node.hasCommand(KeyCommand.WEBSITE);
		this.hasTerminal = this.props.node.hasCommand(KeyCommand.TERMINAL);


		this.state = {
			status: ComponentStyleStatus.UNKNOWN,
			connected: false
		}
    }

	initializeConnection = async () => {
		if(this.executor !== undefined && this.state.connected) {
			this.executor = undefined;
			this.setState({connected: false});
		} else if(this.props.node.hasService() && !this.state.connected) {
			this.executor = new ShellExecutor(this.props.node);
			this.setState({connected: true});
		}
	}

	getCommandResult = (resp: CommandResponse) => {
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

	downloadFile = (resp: CommandDownloadResponse) => {
		const element = document.createElement("a");
		const file = new Blob([resp.result as BlobPart], {type: 'text/plain'});
		element.href = URL.createObjectURL(file);
		element.download = resp.filename.split("/")[resp.filename.split("/").length - 1];
		document.body.appendChild(element); // Required for this to work in FireFox
		element.click();
		console.log(`Received ${resp.filename}.`);
	}

	onStatusUpdated = (updateResponse: UpdateResponse) => {
		this.setState({ status: updateResponse.status == UpdateStatus.StatusOk ? ComponentStyleStatus.STARTED : ComponentStyleStatus.STOPPED });
	}

	run = (cmd: AppArray.Model.Command, status: ComponentStyleStatus, keyCmd: KeyCommand) => {
		this.setState({status: status});
		let runner = this.executor!.runner(keyCmd, cmd.steps);
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
	
	start = () => {
		if(this.state.connected)
			this.run(this.props.node.component.commands?.start!, ComponentStyleStatus.STARTING, KeyCommand.START);
	}

	stop = () => {
		if(this.state.connected)
			this.run(this.props.node.component.commands?.stop!, ComponentStyleStatus.STOPPING, KeyCommand.STOP);
	}

	status = () => {
		if(this.state.connected)
			this.run(this.props.node.component.commands?.status!, ComponentStyleStatus.CHECKING, KeyCommand.STATUS);
	}

	download = () => {
		if(this.state.connected)
			this.run(this.props.node.component.commands?.download!, ComponentStyleStatus.CHECKING, KeyCommand.DOWNLOAD);
	}
	
	website = () => {
		if(this.state.connected)
			this.run(this.props.node.component.commands?.website!, ComponentStyleStatus.STARTING, KeyCommand.WEBSITE);
	}

	terminal = () => {
		if(this.state.connected)
			this.run(this.props.node.component.commands?.terminal!, ComponentStyleStatus.CHECKING, KeyCommand.TERMINAL);
	}

	async componentDidMount() {
		await this.initializeConnection();
	}

	updateConnection = () => {
		this.initializeConnection();
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

							{this.hasDownload &&
								<this.Button_other onClick={this.download}>
									<this.Icon className="fa fa-download"></this.Icon>
								</this.Button_other>
							}
							
							{this.hasWebsite &&
								<this.Button_other onClick={this.website}>
									<this.Icon className="fa fa-globe"></this.Icon>
								</this.Button_other>
							}

							{this.hasTerminal &&
								<this.Button_other onClick={this.terminal}>
									<this.Icon className="fa fa-terminal"></this.Icon>
								</this.Button_other>
							}
							
						</this.ButtonsPanel>


					</this.Node>
				</this.Border>);
    }
	
}
