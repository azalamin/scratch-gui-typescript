import classNames from 'classnames';
import { FC } from 'react';

import { AlertLevels } from '../../lib/alerts/index';
import Spinner from '../spinner/spinner';

import styles from './inlineMessage.module.css';

const InlineMessageComponent: FC<PropsInterface> = ({
  content,
  iconSpinner,
  level,
}) => (
  <div className={classNames(styles.inlineMessage, styles[level])}>
    {/* TODO: implement Rtl handling */}
    {iconSpinner && <Spinner small className={styles.spinner} level={'info'} />}
    {content}
  </div>
);

interface PropsInterface {
  content: any;
  iconSpinner: any;
  level: string;
  className: any;
}

// InlineMessageComponent.propTypes = {
//     content: PropTypes.element,
//     iconSpinner: PropTypes.bool,
//     level: PropTypes.string
// };

InlineMessageComponent.defaultProps = {
  level: AlertLevels.INFO,
};

export default InlineMessageComponent;
