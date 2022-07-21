import { Map } from 'immutable';
import { useState } from 'react';
import { connect } from 'react-redux';
import ListMonitorComponent from '../components/monitor/list-monitor.jsx';
import { getEventXY } from '../lib/touch-utils';
import { getVariableValue, setVariableValue } from '../lib/variable-utils';

const ListMonitor = (prop: PropsInterface) => {
  const [states, setStates] = useState<any>({
    activeIndex: null,
    activeValue: null,
    width: prop.width || 100,
    height: prop.height || 200,
  });

  const handleActivate = (index: any) => {
    // Do nothing if activating the currently active item
    if (states.activeIndex === index) {
      return;
    }
    setStates({
      ...states,
      activeIndex: index,
      activeValue: prop.value[index],
    });
  };

  const handleDeactivate = () => {
    // Submit any in-progress value edits on blur
    if (states.activeIndex !== null) {
      const { vm, targetId, id: variableId } = prop;
      const newListValue = getVariableValue(vm, targetId, variableId);
      newListValue[states.activeIndex] = states.activeValue;
      setVariableValue(vm, targetId, variableId, newListValue);
      setStates({ ...states, activeIndex: null, activeValue: null });
    }
  };

  const handleFocus = (e: any) => {
    // Select all the text in the input when it is focused.
    e.target.select();
  };

  const handleKeyPress = (e: any) => {
    // Special case for tab, arrow keys and enter.
    // Tab / shift+tab navigate down / up the list.
    // Arrow down / arrow up navigate down / up the list.
    // Enter / shift+enter insert new blank item below / above.
    const previouslyActiveIndex = states.activeIndex;
    const { vm, targetId, id: variableId } = prop;

    let navigateDirection = 0;
    if (e.key === 'Tab') navigateDirection = e.shiftKey ? -1 : 1;
    else if (e.key === 'ArrowUp') navigateDirection = -1;
    else if (e.key === 'ArrowDown') navigateDirection = 1;
    if (navigateDirection) {
      handleDeactivate(); // Submit in-progress edits
      const newIndex = wrapListIndex(
        previouslyActiveIndex + navigateDirection,
        prop.value.length
      );
      setStates({
        ...states,
        activeIndex: newIndex,
        activeValue: prop.value[newIndex],
      });
      e.preventDefault(); // Stop default tab behavior, handled by this state change
    } else if (e.key === 'Enter') {
      handleDeactivate(); // Submit in-progress edits
      const newListItemValue = ''; // Enter adds a blank item
      const newValueOffset = e.shiftKey ? 0 : 1; // Shift-enter inserts above
      const listValue = getVariableValue(vm, targetId, variableId);
      const newListValue = listValue
        .slice(0, previouslyActiveIndex + newValueOffset)
        .concat([newListItemValue])
        .concat(listValue.slice(previouslyActiveIndex + newValueOffset));
      setVariableValue(vm, targetId, variableId, newListValue);
      const newIndex = wrapListIndex(
        previouslyActiveIndex + newValueOffset,
        newListValue.length
      );
      setStates({
        ...states,
        activeIndex: newIndex,
        activeValue: newListItemValue,
      });
    }
  };

  const handleInput = (e: any) => {
    setStates({ ...states, activeValue: e.target.value });
  };

  const handleRemove = (e: any) => {
    e.preventDefault(); // Default would blur input, prevent that.
    e.stopPropagation(); // Bubbling would activate, which will be handled here
    const { vm, targetId, id: variableId } = prop;
    const listValue = getVariableValue(vm, targetId, variableId);
    const newListValue = listValue
      .slice(0, states.activeIndex)
      .concat(listValue.slice(states.activeIndex + 1));
    setVariableValue(vm, targetId, variableId, newListValue);
    const newActiveIndex = Math.min(
      newListValue.length - 1,
      states.activeIndex
    );
    setStates({
      ...states,
      activeIndex: newActiveIndex,
      activeValue: newListValue[newActiveIndex],
    });
  };

  const handleAdd = () => {
    // Add button appends a blank value and switches to it
    const { vm, targetId, id: variableId } = prop;
    const newListValue = getVariableValue(vm, targetId, variableId).concat([
      '',
    ]);
    setVariableValue(vm, targetId, variableId, newListValue);
    setStates({
      ...states,
      activeIndex: newListValue.length - 1,
      activeValue: '',
    });
  };

  const handleResizeMouseDown = (e: any) => {
    const initialPosition = getEventXY(e);
    const initialWidth = states.width;
    const initialHeight = states.height;

    const onMouseMove = (ev: any) => {
      const newPosition = getEventXY(ev);
      const dx = newPosition.x - initialPosition.x;
      const dy = newPosition.y - initialPosition.y;
      setStates({
        ...states,
        width: Math.max(Math.min(initialWidth + dx, 480), 100),
        height: Math.max(Math.min(initialHeight + dy, 360), 60),
      });
    };

    const onMouseUp = (ev: any) => {
      onMouseMove(ev); // Make sure width/height are up-to-date
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      prop.vm.runtime.requestUpdateMonitor(
        Map({
          id: prop.id,
          height: states.height,
          width: states.width,
        })
      );
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const wrapListIndex = (index: any, length: any) => {
    return (index + length) % length;
  };

  const {
    vm, // eslint-disable-line no-unused-vars
    ...props
  } = prop;

  return (
    <ListMonitorComponent
      {...props}
      activeIndex={states.activeIndex}
      activeValue={states.activeValue}
      height={states.height}
      width={states.width}
      onActivate={handleActivate}
      onAdd={handleAdd}
      onDeactivate={handleDeactivate}
      onFocus={handleFocus}
      onInput={handleInput}
      onKeyPress={handleKeyPress}
      onRemove={handleRemove}
      onResizeMouseDown={handleResizeMouseDown}
    />
  );
};

interface PropsInterface {
  height: number;
  id: string;
  targetId: string;
  value: number | string | any;
  vm: any;
  width: number;
  x: number;
  y: number;
}

// TODO
// ListMonitor.propTypes = {
//   height: PropTypes.number,
//   id: PropTypes.string,
//   targetId: PropTypes.string,
//   value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
//   vm: PropTypes.instanceOf(VM),
//   width: PropTypes.number,
//   x: PropTypes.number,
//   y: PropTypes.number,
// };

const mapStateToProps = (state: any) => ({ vm: state.scratchGui.vm });

export default connect(mapStateToProps)(ListMonitor);
