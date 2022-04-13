import { useRef } from "react";

import styled from '@emotion/styled';

import { SystemDiagramModel } from "../../Model/SystemDiagramModel";
import { AppArray } from "../../Model/Model";
import { DemoButton } from "../DemoWorkspaceWidget";

const Input = styled.input`
    display: none;
`

interface LoadButtonProps {
	onModelChange: (model: SystemDiagramModel) => void;
}

export const LoadButton = ({ onModelChange }: LoadButtonProps) => {
	const inputFile = useRef(null)

	const handleFileUpload = (e: any) => {
		const { files } = e.target;
		if (files && files.length) {
			const file = files[0];
			const fileReader = new FileReader();
			fileReader.readAsText(file, "UTF-8");
			fileReader.onload = event => {
				const newFO = JSON.parse(event?.target?.result as string) as AppArray.Model.Application;
				let model = new SystemDiagramModel(newFO);
				onModelChange(model)
			};
		}
	};

	return <>
		<Input
			accept=".json"
			ref={inputFile}
			onChange={handleFileUpload}
			type="file"
		/>
		<DemoButton onClick={() => (inputFile?.current as unknown as any).click()}>Load ...</DemoButton>
	</>
}