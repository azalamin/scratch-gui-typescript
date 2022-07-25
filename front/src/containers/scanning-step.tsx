import { useCallback, useEffect, useState } from 'react';
import ScanningStepComponent from '../components/connection-modal/scanning-step';

const ScanningStep = (props: PropsInterface) => {
  const [states, setStates] = useState<any>({
    scanning: true,
    peripheralList: [],
  });

  const handlePeripheralScanTimeout = () => {
    setStates({
      scanning: false,
      peripheralList: [],
    });
  };
  const handlePeripheralListUpdate = useCallback(
    (newList: any) => {
      // TODO: sort peripherals by signal strength? so they don't jump around
      const peripheralArray = Object.keys(newList).map(id => newList[id]);
      setStates({ ...states, peripheralList: peripheralArray });
    },
    [states]
  );

  const handleRefresh = () => {
    props.vm.scanForPeripheral(props.extensionId);
    setStates({
      scanning: true,
      peripheralList: [],
    });
  };

  useEffect(() => {
    props.vm.scanForPeripheral(props.extensionId);
    props.vm.on('PERIPHERAL_LIST_UPDATE', handlePeripheralListUpdate);
    props.vm.on('PERIPHERAL_SCAN_TIMEOUT', handlePeripheralScanTimeout);

    return () => {
      // @todo: stop the peripheral scan here
      props.vm.removeListener(
        'PERIPHERAL_LIST_UPDATE',
        handlePeripheralListUpdate
      );
      props.vm.removeListener(
        'PERIPHERAL_SCAN_TIMEOUT',
        handlePeripheralScanTimeout
      );
    };
  }, [handlePeripheralListUpdate, props.extensionId, props.vm]);

  return (
    <ScanningStepComponent
      connectionSmallIconURL={props.connectionSmallIconURL}
      peripheralList={states.peripheralList}
      phase={states.phase}
      scanning={states.scanning}
      title={props.extensionId}
      onConnected={props.onConnected}
      onConnecting={props.onConnecting}
      onRefresh={handleRefresh}
    />
  );
};

interface PropsInterface {
  connectionSmallIconURL: string;
  extensionId?: string;
  onConnected?: any;
  onConnecting?: any;
  vm?: any;
}

// TODO
// ScanningStep.propTypes = {
//     connectionSmallIconURL: PropTypes.string,
//     extensionId: PropTypes.string.isRequired,
//     onConnected: PropTypes.func.isRequired,
//     onConnecting: PropTypes.func.isRequired,
//     vm: PropTypes.instanceOf(VM).isRequired
// };

export default ScanningStep;
