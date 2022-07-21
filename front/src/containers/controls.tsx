import { connect } from 'react-redux';

import ControlsComponent from '../components/controls/controls.jsx';

const Controls = (prop: PropsInterface) => {
  const handleGreenFlagClick = (e: any) => {
    e.preventDefault();
    if (e.shiftKey) {
      prop.vm.setTurboMode(!prop.turbo);
    } else {
      if (!prop.isStarted) {
        prop.vm.start();
      }
      prop.vm.greenFlag();
    }
  };
  const handleStopAllClick = (e: any) => {
    e.preventDefault();
    prop.vm.stopAll();
  };
  const {
    vm, // eslint-disable-line no-unused-vars
    isStarted, // eslint-disable-line no-unused-vars
    projectRunning,
    turbo,
    ...props
  } = prop;
  return (
    <ControlsComponent
      {...props}
      active={projectRunning}
      turbo={turbo}
      onGreenFlagClick={handleGreenFlagClick}
      onStopAllClick={handleStopAllClick}
    />
  );
};

interface PropsInterface {
  isStarted: boolean;
  projectRunning: boolean;
  turbo: boolean;
  vm: any;
}

const mapStateToProps = (state: any) => ({
  isStarted: state.scratchGui.vmStatus.running,
  projectRunning: state.scratchGui.vmStatus.running,
  turbo: state.scratchGui.vmStatus.turbo,
});
// no-op function to prevent dispatch prop being passed to component
const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Controls);
