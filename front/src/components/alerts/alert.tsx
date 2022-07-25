import classNames from 'classnames';
import { FC } from 'react';
import { FormattedMessage } from 'react-intl';

import { AlertLevels } from '../../lib/alerts/index';
import Box from '../box/box';
import CloseButton from '../close-button/close-button';
import Spinner from '../spinner/spinner';

import styles from './alert.module.css';

const closeButtonColors: any = {
  [AlertLevels.SUCCESS]: CloseButton.COLOR_GREEN,
  [AlertLevels.WARN]: CloseButton.COLOR_ORANGE,
};

const AlertComponent: FC<PropsInterface> = ({
  content,
  closeButton,
  extensionName,
  iconSpinner,
  iconURL,
  level,
  showDownload,
  showSaveNow,
  onCloseAlert,
  onDownload,
  onSaveNow,
  onReconnect,
  showReconnect,
}) => (
  <Box className={classNames(styles.alert, styles[level])}>
    {/* TODO: implement Rtl handling */}
    {(iconSpinner || iconURL) && (
      <div className={styles.iconSection}>
        {iconSpinner && (
          <Spinner className={styles.alertSpinner} level={level} />
        )}
        {iconURL && <img className={styles.alertIcon} src={iconURL} alt='' />}
      </div>
    )}
    <div className={styles.alertMessage}>
      {extensionName ? (
        <FormattedMessage
          defaultMessage='Scratch lost connection to {extensionName}.'
          description='Message indicating that an extension peripheral has been disconnected'
          id='gui.alerts.lostPeripheralConnection'
          values={{
            extensionName: `${extensionName}`,
          }}
        />
      ) : (
        content
      )}
    </div>
    <div className={styles.alertButtons}>
      {showSaveNow && (
        <button className={styles.alertConnectionButton} onClick={onSaveNow}>
          <FormattedMessage
            defaultMessage='Try Again'
            description='Button to try saving again'
            id='gui.alerts.tryAgain'
          />
        </button>
      )}
      {showDownload && (
        <button className={styles.alertConnectionButton} onClick={onDownload}>
          <FormattedMessage
            defaultMessage='Download'
            description='Button to download project locally'
            id='gui.alerts.download'
          />
        </button>
      )}
      {showReconnect && (
        <button className={styles.alertConnectionButton} onClick={onReconnect}>
          <FormattedMessage
            defaultMessage='Reconnect'
            description='Button to reconnect the device'
            id='gui.connection.reconnect'
          />
        </button>
      )}
      {closeButton && (
        <Box className={styles.alertCloseButtonContainer}>
          <CloseButton
            className={classNames(styles.alertCloseButton)}
            color={closeButtonColors[level]}
            size={CloseButton.SIZE_LARGE}
            onClick={onCloseAlert}
          />
        </Box>
      )}
    </div>
  </Box>
);

interface PropsInterface {
  closeButton: any;
  content: JSX.Element | string;
  extensionName: any;
  iconSpinner: any;
  iconURL: any;
  level: any;
  onCloseAlert: any;
  onDownload: any;
  onReconnect: any;
  onSaveNow: any;
  showDownload: any;
  showReconnect: any;
  showSaveNow: any;
  message: any;
}

// TODO
// AlertComponent.propTypes = {
//     closeButton: PropTypes.bool,
//     content: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
//     extensionName: PropTypes.string,
//     iconSpinner: PropTypes.bool,
//     iconURL: PropTypes.string,
//     level: PropTypes.string,
//     onCloseAlert: PropTypes.func.isRequired,
//     onDownload: PropTypes.func,
//     onReconnect: PropTypes.func,
//     onSaveNow: PropTypes.func,
//     showDownload: PropTypes.func,
//     showReconnect: PropTypes.bool,
//     showSaveNow: PropTypes.bool
// };

AlertComponent.defaultProps = {
  level: AlertLevels.WARN,
};

export default AlertComponent;
