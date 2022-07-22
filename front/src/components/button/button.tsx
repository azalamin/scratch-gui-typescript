import classNames from 'classnames';
import { FC } from 'react';

import styles from './button.module.css';

const ButtonComponent: FC<PropsInterface> = ({
  className,
  disabled,
  iconClassName,
  iconSrc,
  onClick,
  children,
  ...props
}) => {
  if (disabled) {
    onClick = function () {};
  }

  const icon = iconSrc && (
    <img
      className={classNames(iconClassName, styles.icon)}
      draggable={false}
      src={iconSrc}
      alt=''
    />
  );

  return (
    <span
      className={classNames(styles.outlinedButton, className)}
      role='button'
      onClick={onClick}
      {...props}
    >
      {icon}
      <div className={styles.content}>{children}</div>
    </span>
  );
};

interface PropsInterface {
  children: JSX.Element;
  className: string;
  disabled: boolean;
  iconClassName: string;
  iconSrc: string;
  onClick: any;
}

// TODO
// ButtonComponent.propTypes = {
//     children: PropTypes.node,
//     className: PropTypes.string,
//     disabled: PropTypes.bool,
//     iconClassName: PropTypes.string,
//     iconSrc: PropTypes.string,
//     onClick: PropTypes.func
// };

export default ButtonComponent;
