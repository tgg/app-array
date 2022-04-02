import styled from '@emotion/styled';
import { hover } from '@testing-library/user-event/dist/hover';
import React from "react";

export interface ConnectedStatusTextProps {
	isConnected?: boolean;
	onChange?: any;
    path?: string;
}

const RedStatusDot = styled.span`
    height: 1em;
    width: 1em;
    background-color: red;
    border-radius: 50%;
    display: inline-block;
    margin-right: 0.5em;
`;

const GreenStatusDot = styled.span`
    height: 1em;
    width: 1em;
    background-color: green;
    border-radius: 50%;
    display: inline-block;
    margin-right: 0.5em;
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
        left:-100%;
        
        /* basic styles */
        width:200px;
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
        if(this.props.isConnected) {
            return(
                <StyledText data-text={this.props.path}><GreenStatusDot></GreenStatusDot>Connected</StyledText>
            );
        } else {  
            return(
                <StyledText data-text={this.props.path}><RedStatusDot></RedStatusDot>Not connected</StyledText>
            );
        }
    }
}