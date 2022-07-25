import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import Box from '../box/box';

import styles from './connectionModal.module.css';

const PeripheralTile = (props: PropsInterface) => {
  const handleConnecting = () => {
    props.onConnecting(props.peripheralId);
  };

  return (
    <Box className={styles.peripheralTile}>
      <Box className={styles.peripheralTileName}>
        <img
          className={styles.peripheralTileImage}
          src={props.connectionSmallIconURL}
          alt=''
        />
        <Box className={styles.peripheralTileNameWrapper}>
          <Box className={styles.peripheralTileNameLabel}>
            <FormattedMessage
              defaultMessage='Device name'
              description='Label for field showing the device name'
              id='gui.connection.peripheral-name-label'
            />
          </Box>
          <Box className={styles.peripheralTileNameText}>{props.name}</Box>
        </Box>
      </Box>
      <Box className={styles.peripheralTileWidgets}>
        <Box className={styles.signalStrengthMeter}>
          <div
            className={classNames(styles.signalBar, {
              [styles.greenBar]: props.rssi > -80,
            })}
          />
          <div
            className={classNames(styles.signalBar, {
              [styles.greenBar]: props.rssi > -60,
            })}
          />
          <div
            className={classNames(styles.signalBar, {
              [styles.greenBar]: props.rssi > -40,
            })}
          />
          <div
            className={classNames(styles.signalBar, {
              [styles.greenBar]: props.rssi > -20,
            })}
          />
        </Box>
        <button onClick={handleConnecting}>
          <FormattedMessage
            defaultMessage='Connect'
            description='Button to start connecting to a specific device'
            id='gui.connection.connect'
          />
        </button>
      </Box>
    </Box>
  );
};

interface PropsInterface {
  connectionSmallIconURL: string;
  name: string;
  onConnecting: any;
  peripheralId: string;
  rssi: number;
}

// TODO
// PeripheralTile.propTypes = {
//     connectionSmallIconURL: PropTypes.string,
//     name: PropTypes.string,
//     onConnecting: PropTypes.func,
//     peripheralId: PropTypes.string,
//     rssi: PropTypes.number
// };

export default PeripheralTile;
