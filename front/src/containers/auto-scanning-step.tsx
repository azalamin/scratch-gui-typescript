import { useCallback, useEffect, useState } from 'react';
import ScanningStepComponent, {
  PHASES,
} from '../components/connection-modal/auto-scanning-step';

const AutoScanningStep = (props: PropsInterface) => {
  const [phase, setPhase] = useState(PHASES.prescan);

  const handlePeripheralListUpdate = useCallback(
    (newList: any) => {
      // TODO: sort peripherals by signal strength? so they don't jump around
      const peripheralArray = Object.keys(newList).map(id => newList[id]);
      if (peripheralArray.length > 0) {
        props.onConnecting(peripheralArray[0].peripheralId);
      }
    },
    [props]
  );
  const bindPeripheralUpdates = () => {
    props.vm.on('PERIPHERAL_LIST_UPDATE', handlePeripheralListUpdate);
    props.vm.on('PERIPHERAL_SCAN_TIMEOUT', handlePeripheralScanTimeout);
  };
  const unbindPeripheralUpdates = useCallback(() => {
    props.vm.removeListener(
      'PERIPHERAL_LIST_UPDATE',
      handlePeripheralListUpdate
    );
    props.vm.removeListener(
      'PERIPHERAL_SCAN_TIMEOUT',
      handlePeripheralScanTimeout
    );
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
  }, [handlePeripheralListUpdate, handlePeripheralScanTimeout, props.vm]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function handlePeripheralScanTimeout() {
    setPhase(PHASES.notfound);
    unbindPeripheralUpdates();
  }

  const handleRefresh = () => {
    // @todo: stop the peripheral scan here, it is more important for auto scan
    // due to timeout and cancellation
    setPhase(PHASES.prescan);
    unbindPeripheralUpdates();
  };
  const handleStartScan = () => {
    bindPeripheralUpdates();
    props.vm.scanForPeripheral(props.extensionId);
    setPhase(PHASES.pressbutton);
  };

  useEffect(() => {
    return () => {
      // @todo: stop the peripheral scan here
      unbindPeripheralUpdates();
    };
  }, [unbindPeripheralUpdates]);

  return (
    <ScanningStepComponent
      connectionTipIconURL={props.connectionTipIconURL}
      phase={phase}
      title={props.extensionId}
      onRefresh={handleRefresh}
      onStartScan={handleStartScan}
    />
  );
};

interface PropsInterface {
  connectionTipIconURL: string;
  extensionId?: string;
  onConnecting?: any;
  vm?: any;
}

export default AutoScanningStep;
