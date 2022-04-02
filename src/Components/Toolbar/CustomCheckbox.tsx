import styled from '@emotion/styled';
import React from 'react';

export interface CheckBoxLabelProps {
	checked?: any;
	onChange?: any;
    label: String;
}

const StyledLabel = styled.label`
    color: white;
`;


export class CustomCheckbox extends React.Component<CheckBoxLabelProps> {
    render() {
        return(
            <StyledLabel>
                <input type="checkbox" checked={this.props.checked} onChange={this.props.onChange} />
                {this.props.label}
            </StyledLabel>
        );
    }
}