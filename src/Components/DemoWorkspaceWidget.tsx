// Taken from react-canvas sample, to adapt

import * as React from 'react';
import styled from '@emotion/styled';

export interface DemoWorkspaceWidgetProps {
	buttons?: any;
	options?: any;
	statusItems?: any;
}

namespace S {
	export const Toolbar = styled.div`
		padding: 5px;
		display: flex;
		flex-shrink: 0;
	`;

	export const FillSpace = styled.span`
	    flex: 1 1 auto;
	`;

	export const Content = styled.div`
		flex-grow: 1;
		height: 100%;
	`;

	export const Container = styled.div`
		background: black;
		display: flex;
		flex-direction: column;
		height: 100%;
		border-radius: 5px;
		overflow: hidden;
	`;

	export const StatusBar = styled.div`
		padding: 5px;
		display: flex;
		flex-shrink: 0;
	`
}

export const DemoButton = styled.button`
	background: rgb(60, 60, 60);
	font-size: 14px;
	padding: 5px 10px;
	border: none;
	color: white;
	outline: none;
	cursor: pointer;
	margin: 2px;
	border-radius: 3px;

	&:hover {
		background: rgb(0, 192, 255);
	}
`;

export class DemoWorkspaceWidget extends React.Component<DemoWorkspaceWidgetProps> {
	render() {
		return (
			<S.Container>
				<S.Toolbar>{this.props.buttons}<S.FillSpace />{this.props.options}</S.Toolbar>
				<S.Content>{this.props.children}</S.Content>
				<S.StatusBar><S.FillSpace />{this.props.statusItems}</S.StatusBar>
			</S.Container>
		);
	}
}
