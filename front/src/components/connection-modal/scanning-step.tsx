import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

import Box from '../box/box.jsx';
import Dots from './dots.js';
import PeripheralTile from './peripheral-tile.js';

import refreshIcon from './icons/refresh.svg';
import radarIcon from './icons/searching.png';

import styles from './connectionModal.module.css';

const ScanningStep = (props: PropsInterface) => (
  <Box className={styles.body}>
    <Box className={styles.activityArea}>
      {props.scanning ? (
        props.peripheralList.length === 0 ? (
          <div className={styles.activityAreaInfo}>
            <div className={styles.centeredRow}>
              <img
                className={classNames(styles.radarSmall, styles.radarSpin)}
                src={radarIcon}
                alt=''
              />
              <FormattedMessage
                defaultMessage='Looking for devices'
                description='Text shown while scanning for devices'
                id='gui.connection.scanning.lookingforperipherals'
              />
            </div>
          </div>
        ) : (
          <div className={styles.peripheralTilePane}>
            {props.peripheralList.map((peripheral: any) => (
              <PeripheralTile
                connectionSmallIconURL={props.connectionSmallIconURL}
                key={peripheral.peripheralId}
                name={peripheral.name}
                peripheralId={peripheral.peripheralId}
                rssi={peripheral.rssi}
                onConnecting={props.onConnecting}
              />
            ))}
          </div>
        )
      ) : (
        <Box className={styles.instructions}>
          <FormattedMessage
            defaultMessage='No devices found'
            description='Text shown when no devices could be found'
            id='gui.connection.scanning.noPeripheralsFound'
          />
        </Box>
      )}
    </Box>
    <Box className={styles.bottomArea}>
      <Box className={classNames(styles.bottomAreaItem, styles.instructions)}>
        <FormattedMessage
          defaultMessage='Select your device in the list above.'
          description='Prompt for choosing a device to connect to'
          id='gui.connection.scanning.instructions'
        />
      </Box>
      <Dots className={styles.bottomAreaItem} counter={0} total={3} />
      <button
        className={classNames(styles.bottomAreaItem, styles.connectionButton)}
        onClick={props.onRefresh}
      >
        <FormattedMessage
          defaultMessage='Refresh'
          description='Button in prompt for starting a search'
          id='gui.connection.search'
        />
        <img className={styles.buttonIconRight} src={refreshIcon} alt='' />
      </button>
    </Box>
  </Box>
);

interface PropsInterface {
  connectionSmallIconURL: string;
  onConnecting: any;
  onRefresh: any;
  peripheralList: any;
  scanning: boolean;
}

// TODO
// ScanningStep.propTypes = {
//   connectionSmallIconURL: PropTypes.string,
//   onConnecting: PropTypes.func,
//   onRefresh: PropTypes.func,
//   peripheralList: PropTypes.arrayOf(
//     PropTypes.shape({
//       name: PropTypes.string,
//       rssi: PropTypes.number,
//       peripheralId: PropTypes.string,
//     })
//   ),
//   scanning: PropTypes.bool.isRequired,
// };

ScanningStep.defaultProps = {
  peripheralList: [],
  scanning: true,
};

export default ScanningStep;
