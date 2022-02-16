import * as React from 'react';
import { DefaultPortLabel,DiagramEngine, PortModelAlignment, PortWidget } from '@projectstorm/react-diagrams';
import styled from '@emotion/styled';
import { ComponentNodeModel } from './ComponentNodeModel';
import { map } from 'lodash';
import { isThisTypeNode } from 'typescript';
import { Executor, ShellExecutor, Status } from './Executor';
export interface ComponentNodeWidgetProps {
	node: ComponentNodeModel;
	engine: DiagramEngine;
}
const styled_1  = require("@emotion/styled");
const DefaultPortLabelWidget_1 = require("@projectstorm/react-diagrams/")
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
		const socket = new WebSocket("ws://localhost:8080/shell");

		socket.onopen = (e) => {
			console.info('Status: Connected');
		};

		this.executor = new ShellExecutor(socket);
    }
	
	start = () => {
		let cmd = this.props.node.component.commands?.start!;
		this.status = 'STARTING';
		let runner = this.executor.runner(cmd.steps);
		let d = new TextDecoder();
		let instance = runner({ id: 'thisEnvironment' });
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
		let instance = runner({ id: 'thisEnvironment' });
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
