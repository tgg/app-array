import * as React from 'react';
import { DefaultPortLabel,DiagramEngine, PortModelAlignment, PortWidget } from '@projectstorm/react-diagrams';
import styled from '@emotion/styled';
import { ComponentNodeModel } from './ComponentNodeModel';
import { map } from 'lodash';
export interface ComponentNodeWidgetProps {
	node: ComponentNodeModel;
	engine: DiagramEngine;
}
const styled_1  = require("@emotion/styled");
const DefaultPortLabelWidget_1 = require("@projectstorm/react-diagrams/")
export class ComponentNodeWidget extends React.Component<ComponentNodeWidgetProps>  {
	Node = styled_1.default.div `
		background-color: ${(p: { background: any; }) => p.background};
		border-radius: 5px;
		font-family: sans-serif;
		color: white;
		border: solid 2px black;
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

	private hasStart:boolean;
	private hasStop:boolean;

	generatePort: (port: any) => React.FunctionComponentElement<{ engine: DiagramEngine; port: any; key: any; }>;

	constructor(args: ComponentNodeWidgetProps | Readonly<ComponentNodeWidgetProps>) {
        super(args);
        this.generatePort = (port) => {
            return React.createElement(DefaultPortLabelWidget_1.DefaultPortLabel, { engine: this.props.engine, port: port, key: port.getID() });
        };
		this.hasStart=false;
		this.hasStop=false;
		if(this.props.node.component.commands){
			if("start" in this.props.node.component.commands){
				this.hasStart=true;
			}
			if("stop" in this.props.node.component.commands){
				this.hasStop=true;
			}
		}
		
    }
	
	
	
	render() {
        return (React.createElement(this.Node, { "data-default-node-name": this.props.node.getOptions().name, selected: this.props.node.isSelected(), background: this.props.node.getOptions().color },
            React.createElement(this.Title, null,
                React.createElement(this.TitleName, null, this.props.node.getOptions().name)),
            React.createElement(this.Ports, null,
                React.createElement(this.PortsContainer, null, map(this.props.node.getInPorts(), this.generatePort)),
                React.createElement(this.PortsContainer, null, map(this.props.node.getOutPorts(), this.generatePort))),
				React.createElement(this.Title, null,
					React.createElement(this.ButtonsPanel, null, 
						this.hasStart?React.createElement(this.Button_start, null,
												React.createElement('i', {class:"fa fa-play-circle"},null)
											)
											:null,
						this.hasStop?React.createElement(this.Button_stop, null, 
												React.createElement('i', {class:"fa fa-stop-circle"},null)
											)
											:null,
							),
						)
				
				));
    }
	
}
