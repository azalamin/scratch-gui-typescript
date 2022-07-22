import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

import Box from '../box/box.jsx';
import Dots from './dots.js';
import backIcon from './icons/back.svg';
import helpIcon from './icons/help.svg';

import styles from './connectionModal.module.css';

const ErrorStep = (props: PropsInterface) => (
  <Box className={styles.body}>
    <Box className={styles.activityArea}>
      <Box className={styles.centeredRow}>
        <div className={styles.peripheralActivity}>
          <img
            className={styles.peripheralActivityIcon}
            src={props.connectionIconURL}
            alt=''
          />
        </div>
      </Box>
    </Box>
    <Box className={styles.bottomArea}>
      <div className={classNames(styles.bottomAreaItem, styles.instructions)}>
        <FormattedMessage
          defaultMessage='Oops, looks like something went wrong.'
          description='The device connection process has encountered an error.'
          id='gui.connection.error.errorMessage'
        />
      </div>
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
            id='gui.connection.error.tryagainbutton'
          />
        </button>
        <button className={styles.connectionButton} onClick={props.onHelp}>
          <img className={styles.buttonIconLeft} src={helpIcon} alt='' />
          <FormattedMessage
            defaultMessage='Help'
            description='Button to view help content'
            id='gui.connection.error.helpbutton'
          />
        </button>
      </Box>
    </Box>
  </Box>
);

interface PropsInterface {
  connectionIconURL: string;
  onHelp: any;
  onScanning: any;
}

// TODO
// ErrorStep.propTypes = {
//   connectionIconURL: PropTypes.string.isRequired,
//   onHelp: PropTypes.func,
//   onScanning: PropTypes.func,
// };

export default ErrorStep;
