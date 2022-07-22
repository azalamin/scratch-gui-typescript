import keyMirror from 'keymirror';

import Modal from '../../containers/modal.jsx';
import Box from '../box/box.jsx';

import AutoScanningStep from '../../containers/auto-scanning-step.js';
import ScanningStep from '../../containers/scanning-step.js';
import ConnectedStep from './connected-step.js';
import ConnectingStep from './connecting-step.js';
import ErrorStep from './error-step.jsx';
import UnavailableStep from './unavailable-step.jsx';

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
        <ScanningStep
          extensionId={''}
          onConnected={''}
          onConnecting={''}
          vm={''}
          {...props}
        />
      )}
      {props.phase === PHASES.scanning && props.useAutoScan && (
        <AutoScanningStep
          extensionId={''}
          onConnecting={''}
          vm={''}
          {...props}
        />
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
      {props.phase === PHASES.error && (
        <ErrorStep connectionIconURL={''} {...props} />
      )}
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
