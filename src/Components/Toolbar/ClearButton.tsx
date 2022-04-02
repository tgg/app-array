import { DiagramModel } from "@projectstorm/react-diagrams";
import { DemoButton } from "../DemoWorkspaceWidget";

interface ClearButtonProps {
	onModelChange: (model: DiagramModel) => void;
}

export const ClearButton = ({ onModelChange }: ClearButtonProps) => {
	const clear = () => {
        let model = new DiagramModel();
        onModelChange(model)
	};

	return <>
		<DemoButton onClick={() => clear()}>Clear</DemoButton>
	</>
}