import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

import Box from '../box/box.jsx';
import Dots from './dots.js';
import backIcon from './icons/back.svg';
import bluetoothIcon from './icons/bluetooth.svg';
import helpIcon from './icons/help.svg';
import scratchLinkIcon from './icons/scratchlink.svg';

import styles from './connectionModal.module.css';

const UnavailableStep = (props: PropsInterface) => (
  <Box className={styles.body}>
    <Box className={styles.activityArea}>
      <div className={styles.scratchLinkHelp}>
        <div className={styles.scratchLinkHelpStep}>
          <div className={styles.helpStepNumber}>{'1'}</div>
          <div className={styles.helpStepImage}>
            <img
              className={styles.scratchLinkIcon}
              src={scratchLinkIcon}
              alt=''
            />
          </div>
          <div className={styles.helpStepText}>
            <FormattedMessage
              defaultMessage='Make sure you have Scratch Link installed and running'
              description='Message for getting Scratch Link installed'
              id='gui.connection.unavailable.installscratchlink'
            />
          </div>
        </div>
        <div className={styles.scratchLinkHelpStep}>
          <div className={styles.helpStepNumber}>{'2'}</div>
          <div className={styles.helpStepImage}>
            <img
              className={styles.scratchLinkIcon}
              src={bluetoothIcon}
              alt=''
            />
          </div>
          <div className={styles.helpStepText}>
            <FormattedMessage
              defaultMessage='Check that Bluetooth is enabled'
              description='Message for making sure Bluetooth is enabled'
              id='gui.connection.unavailable.enablebluetooth'
            />
          </div>
        </div>
      </div>
    </Box>
    <Box className={styles.bottomArea}>
      <Dots error className={styles.bottomAreaItem} total={3} />
      <Box className={classNames(styles.bottomAreaItem, styles.buttonRow)}>
        <button className={styles.connectionButton} onClick={props.onScanning}>
          <img
            className={classNames(styles.buttonIconLeft, styles.buttonIconBack)}
            src={backIcon}
            alt=''
          />
          <FormattedMessage
            defaultMessage='Try again'
            description='Button to initiate trying the device connection again after an error'
            id='gui.connection.unavailable.tryagainbutton'
          />
        </button>
        <button className={styles.connectionButton} onClick={props.onHelp}>
          <img className={styles.buttonIconLeft} src={helpIcon} alt='' />
          <FormattedMessage
            defaultMessage='Help'
            description='Button to view help content'
            id='gui.connection.unavailable.helpbutton'
          />
        </button>
      </Box>
    </Box>
  </Box>
);

interface PropsInterface {
  onHelp?: any;
  onScanning?: any;
}

// TODO
// UnavailableStep.propTypes = {
//   onHelp: PropTypes.func,
//   onScanning: PropTypes.func,
// };

export default UnavailableStep;
