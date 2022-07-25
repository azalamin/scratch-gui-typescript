import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { setVariableValue } from '../lib/variable-utils';

import SliderMonitorComponent from '../components/monitor/slider-monitor';

const SliderMonitor = (prop: PropsInterface) => {
  const [stateValue, setValue] = useState<any>(prop.value);

  useEffect(() => {
    if (stateValue !== prop.value) {
      setValue(prop.value);
    }
  }, [prop, stateValue]);

  const handleSliderUpdate = (e: any) => {
    setValue(Number(e.target.value));
    const { vm, targetId, id: variableId } = prop;
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

interface PropsInterface {
  id: string;
  targetId: string;
  value: any;
  vm: any;
}

// TODO
// SliderMonitor.propTypes = {
//     id: PropTypes.string,
//     targetId: PropTypes.string,
//     value: PropTypes.oneOfType([
//         PropTypes.number,
//         PropTypes.string
//     ]),
//     vm: PropTypes.instanceOf(VM)
// };

const mapStateToProps = (state: any) => ({ vm: state.scratchGui.vm });

export default connect(mapStateToProps)(SliderMonitor);
