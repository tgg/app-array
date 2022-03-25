import React from 'react'

const CheckBoxLabel = "Keep model";

const KeepModelCheckbox = ( { ...props } ) => (    
    <label>
        <input type="checkbox" {...props} />
        {CheckBoxLabel}
    </label>
)

export default KeepModelCheckbox;