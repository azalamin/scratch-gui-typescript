import keyMirror from 'keymirror';

import Modal from '../../containers/modal';
import Box from '../box/box';

import AutoScanningStep from '../../containers/auto-scanning-step';
import ScanningStep from '../../containers/scanning-step';
import ConnectedStep from './connected-step';
import ConnectingStep from './connecting-step';
import ErrorStep from './error-step';
import UnavailableStep from './unavailable-step';

import styles from './connectionModal.module.css';

const PHASES = keyMirror({
  scanning: null,
  connecting: null,
  connected: null,
  error: null,
  unavailable: null,
});

const ConnectionModalComponent = (props: PropsInterface) => (
  <Modal
    className={styles.modalContent}
    contentLabel={props.name}
    headerClassName={styles.header}
    headerImage={props.connectionSmallIconURL}
    id='connectionModal'
    onHelp={props.onHelp}
    onRequestClose={props.onCancel}
  >
    <Box className={styles.body}>
      {props.phase === PHASES.scanning && !props.useAutoScan && (
        <ScanningStep {...props} />
      )}
      {props.phase === PHASES.scanning && props.useAutoScan && (
        <AutoScanningStep {...props} />
      )}
      {props.phase === PHASES.connecting && (
        <ConnectingStep
          connectionIconURL={''}
          onDisconnect={undefined}
          {...props}
        />
      )}
      {props.phase === PHASES.connected && (
        <ConnectedStep
          connectionIconURL={''}
          onDisconnect={undefined}
          {...props}
        />
      )}
      {props.phase === PHASES.error && <ErrorStep {...props} />}
      {props.phase === PHASES.unavailable && <UnavailableStep {...props} />}
    </Box>
  </Modal>
);

interface PropsInterface {
  connectingMessage: JSX.Element;
  connectionSmallIconURL: string;
  connectionTipIconURL: string;
  name: JSX.Element;
  onCancel: any;
  onHelp: any;
  phase: any;
  title: string;
  useAutoScan: boolean;
  connectionIconURL?: any;
  extensionId?: any;
  vm?: any;
  onConnected?: any;
  onConnecting?: any;
  onDisconnect?: any;
  onScanning?: any;
}

// TODO
// ConnectionModalComponent.propTypes = {
//   connectingMessage: PropTypes.node.isRequired,
//   connectionSmallIconURL: PropTypes.string,
//   connectionTipIconURL: PropTypes.string,
//   name: PropTypes.node,
//   onCancel: PropTypes.func.isRequired,
//   onHelp: PropTypes.func.isRequired,
//   phase: PropTypes.oneOf(Object.keys(PHASES)).isRequired,
//   title: PropTypes.string.isRequired,
//   useAutoScan: PropTypes.bool.isRequired,
// };

ConnectionModalComponent.defaultProps = {
  connectingMessage: 'Connecting',
};

export { ConnectionModalComponent as default, PHASES };
