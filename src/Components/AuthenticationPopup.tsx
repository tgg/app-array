import React, { useRef, useState } from "react";
import styled from '@emotion/styled';
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import 'react-tabs/style/react-tabs.css';
import { DemoButton } from "./DemoWorkspaceWidget";
import { createUnparsedSourceFile } from "typescript";

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

const Input = styled.input`
    display: none;
`


export type LoadCredsButtonProps = {
    onFileLoaded: (creds: Map<String, String>) => void;
}

export const LoadCredsButton = (props: LoadCredsButtonProps) => {
	const inputFile = useRef(null)
    const [filename, setfilename] = useState("");

	const handleFileUpload = (e: any) => {
		const { files } = e.target;
		if (files && files.length) {
			const file = files[0];
			const fileReader = new FileReader();
			fileReader.readAsText(file, "UTF-8");
			fileReader.onload = event => {
				const creds = JSON.parse(event?.target?.result as string) as Map<String, String>;
                setfilename(file.name);
                props.onFileLoaded(creds);
			};
		}
	};

	return <>
        <label>{filename}</label><p> </p>
		<Input
			accept=".json"
			ref={inputFile}
			onChange={handleFileUpload}
			type="file"
		/>
		<DemoButton onClick={() => (inputFile?.current as unknown as any).click()}>Load ...</DemoButton>
	</>
}

export type AuthenticationPopupState = {
    host: string;
    token: string;
    path: string;
    key: string;
    loadedCreds: string;
    clearCreds: Map<String, String>;
}

export type AuthenticationPopupProps = {
    submitVaultCredentials: (creds: any) => void;
    submitClearCredentials: (creds: any) => void;
    closeCredentials: () => void;
}

export class AuthenticationPopup extends React.Component<AuthenticationPopupProps, AuthenticationPopupState> {

    submitCredentials = () => {
        this.props.submitVaultCredentials({ host: this.state.host, token: this.state.token, path: this.state.path, key: this.state.key  });
	};

    submitClearCredentials = () => {
        this.props.submitClearCredentials({ credentials: this.state.clearCreds });
	};

    onFileLoaded = (creds: Map<String, String>) => {
        let credStr = "";
        Object.keys(creds).forEach(key => credStr += key + ", ");
        credStr = credStr.substring(0, credStr.length - 2);
        this.setState({loadedCreds: credStr, clearCreds: creds});
    }

    constructor(props: any) {
        super(props);
        this.state = {
            host: "",
            token: "",
            path: "",
            key: "",
            loadedCreds: "",
            clearCreds: new Map<String,String>()
		};
    }

    render() {
        return(
            <PopupBox>
                <Box>
                    <Tabs>
                        <div><Close className="fa fa-times" onClick={this.props.closeCredentials} /></div>
                        <TabList>
                            <Tab>Clear credentials</Tab>
                            <Tab>Vault credentials</Tab>
                        </TabList>
                        <TabPanel>
                            <LoadCredsButton onFileLoaded={this.onFileLoaded}></LoadCredsButton><br />
                            <p>Loaded users : {this.state.loadedCreds}</p>
                            <DemoButton onClick={this.submitClearCredentials}>Send</DemoButton>
                        </TabPanel>
                        <TabPanel>
                            <h2>Vault informations required :</h2>
                            <label>Host : </label><input type="text" name="host" onChange={e => this.setState({host: e.target.value})} /><br />
                            <label>Token : </label><input type="password" name="token" onChange={e => this.setState({token: e.target.value})} /><br />
                            <label>Secret path : </label><input type="text" name="path" onChange={e => this.setState({path: e.target.value})} /><br />
                            <label>Data key : </label><input type="text" name="path" onChange={e => this.setState({key: e.target.value})} /><br />
                            <DemoButton onClick={this.submitCredentials}>Send</DemoButton>
                        </TabPanel>
                    </Tabs>
                </Box>
            </PopupBox>
        );
    }
}