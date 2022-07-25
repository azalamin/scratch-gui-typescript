import { useState } from 'react';
import PromptComponent from '../components/prompt/prompt';

const Prompt = (props: PropsInterface) => {
  const [states, setStates] = useState<any>({
    inputValue: '',
    globalSelected: true,
    cloudSelected: false,
    canAddCloudVariable:
      (props.vm && props.vm.runtime.canAddCloudVariable()) || false,
  });

  const handleKeyPress = (event: any) => {
    if (event.key === 'Enter') handleOk();
  };
  const handleFocus = (event: any) => {
    event.target.select();
  };
  const handleOk = () => {
    props.onOk(states.inputValue, {
      scope: states.globalSelected ? 'global' : 'local',
      isCloud: states.cloudSelected,
    });
  };
  const handleCancel = () => {
    props.onCancel();
  };
  const handleChange = (e: any) => {
    setStates({ ...states, inputValue: e.target.value });
  };
  const handleScopeOptionSelection = (e: any) => {
    setStates({ ...states, globalSelected: e.target.value === 'global' });
  };
  const handleCloudVariableOptionChange = (e: any) => {
    if (!props.showCloudOption) return;

    const checked = e.target.checked;
    setStates({ ...states, cloudSelected: checked });
    if (checked) {
      setStates({ ...states, globalSelected: true });
    }
  };

  return (
    <PromptComponent
      canAddCloudVariable={states.canAddCloudVariable}
      cloudSelected={states.cloudSelected}
      defaultValue={props.defaultValue}
      globalSelected={states.globalSelected}
      isStage={props.isStage}
      showListMessage={props.showListMessage}
      label={props.label}
      showCloudOption={props.showCloudOption}
      showVariableOptions={props.showVariableOptions}
      title={props.title}
      onCancel={handleCancel}
      onChange={handleChange}
      onCloudVarOptionChange={handleCloudVariableOptionChange}
      onFocus={handleFocus}
      onKeyPress={handleKeyPress}
      onOk={handleOk}
      onScopeOptionSelection={handleScopeOptionSelection}
    />
  );
};

interface PropsInterface {
  defaultValue: string;
  isStage: boolean;
  showListMessage: boolean;
  label: string;
  onCancel: any;
  onOk: any;
  showCloudOption: boolean;
  showVariableOptions: boolean;
  title: string;
  vm: any;
}

// TODO
// Prompt.propTypes = {
//     defaultValue: PropTypes.string,
//     isStage: PropTypes.bool.isRequired,
//     showListMessage: PropTypes.bool.isRequired,
//     label: PropTypes.string.isRequired,
//     onCancel: PropTypes.func.isRequired,
//     onOk: PropTypes.func.isRequired,
//     showCloudOption: PropTypes.bool.isRequired,
//     showVariableOptions: PropTypes.bool.isRequired,
//     title: PropTypes.string.isRequired,
//     vm: PropTypes.instanceOf(VM)
// };

export default Prompt;
