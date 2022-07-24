import { FormattedMessage } from 'react-intl';

import turboIcon from './icon--turbo.svg';

import styles from './turboMode.module.css';

const TurboMode = () => (
  <div className={styles.turboContainer}>
    <img className={styles.turboIcon} src={turboIcon} alt='' />
    <div className={styles.turboLabel}>
      <FormattedMessage
        defaultMessage='Turbo Mode'
        description='Label indicating turbo mode is active'
        id='gui.turboMode.active'
      />
    </div>
  </div>
);

export default TurboMode;
