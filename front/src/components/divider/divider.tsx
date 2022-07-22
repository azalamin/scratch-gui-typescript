import classNames from 'classnames';
import { FC } from 'react';

import styles from './divider.module.css';

const Divider: FC<PropsInterface> = ({ className }) => (
  <div className={classNames(styles.divider, className)} />
);

interface PropsInterface {
  className: string;
}

export default Divider;
