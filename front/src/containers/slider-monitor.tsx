import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import VM from 'scratch-vm';
import {setVariableValue} from '../lib/variable-utils';
import {connect} from 'react-redux';

import SliderMonitorComponent from '../components/monitor/slider-monitor.jsx';

const SliderMonitor = (prop) => {
    const [stateValue, setValue] = useState(prop.value);

    useEffect(() => {
      if (stateValue !== prop.value) {
            setValue(prop.value);
        }
    }, [prop])
    
    
    const handleSliderUpdate = (e) => {
        setValue(Number(e.target.value));
        const {vm, targetId, id: variableId} = prop;
        setVariableValue(vm, targetId, variableId, Number(e.target.value));
    };

    const {
            vm, // eslint-disable-line no-unused-vars
            value, // eslint-disable-line no-unused-vars
            ...props
        } = prop;

    return (
            <SliderMonitorComponent
                {...props}
                value={stateValue}
                onSliderUpdate={handleSliderUpdate}
            />
        );
};


SliderMonitor.propTypes = {
    id: PropTypes.string,
    targetId: PropTypes.string,
    value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
    ]),
    vm: PropTypes.instanceOf(VM)
};

const mapStateToProps = state => ({vm: state.scratchGui.vm});

export default connect(mapStateToProps)(SliderMonitor);
