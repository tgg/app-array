import React from "react";
import Select from 'react-select';
import styled from '@emotion/styled';
import { SelectContainer } from "react-select/dist/declarations/src/components/containers";

const Container = styled.div`
    width: 20%;
    margin-right: 1em;
`;

export type EnvironmentOptions = {    
    value: String;
    label: String;
    path: String;
}  

export interface EnvironmentComboBoxProps {
	environments?: EnvironmentOptions[];
    value: EnvironmentOptions | undefined | null;
	onChange?: any;
}

export class EnvironmentComboBox extends React.Component<EnvironmentComboBoxProps> {
    render() {
        return(
            <Container>
                <Select isClearable isSearchable options={this.props.environments} menuPlacement="top" onChange={this.props.onChange} value={this.props.value} />
            </Container>
        );
    }
}