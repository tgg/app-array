import React from "react";
import Select from 'react-select';
import styled from '@emotion/styled';

const Container = styled.div`
    width: 10%;
    margin-right: 1em;
`;

export type Options = {    
    value: String;
    label: String;
}  

export interface EnvironmentComboBoxProps {
	environments?: String[];
    default?: String;
	onChange?: any;
}

export class EnvironmentComboBox extends React.Component<EnvironmentComboBoxProps> {
    render() {
        return(
            <Container>
                <Select options={this.props.environments} menuPlacement="top" onChange={this.props.onChange} />
            </Container>
        );
    }
}