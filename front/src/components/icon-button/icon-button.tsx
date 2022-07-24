import classNames from 'classnames';
import { FC } from 'react';
import styles from './iconButton.module.css';

const IconButton: FC<PropsInterface> = ({
  img,
  disabled,
  className,
  title,
  onClick,
}) => (
  <div
    className={classNames(
      styles.container,
      className,
      disabled ? styles.disabled : null
    )}
    role='button'
    onClick={disabled ? null : onClick}
  >
    <img className={styles.icon} draggable={false} src={img} alt='' />
    <div className={styles.title}>{title}</div>
  </div>
);

interface PropsInterface {
  className: string;
  disabled?: boolean;
  img: string;
  onClick: any;
  title: any;
}

// IconButton.propTypes = {
//     className: PropTypes.string,
//     disabled: PropTypes.bool,
//     img: PropTypes.string,
//     onClick: PropTypes.func.isRequired,
//     title: PropTypes.node.isRequired
// };

export default IconButton;
