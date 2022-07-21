import PropTypes from 'prop-types';
import React, { useState } from 'react';
import bindAll from 'lodash.bindall';
import PromptComponent from '../components/prompt/prompt.jsx';
import VM from 'scratch-vm';

const Prompt = (props) => {
    const [states, setStates] = useState({
        inputValue: '',
        globalSelected: true,
        cloudSelected: false,
        canAddCloudVariable: (props.vm && props.vm.runtime.canAddCloudVariable()) || false
    });

    const handleKeyPress = (event) => {
        if (event.key === 'Enter')  handleOk();
    }
    const handleFocus = (event) => {
        event.target.select();
    }
    const handleOk = () => {
         props.onOk( states.inputValue, {
            scope:  states.globalSelected ? 'global' : 'local',
            isCloud:  states.cloudSelected
        });
    }
    const handleCancel = () => {
         props.onCancel();
    }
    const handleChange = (e) => {
         setStates({...states, inputValue: e.target.value});
    }
    const handleScopeOptionSelection = (e) => {
         setStates({...states, globalSelected: (e.target.value === 'global')});
    }
    const handleCloudVariableOptionChange = (e) => {
        if (!props.showCloudOption) return;

        const checked = e.target.checked;
         setStates({...states, cloudSelected: checked});
        if (checked) {
             setStates({...states, globalSelected: true});
        }
    }

    return (
        <PromptComponent
            canAddCloudVariable={ states.canAddCloudVariable}
            cloudSelected={ states.cloudSelected}
            defaultValue={ props.defaultValue}
            globalSelected={ states.globalSelected}
            isStage={ props.isStage}
            showListMessage={ props.showListMessage}
            label={ props.label}
            showCloudOption={ props.showCloudOption}
            showVariableOptions={ props.showVariableOptions}
            title={ props.title}
            onCancel={ handleCancel}
            onChange={ handleChange}
            onCloudVarOptionChange={ handleCloudVariableOptionChange}
            onFocus={ handleFocus}
            onKeyPress={ handleKeyPress}
            onOk={ handleOk}
            onScopeOptionSelection={ handleScopeOptionSelection}
        />
    );
};

Prompt.propTypes = {
    defaultValue: PropTypes.string,
    isStage: PropTypes.bool.isRequired,
    showListMessage: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    onCancel: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
    showCloudOption: PropTypes.bool.isRequired,
    showVariableOptions: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    vm: PropTypes.instanceOf(VM)
};

export default Prompt;
