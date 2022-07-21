import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import bindAll from 'lodash.bindall';
import ScanningStepComponent from '../components/connection-modal/scanning-step.jsx';
import VM from 'scratch-vm';


const ScanningStep = (props) => {
    const [states, setStates] = useState({
            scanning: true,
            peripheralList: []
    });

    useEffect(() => {
         props.vm.scanForPeripheral( props.extensionId);
         props.vm.on(
            'PERIPHERAL_LIST_UPDATE',  handlePeripheralListUpdate);
         props.vm.on(
            'PERIPHERAL_SCAN_TIMEOUT',  handlePeripheralScanTimeout);
    
      return () => {
        // @todo: stop the peripheral scan here
         props.vm.removeListener(
            'PERIPHERAL_LIST_UPDATE',  handlePeripheralListUpdate);
         props.vm.removeListener(
            'PERIPHERAL_SCAN_TIMEOUT',  handlePeripheralScanTimeout);
      }
    }, []);

    const handlePeripheralScanTimeout = () => {
         setStates({
            scanning: false,
            peripheralList: []
        });
    }
    const handlePeripheralListUpdate = (newList) => {
        // TODO: sort peripherals by signal strength? so they don't jump around
        const peripheralArray = Object.keys(newList).map(id =>
            newList[id]
        );
         setState({peripheralList: peripheralArray});
    }
    const handleRefresh = () => {
         props.vm.scanForPeripheral( props.extensionId);
         setStates({
            scanning: true,
            peripheralList: []
        });
    }
    

    return (
            <ScanningStepComponent
                connectionSmallIconURL={ props.connectionSmallIconURL}
                peripheralList={ states.peripheralList}
                phase={ states.phase}
                scanning={ states.scanning}
                title={ props.extensionId}
                onConnected={ props.onConnected}
                onConnecting={ props.onConnecting}
                onRefresh={ handleRefresh}
            />
        );
};


ScanningStep.propTypes = {
    connectionSmallIconURL: PropTypes.string,
    extensionId: PropTypes.string.isRequired,
    onConnected: PropTypes.func.isRequired,
    onConnecting: PropTypes.func.isRequired,
    vm: PropTypes.instanceOf(VM).isRequired
};

export default ScanningStep;
