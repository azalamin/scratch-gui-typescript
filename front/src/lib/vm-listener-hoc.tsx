import bindAll from 'lodash.bindall';
import React from 'react';

import { connect } from 'react-redux';

import { showExtensionAlert } from '../reducers/alerts';
import { updateBlockDrag } from '../reducers/block-drag';
import { updateMicIndicator } from '../reducers/mic-indicator';
import { updateMonitors } from '../reducers/monitors';
import {
  setProjectChanged,
  setProjectUnchanged,
} from '../reducers/project-changed';
import { updateTargets } from '../reducers/targets';
import {
  setRunningState,
  setStartedState,
  setTurboState,
} from '../reducers/vm-status';

/*
 * Higher Order Component to manage events emitted by the VM
 * @param {React.Component} WrappedComponent component to manage VM events for
 * @returns {React.Component} connected component with vm events bound to redux
 */
const vmListenerHOC = function (WrappedComponent: any) {
  class VMListener extends React.Component<PropsInterface> {
    static defaultProps: { attachKeyboardEvents: any; onGreenFlag: any };
    constructor(props: PropsInterface) {
      super(props);
      bindAll(this, [
        'handleKeyDown',
        'handleKeyUp',
        'handleProjectChanged',
        'handleTargetsUpdate',
      ]);
      // We have to start listening to the vm here rather than in
      // componentDidMount because the HOC mounts the wrapped component,
      // so the HOC componentDidMount triggers after the wrapped component
      // mounts.
      // If the wrapped component uses the vm in componentDidMount, then
      // we need to start listening before mounting the wrapped component.
      this.props.vm.on('targetsUpdate', this.handleTargetsUpdate);
      this.props.vm.on('MONITORS_UPDATE', this.props.onMonitorsUpdate);
      this.props.vm.on('BLOCK_DRAG_UPDATE', this.props.onBlockDragUpdate);
      this.props.vm.on('TURBO_MODE_ON', this.props.onTurboModeOn);
      this.props.vm.on('TURBO_MODE_OFF', this.props.onTurboModeOff);
      this.props.vm.on('PROJECT_RUN_START', this.props.onProjectRunStart);
      this.props.vm.on('PROJECT_RUN_STOP', this.props.onProjectRunStop);
      this.props.vm.on('PROJECT_CHANGED', this.handleProjectChanged);
      this.props.vm.on('RUNTIME_STARTED', this.props.onRuntimeStarted);
      this.props.vm.on('PROJECT_START', this.props.onGreenFlag);
      this.props.vm.on(
        'PERIPHERAL_CONNECTION_LOST_ERROR',
        this.props.onShowExtensionAlert
      );
      this.props.vm.on('MIC_LISTENING', this.props.onMicListeningUpdate);
    }
    componentDidMount() {
      if (this.props.attachKeyboardEvents) {
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
      }
      this.props.vm.postIOData('userData', { username: this.props.username });
    }
    componentDidUpdate(prevProps: any) {
      if (prevProps.username !== this.props.username) {
        this.props.vm.postIOData('userData', { username: this.props.username });
      }

      // Re-request a targets update when the shouldUpdateTargets state changes to true
      // i.e. when the editor transitions out of fullscreen/player only modes
      if (this.props.shouldUpdateTargets && !prevProps.shouldUpdateTargets) {
        this.props.vm.emitTargetsUpdate(
          false /* Emit the event, but do not trigger project change */
        );
      }
    }
    componentWillUnmount() {
      this.props.vm.removeListener(
        'PERIPHERAL_CONNECTION_LOST_ERROR',
        this.props.onShowExtensionAlert
      );
      if (this.props.attachKeyboardEvents) {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
      }
    }
    handleProjectChanged() {
      if (this.props.shouldUpdateProjectChanged && !this.props.projectChanged) {
        this.props.onProjectChanged();
      }
    }
    handleTargetsUpdate(data: any) {
      if (this.props.shouldUpdateTargets) {
        this.props.onTargetsUpdate(data);
      }
    }
    handleKeyDown(e: any) {
      // Don't capture keys intended for Blockly inputs.
      if (e.target !== document && e.target !== document.body) return;

      const key = !e.key || e.key === 'Dead' ? e.keyCode : e.key;
      this.props.vm.postIOData('keyboard', {
        key: key,
        isDown: true,
      });

      // Prevent space/arrow key from scrolling the page.
      if (
        e.keyCode === 32 || // 32=space
        (e.keyCode >= 37 && e.keyCode <= 40)
      ) {
        // 37, 38, 39, 40 are arrows
        e.preventDefault();
      }
    }
    handleKeyUp(e: any) {
      // Always capture up events,
      // even those that have switched to other targets.
      const key = !e.key || e.key === 'Dead' ? e.keyCode : e.key;
      this.props.vm.postIOData('keyboard', {
        key: key,
        isDown: false,
      });

      // E.g., prevent scroll.
      if (e.target !== document && e.target !== document.body) {
        e.preventDefault();
      }
    }
    render() {
      const {
        /* eslint-disable no-unused-vars */
        attachKeyboardEvents,
        projectChanged,
        shouldUpdateTargets,
        shouldUpdateProjectChanged,
        onBlockDragUpdate,
        onGreenFlag,
        onKeyDown,
        onKeyUp,
        onMicListeningUpdate,
        onMonitorsUpdate,
        onTargetsUpdate,
        onProjectChanged,
        onProjectRunStart,
        onProjectRunStop,
        onProjectSaved,
        onRuntimeStarted,
        onTurboModeOff,
        onTurboModeOn,
        onShowExtensionAlert,
        /* eslint-enable no-unused-vars */
        ...props
      } = this.props;
      return <WrappedComponent {...props} />;
    }
  }

  interface PropsInterface {
    attachKeyboardEvents: boolean;
    onBlockDragUpdate: any;
    onGreenFlag: any;
    onKeyDown: any;
    onKeyUp: any;
    onMicListeningUpdate: any;
    onMonitorsUpdate: any;
    onProjectChanged: any;
    onProjectRunStart: any;
    onProjectRunStop: any;
    onProjectSaved: any;
    onRuntimeStarted: any;
    onShowExtensionAlert: any;
    onTargetsUpdate: any;
    onTurboModeOff: any;
    onTurboModeOn: any;
    projectChanged: boolean;
    shouldUpdateTargets: boolean;
    shouldUpdateProjectChanged: boolean;
    username: string;
    vm: any;
  }

  // TODO
  //   VMListener.propTypes = {
  //     attachKeyboardEvents: PropTypes.bool,
  //     onBlockDragUpdate: PropTypes.func.isRequired,
  //     onGreenFlag: PropTypes.func,
  //     onKeyDown: PropTypes.func,
  //     onKeyUp: PropTypes.func,
  //     onMicListeningUpdate: PropTypes.func.isRequired,
  //     onMonitorsUpdate: PropTypes.func.isRequired,
  //     onProjectChanged: PropTypes.func.isRequired,
  //     onProjectRunStart: PropTypes.func.isRequired,
  //     onProjectRunStop: PropTypes.func.isRequired,
  //     onProjectSaved: PropTypes.func.isRequired,
  //     onRuntimeStarted: PropTypes.func.isRequired,
  //     onShowExtensionAlert: PropTypes.func.isRequired,
  //     onTargetsUpdate: PropTypes.func.isRequired,
  //     onTurboModeOff: PropTypes.func.isRequired,
  //     onTurboModeOn: PropTypes.func.isRequired,
  //     projectChanged: PropTypes.bool,
  //     shouldUpdateTargets: PropTypes.bool,
  //     shouldUpdateProjectChanged: PropTypes.bool,
  //     username: PropTypes.string,
  //     vm: PropTypes.instanceOf(VM).isRequired,
  //   };

  VMListener.defaultProps = {
    attachKeyboardEvents: true,
    onGreenFlag: () => ({}),
  };
  const mapStateToProps = (state: any) => ({
    projectChanged: state.scratchGui.projectChanged,
    // Do not emit target or project updates in fullscreen or player only mode
    // or when recording sounds (it leads to garbled recordings on low-power machines)
    shouldUpdateTargets:
      !state.scratchGui.mode.isFullScreen &&
      !state.scratchGui.mode.isPlayerOnly &&
      !state.scratchGui.modals.soundRecorder,
    // Do not update the projectChanged state in fullscreen or player only mode
    shouldUpdateProjectChanged:
      !state.scratchGui.mode.isFullScreen &&
      !state.scratchGui.mode.isPlayerOnly,
    vm: state.scratchGui.vm,
    username:
      state.session && state.session.session && state.session.session.user
        ? state.session.session.user.username
        : '',
  });
  const mapDispatchToProps = (dispatch: any) => ({
    onTargetsUpdate: (data: any) => {
      dispatch(updateTargets(data.targetList, data.editingTarget));
    },
    onMonitorsUpdate: (monitorList: any) => {
      dispatch(updateMonitors(monitorList));
    },
    onBlockDragUpdate: (areBlocksOverGui: any) => {
      dispatch(updateBlockDrag(areBlocksOverGui));
    },
    onProjectRunStart: () => dispatch(setRunningState(true)),
    onProjectRunStop: () => dispatch(setRunningState(false)),
    onProjectChanged: () => dispatch(setProjectChanged()),
    onProjectSaved: () => dispatch(setProjectUnchanged()),
    onRuntimeStarted: () => dispatch(setStartedState(true)),
    onTurboModeOn: () => dispatch(setTurboState(true)),
    onTurboModeOff: () => dispatch(setTurboState(false)),
    onShowExtensionAlert: (data: any) => {
      dispatch(showExtensionAlert(data));
    },
    onMicListeningUpdate: (listening: any) => {
      dispatch(updateMicIndicator(listening));
    },
  });
  return connect(mapStateToProps, mapDispatchToProps)(VMListener);
};

export default vmListenerHOC;
