import bindAll from 'lodash.bindall';
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {injectIntl, intlShape, defineMessages} from 'react-intl';

import monitorAdapter from '../lib/monitor-adapter.js';
import MonitorComponent, {monitorModes} from '../components/monitor/monitor.jsx';
import {addMonitorRect, getInitialPosition, resizeMonitorRect, removeMonitorRect} from '../reducers/monitor-layout';
import {getVariable, setVariableValue} from '../lib/variable-utils';
import importCSV from '../lib/import-csv';
import downloadBlob from '../lib/download-blob';
import SliderPrompt from './slider-prompt.jsx';

import {connect} from 'react-redux';
import {Map} from 'immutable';
import VM from 'scratch-vm';

const availableModes = opcode => (
    monitorModes.filter(t => {
        if (opcode === 'data_variable') {
            return t !== 'list';
        } else if (opcode === 'data_listcontents') {
            return t === 'list';
        }
        return t !== 'slider' && t !== 'list';
    })
);

const messages = defineMessages({
    columnPrompt: {
        defaultMessage: 'Which column should be used (1-{numberOfColumns})?',
        description: 'Prompt for which column should be used',
        id: 'gui.monitors.importListColumnPrompt'
    }
});

const Monitor = (props) => {
    const [sliderPrompt, setSliderPrompt] = useState(false);
    let element = useRef();

    useEffect(() => {
        let rect;

        const isNum = num => typeof num === 'number' && !isNaN(num);

        // Load the VM provided position if not loaded already
        // If a monitor has numbers for the x and y positions, load the saved position.
        // Otherwise, auto-position the monitor.
        if (isNum(props.x) && isNum( props.y) &&
            !props.monitorLayout.savedMonitorPositions[props.id]) {
            rect = {
                upperStart: {x: props.x, y: props.y},
                lowerEnd: {x: props.x + element.offsetWidth, y: props.y +  element.offsetHeight}
            };
             props.addMonitorRect(props.id, rect, true /* savePosition */);
        } else { // Newly created user monitor
            rect = getInitialPosition(
                 props.monitorLayout,  props.id,  element.offsetWidth,  element.offsetHeight);
             props.addMonitorRect( props.id, rect);
             props.vm.runtime.requestUpdateMonitor(Map({
                id: props.id,
                x: rect.upperStart.x,
                y: rect.upperStart.y
            }));
        }
         element.style.top = `${rect.upperStart.y}px`;
         element.style.left = `${rect.upperStart.x}px`;
    
      return () => {
        props.removeMonitorRect(props.id);
      }
    }, [props.resizeMonitorRect]);

    const handleDragEnd = (e, {x, y}) => {
        const newX = parseInt(element.style.left, 10) + x;
        const newY = parseInt(element.style.top, 10) + y;
         props.onDragEnd(
            props.id,
            newX,
            newY
        );
         props.vm.runtime.requestUpdateMonitor(Map({
            id:  props.id,
            x: newX,
            y: newY
        }));
    }
    const handleHide = ()  => {
         props.vm.runtime.requestUpdateMonitor(Map({
            id: props.id,
            visible: false
        }));
    }
    const handleNextMode = () => {
        const modes = availableModes( props.opcode);
        const modeIndex = modes.indexOf( props.mode);
        const newMode = modes[(modeIndex + 1) % modes.length];
         props.vm.runtime.requestUpdateMonitor(Map({
            id:  props.id,
            mode: newMode
        }));
    }
    const handleSetModeToDefault = () => {
         props.vm.runtime.requestUpdateMonitor(Map({
            id:  props.id,
            mode: 'default'
        }));
    }
    const handleSetModeToLarge = () => {
         props.vm.runtime.requestUpdateMonitor(Map({
            id:  props.id,
            mode: 'large'
        }));
    }
    const handleSetModeToSlider = () => {
         props.vm.runtime.requestUpdateMonitor(Map({
            id:  props.id,
            mode: 'slider'
        }));
    }
    const handleSliderPromptClose = () => {
         setSliderPrompt(false);
    }
    const handleSliderPromptOpen = () => {
        setSliderPrompt(true);
    }
    const handleSliderPromptOk = (min, max, isDiscrete) => {
        const realMin = Math.min(min, max);
        const realMax = Math.max(min, max);
         props.vm.runtime.requestUpdateMonitor(Map({
            id:  props.id,
            sliderMin: realMin,
            sliderMax: realMax,
            isDiscrete: isDiscrete
        }));
         handleSliderPromptClose();
    }
    const setElement = (monitorElt) => {
         element = monitorElt;
    }
    const handleImport = () => {
        importCSV().then(rows => {
            const numberOfColumns = rows[0].length;
            let columnNumber = 1;
            if (numberOfColumns > 1) {
                const msg =  props.intl.formatMessage(messages.columnPrompt, {numberOfColumns});
                columnNumber = parseInt(prompt(msg), 10); // eslint-disable-line no-alert
            }
            const newListValue = rows.map(row => row[columnNumber - 1])
                .filter(item => typeof item === 'string'); // CSV importer can leave undefineds
            const {vm, targetId, id: variableId} =  props;
            setVariableValue(vm, targetId, variableId, newListValue);
        });
    }
    const handleExport = () => {
        const {vm, targetId, id: variableId} =  props;
        const variable = getVariable(vm, targetId, variableId);
        const text = variable.value.join('\r\n');
        const blob = new Blob([text], {type: 'text/plain;charset=utf-8'});
        downloadBlob(`${variable.name}.txt`, blob);
    };

    const monitorProps = monitorAdapter( props);
    const showSliderOption = availableModes( props.opcode).indexOf('slider') !== -1;
    const isList =  props.mode === 'list';
    
    return (
        <React.Fragment>
                { sliderPrompt.sliderPrompt && <SliderPrompt
                    isDiscrete={props.isDiscrete}
                    maxValue={parseFloat( props.max)}
                    minValue={parseFloat( props.min)}
                    onCancel={ handleSliderPromptClose}
                    onOk={ handleSliderPromptOk}
                />}
                <MonitorComponent
                    componentRef={setElement}
                    {...monitorProps}
                    draggable={ props.draggable}
                    height={ props.height}
                    isDiscrete={ props.isDiscrete}
                    max={ props.max}
                    min={ props.min}
                    mode={ props.mode}
                    targetId={ props.targetId}
                    width={ props.width}
                    onDragEnd={ handleDragEnd}
                    onExport={isList ?  handleExport : null}
                    onImport={isList ?  handleImport : null}
                    onHide={ handleHide}
                    onNextMode={ handleNextMode}
                    onSetModeToDefault={isList ? null :  handleSetModeToDefault}
                    onSetModeToLarge={isList ? null :  handleSetModeToLarge}
                    onSetModeToSlider={showSliderOption ?  handleSetModeToSlider : null}
                    onSliderPromptOpen={ handleSliderPromptOpen}
                />
        </React.Fragment>
    );
};

Monitor.propTypes = {
    addMonitorRect: PropTypes.func.isRequired,
    draggable: PropTypes.bool,
    height: PropTypes.number,
    id: PropTypes.string.isRequired,
    intl: intlShape,
    isDiscrete: PropTypes.bool,
    max: PropTypes.number,
    min: PropTypes.number,
    mode: PropTypes.oneOf(['default', 'slider', 'large', 'list']),
    monitorLayout: PropTypes.shape({
        monitors: PropTypes.object, // eslint-disable-line react/forbid-prop-types
        savedMonitorPositions: PropTypes.object // eslint-disable-line react/forbid-prop-types
    }).isRequired,
    onDragEnd: PropTypes.func.isRequired,
    opcode: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
    params: PropTypes.object, // eslint-disable-line react/no-unused-prop-types, react/forbid-prop-types
    removeMonitorRect: PropTypes.func.isRequired,
    resizeMonitorRect: PropTypes.func.isRequired,
    spriteName: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
    targetId: PropTypes.string,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.arrayOf(PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ]))
    ]), // eslint-disable-line react/no-unused-prop-types
    vm: PropTypes.instanceOf(VM),
    width: PropTypes.number,
    x: PropTypes.number,
    y: PropTypes.number
};
const mapStateToProps = state => ({
    monitorLayout: state.scratchGui.monitorLayout,
    vm: state.scratchGui.vm
});
const mapDispatchToProps = dispatch => ({
    addMonitorRect: (id, rect, savePosition) =>
        dispatch(addMonitorRect(id, rect.upperStart, rect.lowerEnd, savePosition)),
    resizeMonitorRect: (id, newWidth, newHeight) => dispatch(resizeMonitorRect(id, newWidth, newHeight)),
    removeMonitorRect: id => dispatch(removeMonitorRect(id))
});

export default React.memo(injectIntl(connect(
    mapStateToProps,
    mapDispatchToProps
)(Monitor)));
