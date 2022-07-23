import { FormattedMessage } from 'react-intl';
import Box from '../box/box.jsx';

import styles from './crashMessage.module.css';
import reloadIcon from './reload.svg';

const CrashMessage = (props: PropsInterface) => (
  <div className={styles.crashWrapper}>
    <Box className={styles.body}>
      <img className={styles.reloadIcon} src={reloadIcon} alt='' />
      <h2>
        <FormattedMessage
          defaultMessage='Oops! Something went wrong.'
          description='Crash Message title'
          id='gui.crashMessage.label'
        />
      </h2>
      <p>
        <FormattedMessage
          defaultMessage={
            'We are so sorry, but it looks like Scratch has crashed. This bug has been' +
            ' automatically reported to the Scratch Team. Please refresh your page to try' +
            ' again.'
          }
          description='Message to inform the user that page has crashed.'
          id='gui.crashMessage.description'
        />
      </p>
      {props.eventId && (
        <p>
          <FormattedMessage
            defaultMessage='Your error was logged with id {errorId}'
            description='Message to inform the user that page has crashed.'
            id='gui.crashMessage.errorNumber'
            values={{
              errorId: props.eventId,
            }}
          />
        </p>
      )}
      <button className={styles.reloadButton} onClick={props.onReload}>
        <FormattedMessage
          defaultMessage='Reload'
          description='Button to reload the page when page crashes'
          id='gui.crashMessage.reload'
        />
      </button>
    </Box>
  </div>
);

interface PropsInterface {
  eventId: string;
  onReload: any;
}

// TODO
// CrashMessage.propTypes = {
//     eventId: PropTypes.string,
//     onReload: PropTypes.func.isRequired
// };

export default CrashMessage;