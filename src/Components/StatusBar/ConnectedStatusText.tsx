import styled from '@emotion/styled';
import React from "react";

export interface ConnectedStatusTextProps {
	isConnected?: boolean;
    host?: String;
    path?: String;
    justDot?: boolean;
    widget?: boolean;
}

const StatusDot = styled.span`
    height: 1em;
    width: 1em;
    background-color: ${(p: { background: any; }) => p.background};
    border-radius: 50%;
    display: inline-block;
    margin-right: 0.5em;
`;

const Icon = styled.i`
    border: none;
    cursor: pointer;
    font-size:1.2em;
    color: ${(p: { color: any; }) => p.color};
    margin-right: 0.2em;
    &:hover {
        color: white;
    }
    &:active {
        color: grey;
    }
`;

const StyledText = styled.p`
    margin-left: auto; 
    margin-right: 0;
    position: relative;
    float: right;
    color: white;
    &:before {
        content: attr(data-text); /* here's the magic */
        position:absolute;
        
        /* vertically center */
        bottom: 50%;
        transform:translateY(-50%);
        
        /* move to right */
        left:${(p: { leftvalue: any; widthvalue: any; }) => p.leftvalue};
        
        /* basic styles */
        width:${(p: { leftvalue: any; widthvalue: any; }) => p.widthvalue};
        padding:0.5em;
        border-radius:10px;
        background:#fff;
        color: #000;
        text-align:center;

        display:none; /* hide by default */
    }
    &:hover:before {
        display:block;
    }
`;

export class ConnectedStatusText extends React.Component<ConnectedStatusTextProps> {
    render() {
        const display = `${this.props.host}${this.props.path}`
        let leftValue, widthValue, color, label;
        leftValue = this.props.widget ? "-5em" : "-10em";
        widthValue = this.props.widget ? "100px" : "200px";
        color = this.props.isConnected ? "green" : "red";
        label = this.props.justDot ? "" : this.props.isConnected ? "Connected" : "Not connected";
        return(
            <StyledText data-text={display} leftvalue={leftValue} widthvalue={widthValue}><Icon className="fa fa-plug" color={color}></Icon>{label}</StyledText>
        );
    }
}