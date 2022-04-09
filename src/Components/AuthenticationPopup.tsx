import React from "react";
import styled from '@emotion/styled';
import { DemoButton } from "./DemoWorkspaceWidget";

const PopupBox = styled.div`
    position: fixed;
    background: #00000050;
    width: 100%;
    height: 100vh;
    top: 0;
    left: 0;
`;

const Box = styled.div`
    position: relative;
    width: 30%;
    margin: 0 auto;
    height: auto;
    max-height: 70vh;
    margin-top: calc(100vh - 85vh - 20px);
    background: #fff;
    border-radius: 4px;
    padding: 20px;
    border: 1px solid #999;
    overflow: auto;
`

const Close = styled.i`
    float:right;
    cursor: pointer;
`

export type AuthenticationPopupState = {
    host: string;
    token: string;
    path: string;
    key: string;
}

export type AuthenticationPopupProps = {
    submitCredentials: (creds: AuthenticationPopupState) => void;
    closeCredentials: () => void;
}

export class AuthenticationPopup extends React.Component<AuthenticationPopupProps, AuthenticationPopupState> {

    submitCredentials = () => {
        this.props.submitCredentials(this.state);
	};

    constructor(props: any) {
        super(props);
        this.state = {
            host: "",
            token: "",
            path: "",
            key: "",
		};
    }

    render() {
        return(
            <PopupBox>
                <Box>
                    <div><Close className="fa fa-times" onClick={this.props.closeCredentials} /></div>
                    <h2>Vault informations required :</h2>
                    <label>Host : </label><input type="text" name="host" onChange={e => this.setState({host: e.target.value})} /><br />
                    <label>Token : </label><input type="password" name="token" onChange={e => this.setState({token: e.target.value})} /><br />
                    <label>Secret path : </label><input type="text" name="path" onChange={e => this.setState({path: e.target.value})} /><br />
                    <label>Data key : </label><input type="text" name="path" onChange={e => this.setState({key: e.target.value})} /><br />
                    <DemoButton onClick={this.submitCredentials}>Send</DemoButton>
                </Box>
            </PopupBox>
        );
    }
}