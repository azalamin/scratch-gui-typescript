import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import ConnectionModalComponent, {
  PHASES,
} from '../components/connection-modal/connection-modal.jsx';
import analytics from '../lib/analytics';
import extensionData from '../lib/libraries/extensions/index.jsx';
import { closeConnectionModal } from '../reducers/modals';

const ConnectionModal = (props: PropsInterface) => {
  const [states, setStates] = useState({
    extension: extensionData.find(
      (ext: any) => ext.extensionId === props.extensionId
    ),
    phase: props.vm.getPeripheralIsConnected(props.extensionId)
      ? PHASES.connected
      : PHASES.scanning,
  });

  useEffect(() => {
    props.vm.on('PERIPHERAL_CONNECTED', handleConnected);
    props.vm.on('PERIPHERAL_REQUEST_ERROR', handleError);

    return () => {
      removeEventListeners();
    };
  });

  const removeEventListeners = () => {
    props.vm.removeListener('PERIPHERAL_CONNECTED', handleConnected);
    props.vm.removeListener('PERIPHERAL_REQUEST_ERROR', handleError);
  };

  const handleScanning = () => {
    setStates({
      ...states,
      phase: PHASES.scanning,
    });
  };
  const handleConnecting = (peripheralId: any) => {
    props.vm.connectPeripheral(props.extensionId, peripheralId);
    setStates({
      ...states,
      phase: PHASES.connecting,
    });
    analytics.event({
      category: 'extensions',
      action: 'connecting',
      label: props.extensionId,
    });
  };
  const handleDisconnect = () => {
    try {
      props.vm.disconnectPeripheral(props.extensionId);
    } finally {
      props.onCancel();
    }
  };
  const handleCancel = () => {
    try {
      // If we're not connected to a peripheral, close the websocket so we stop scanning.
      if (!props.vm.getPeripheralIsConnected(props.extensionId)) {
        props.vm.disconnectPeripheral(props.extensionId);
      }
    } finally {
      // Close the modal.
      props.onCancel();
    }
  };
  const handleError = () => {
    // Assume errors that come in during scanning phase are the result of not
    // having scratch-link installed.
    if (
      states.phase === PHASES.scanning ||
      states.phase === PHASES.unavailable
    ) {
      setStates({
        ...states,
        phase: PHASES.unavailable,
      });
    } else {
      setStates({
        ...states,
        phase: PHASES.error,
      });
      analytics.event({
        category: 'extensions',
        action: 'connecting error',
        label: props.extensionId,
      });
    }
  };
  const handleConnected = () => {
    setStates({
      ...states,
      phase: PHASES.connected,
    });
    analytics.event({
      category: 'extensions',
      action: 'connected',
      label: props.extensionId,
    });
  };
  const handleHelp = () => {
    window.open(states.extension.helpLink, '_blank');
    analytics.event({
      category: 'extensions',
      action: 'help',
      label: props.extensionId,
    });
  };

  return (
    <ConnectionModalComponent
      connectingMessage={states.extension && states.extension.connectingMessage}
      connectionIconURL={states.extension && states.extension.connectionIconURL}
      connectionSmallIconURL={
        states.extension && states.extension.connectionSmallIconURL
      }
      connectionTipIconURL={
        states.extension && states.extension.connectionTipIconURL
      }
      extensionId={props.extensionId}
      name={states.extension && states.extension.name}
      phase={states.phase}
      title={props.extensionId}
      useAutoScan={states.extension && states.extension.useAutoScan}
      vm={props.vm}
      onCancel={handleCancel}
      onConnected={handleConnected}
      onConnecting={handleConnecting}
      onDisconnect={handleDisconnect}
      onHelp={handleHelp}
      onScanning={handleScanning}
    />
  );
};

interface PropsInterface {
  extensionId: string;
  onCancel: any;
  vm: any;
}

const mapStateToProps = (state: any) => ({
  extensionId: state.scratchGui.connectionModal.extensionId,
});

const mapDispatchToProps = (dispatch: any) => ({
  onCancel: () => {
    dispatch(closeConnectionModal());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ConnectionModal);
