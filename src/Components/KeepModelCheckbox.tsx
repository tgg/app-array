import styled from '@emotion/styled';
import React from 'react';

export interface CheckBoxLabelProps {
	checked?: any;
	onChange?: any;
}

const CheckBoxLabel = "Keep model";

const StyledLabel = styled.label`
    color: white;
`;


export class KeepModelCheckbox extends React.Component<CheckBoxLabelProps> {
    render() {
        return(
            <StyledLabel>
                <input type="checkbox" checked={this.props.checked} onChange={this.props.onChange} />
                {CheckBoxLabel}
            </StyledLabel>
        );
    }
}