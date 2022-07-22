import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

/**
 * Higher Order Component to manage inputs that submit on blur and <enter>
 * @param {React.Component} Input text input that consumes onChange, onBlur, onKeyPress
 * @returns {React.Component} Buffered input that calls onSubmit on blur and <enter>
 */
export default function (Input) {
    
    const BufferedInput = (props) => {
        const [value, setValue] = useState(null);

        const handleKeyPress = (e) => {
            if (e.key === 'Enter') {
                 handleFlush();
                e.target.blur();
            }
        }

        const handleFlush = () => {
            const isNumeric = typeof  props.value === 'number';
            const validatesNumeric = isNumeric ? !isNaN(value) : true;
            if (value !== null && validatesNumeric) {
                 props.onSubmit(isNumeric ? Number(value) : value);
            }
            setValue(null);
        }
        const handleChange = (e) => {
            setValue(e.target.value);
        }

        const bufferedValue = value === null ? props.value : value;

        return (
            <Input
                {...props}
                value={bufferedValue}
                onBlur={handleFlush}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
            />
        );
    };
    
    BufferedInput.propTypes = {
        onSubmit: PropTypes.func.isRequired,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    };

    return BufferedInput;
}
