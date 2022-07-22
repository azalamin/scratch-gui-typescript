import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

import Box from '../box/box.jsx';
import Dots from './dots.jsx';

import closeIcon from '../close-button/icon--close.svg';
import bluetoothIcon from './icons/bluetooth-white.svg';

import styles from './connectionModal.module.css';

const ConnectingStep = (props: PropsInterface) => (
  <Box className={styles.body}>
    <Box className={styles.activityArea}>
      <Box className={styles.centeredRow}>
        <div className={styles.peripheralActivity}>
          <img
            className={styles.peripheralActivityIcon}
            src={props.connectionIconURL}
            alt=''
          />
          <img
            className={styles.bluetoothConnectingIcon}
            src={bluetoothIcon}
            alt=''
          />
        </div>
      </Box>
    </Box>
    <Box className={styles.bottomArea}>
      <Box className={classNames(styles.bottomAreaItem, styles.instructions)}>
        {props.connectingMessage}
      </Box>
      <Dots className={styles.bottomAreaItem} counter={1} total={3} />
      <div
        className={classNames(styles.bottomAreaItem, styles.segmentedButton)}
      >
        <button disabled className={styles.connectionButton}>
          <FormattedMessage
            defaultMessage='Connecting...'
            description='Label indicating that connection is in progress'
            id='gui.connection.connecting-cancelbutton'
          />
        </button>
        <button
          className={styles.connectionButton}
          onClick={props.onDisconnect}
        >
          <img className={styles.abortConnectingIcon} src={closeIcon} alt='' />
        </button>
      </div>
    </Box>
  </Box>
);

interface PropsInterface {
  connectingMessage: JSX.Element;
  connectionIconURL: string;
  onDisconnect: any;
}

// TODO
// ConnectingStep.propTypes = {
//     connectingMessage: PropTypes.node.isRequired,
//     connectionIconURL: PropTypes.string.isRequired,
//     onDisconnect: PropTypes.func
// };

export default ConnectingStep;
