import * as React from 'react';
import { DiagramEngine} from '@projectstorm/react-diagrams';
import { ComponentNodeModel } from './ComponentNodeModel';
import { Context, Environment } from '../../Model/Environment';
import { map } from 'lodash';
import { Executor, ShellExecutor } from '../../Service/Executor';
import * as signalr from '@microsoft/signalr';

const styled_1  = require("@emotion/styled");
const DefaultPortLabelWidget_1 = require("@projectstorm/react-diagrams/")

export interface ComponentNodeWidgetProps {
	node: ComponentNodeModel;
	engine: DiagramEngine;
}

export class ComponentNodeWidget extends React.Component<ComponentNodeWidgetProps>  {
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
	Icon = styled_1.default('i')`
	`;

	
	private hasStart:boolean;
	private hasStop:boolean;
	private status: string = 'UNKNOWN';
	private executor: Executor<Uint8Array,any>;
	generatePort: (port: any) => React.FunctionComponentElement<{ engine: DiagramEngine; port: any; key: any; }>;

	constructor(args: ComponentNodeWidgetProps | Readonly<ComponentNodeWidgetProps>) {
        super(args);
        this.generatePort = (port) => {
            return React.createElement(DefaultPortLabelWidget_1.DefaultPortLabel, { engine: this.props.engine, port: port, key: port.getID() });
        };
		this.hasStart = this.props.node.hasCommand('start');
		this.hasStop = this.props.node.hasCommand('stop');
		//console.log(process.env.REACT_APP_BACKEND_HOST)
		let url = "http://localhost:9090/shell";

		const socket = new signalr.HubConnectionBuilder()
								.configureLogging(signalr.LogLevel.Debug)
								.withUrl(url, signalr.HttpTransportType.WebSockets)
								.build();
								
		socket.on('statusUpdated', this.onStatusUpdated);
		socket.start().then(function () {
			console.log('Connected!');
		}).catch(function (err) {
			return console.error(err.toString());
		});

		this.executor = new ShellExecutor(socket);
    }

	onStatusUpdated = (payload: any) => {
		console.log("updated : " + payload);
	}
	
	start = () => {
		let cmd = this.props.node.component.commands?.start!;
		this.status = 'STARTING';
		let runner = this.executor.runner(cmd.steps);
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
		let cmd = this.props.node.component.commands?.stop!;
		this.status = 'STOPPING';
		let runner = this.executor.runner(cmd.steps);
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
	
	render() {
        return (
				<this.Border className={this.status}>
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
							
						</this.ButtonsPanel>


					</this.Node>
				</this.Border>);
    }
	
}
