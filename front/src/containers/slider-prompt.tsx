import PropTypes from 'prop-types';
import React, { useState } from 'react';
import SliderPromptComponent from '../components/slider-prompt/slider-prompt.jsx';

const SliderPrompt = (props) => {
    const {isDiscrete, minValue, maxValue} = props;
    const [states, setStates] = useState({
            // For internal use, convert values to strings based on isDiscrete
            // This is because `<input />` always returns values as strings.
            minValue: isDiscrete ? minValue.toFixed(0) : minValue.toFixed(2),
            maxValue: isDiscrete ? maxValue.toFixed(0) : maxValue.toFixed(2)
        });

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') handleOk();
    }
    const handleOk = () => {
        const {minValue, maxValue} = states;
        if (!validates(minValue, maxValue)) {
            props.onCancel();
            return;
        }
        props.onOk(
            parseFloat(minValue),
            parseFloat(maxValue),
            shouldBeDiscrete(minValue, maxValue));
    }
    const handleCancel = () => {
        props.onCancel();
    }
    const handleChangeMin = (e) => {
        setStates({...states, minValue: e.target.value});
    }
    const handleChangeMax = (e) => {
       setStates({...states, maxValue: e.target.value});
    }
    const shouldBeDiscrete = (min, max) => {
        return min.indexOf('.') + max.indexOf('.') === -2; // Both -1
    }
    const validates = (min, max) => {
        return isFinite(min) && isFinite(max);
    }

    return (
        <SliderPromptComponent
            maxValue={states.maxValue}
            minValue={states.minValue}
            onCancel={handleCancel}
            onChangeMax={handleChangeMax}
            onChangeMin={handleChangeMin}
            onKeyPress={handleKeyPress}
            onOk={handleOk}
        />
    );
};

SliderPrompt.propTypes = {
    isDiscrete: PropTypes.bool,
    maxValue: PropTypes.number,
    minValue: PropTypes.number,
    onCancel: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired
};

SliderPrompt.defaultProps = {
    maxValue: 100,
    minValue: 0,
    isDiscrete: true
};

export default SliderPrompt;
