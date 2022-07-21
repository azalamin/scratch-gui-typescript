import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import ScanningStepComponent, {
  PHASES,
} from '../components/connection-modal/auto-scanning-step.jsx';
import VM from 'scratch-vm';

// class AutoScanningStep extends React.Component {
//     constructor (props) {
//         super(props);
//         bindAll(this, [
//             'handlePeripheralListUpdate',
//             'handlePeripheralScanTimeout',
//             'handleStartScan',
//             'handleRefresh'
//         ]);
//         this.state = {
//             phase: PHASES.prescan
//         };
//     }
//     componentWillUnmount () {
//         // @todo: stop the peripheral scan here
//         this.unbindPeripheralUpdates();
//     }
// handlePeripheralScanTimeout () {
//     this.setState({
//         phase: PHASES.notfound
//     });
//     this.unbindPeripheralUpdates();
// }
// handlePeripheralListUpdate (newList) {
//     // TODO: sort peripherals by signal strength? so they don't jump around
//     const peripheralArray = Object.keys(newList).map(id =>
//         newList[id]
//     );
//     if (peripheralArray.length > 0) {
//         this.props.onConnecting(peripheralArray[0].peripheralId);
//     }
// }
// bindPeripheralUpdates () {
//     this.props.vm.on(
//         'PERIPHERAL_LIST_UPDATE', this.handlePeripheralListUpdate);
//     this.props.vm.on(
//         'PERIPHERAL_SCAN_TIMEOUT', this.handlePeripheralScanTimeout);
// }
// unbindPeripheralUpdates () {
//     this.props.vm.removeListener(
//         'PERIPHERAL_LIST_UPDATE', this.handlePeripheralListUpdate);
//     this.props.vm.removeListener(
//         'PERIPHERAL_SCAN_TIMEOUT', this.handlePeripheralScanTimeout);
// }
// handleRefresh () {
//     // @todo: stop the peripheral scan here, it is more important for auto scan
//     // due to timeout and cancellation
//     this.setState({
//         phase: PHASES.prescan
//     });
//     this.unbindPeripheralUpdates();
// }
// handleStartScan () {
//     this.bindPeripheralUpdates();
//     this.props.vm.scanForPeripheral(this.props.extensionId);
//     this.setState({
//         phase: PHASES.pressbutton
//     });

// }
//     render () {
//         return (
//             <ScanningStepComponent
//                 connectionTipIconURL={this.props.connectionTipIconURL}
//                 phase={this.state.phase}
//                 title={this.props.extensionId}
//                 onRefresh={this.handleRefresh}
//                 onStartScan={this.handleStartScan}
//             />
//         );
//     }
// }

const AutoScanningStep = (props: PropsInterface) => {
  const [phase, setPhase] = useState(PHASES.prescan);

  useEffect(() => {
    return () => {
      // @todo: stop the peripheral scan here
      unbindPeripheralUpdates();
    };
  }, [unbindPeripheralUpdates]);

  const handlePeripheralScanTimeout = () => {
    setPhase(PHASES.notfound);
    unbindPeripheralUpdates();
  };
  const handlePeripheralListUpdate = (newList: any) => {
    // TODO: sort peripherals by signal strength? so they don't jump around
    const peripheralArray = Object.keys(newList).map(id => newList[id]);
    if (peripheralArray.length > 0) {
      props.onConnecting(peripheralArray[0].peripheralId);
    }
  };
  const bindPeripheralUpdates = () => {
    props.vm.on('PERIPHERAL_LIST_UPDATE', handlePeripheralListUpdate);
    props.vm.on('PERIPHERAL_SCAN_TIMEOUT', handlePeripheralScanTimeout);
  };
  const unbindPeripheralUpdates = () => {
    props.vm.removeListener(
      'PERIPHERAL_LIST_UPDATE',
      handlePeripheralListUpdate
    );
    props.vm.removeListener(
      'PERIPHERAL_SCAN_TIMEOUT',
      handlePeripheralScanTimeout
    );
  };
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
  extensionId: string;
  onConnecting: any;
  vm: any;
}

export default AutoScanningStep;
