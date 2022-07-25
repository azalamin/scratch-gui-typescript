import { FC } from 'react';

import Alert from '../../containers/alert';
import Box from '../box/box';

import styles from './alerts.module.css';

const AlertsComponent: FC<PropsInterface> = ({
  alertsList,
  className,
  onCloseAlert,
}) => (
  <Box bounds='parent' className={className}>
    <Box className={styles.alertsInnerContainer}>
      {alertsList.map((a: any, index: any) => (
        <Alert
          closeButton={a.closeButton}
          content={a.content}
          extensionId={a.extensionId}
          extensionName={a.extensionName}
          iconSpinner={a.iconSpinner}
          iconURL={a.iconURL}
          index={index}
          key={index}
          level={a.level}
          message={a.message}
          showDownload={a.showDownload}
          showReconnect={a.showReconnect}
          showSaveNow={a.showSaveNow}
          onCloseAlert={onCloseAlert}
        />
      ))}
    </Box>
  </Box>
);

interface PropsInterface {
  alertsList: any;
  className: string;
  onCloseAlert: any;
}

// TODO
// AlertsComponent.propTypes = {
//   alertsList: PropTypes.arrayOf(PropTypes.object),
//   className: PropTypes.string,
//   onCloseAlert: PropTypes.func,
// };

export default AlertsComponent;
