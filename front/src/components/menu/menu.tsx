import classNames from 'classnames';
import React, { FC } from 'react';

import styles from './menu.module.css';

const MenuComponent: FC<PropsInterface> = ({
  className = '',
  children,
  componentRef,
  place = 'right',
}) => (
  <ul
    className={classNames(styles.menu, className, {
      [styles.left]: place === 'left',
      [styles.right]: place === 'right',
    })}
    ref={componentRef}
  >
    {children}
  </ul>
);

interface PropsInterface {
  children?: JSX.Element;
  className?: any;
  componentRef?: any;
  place?: any;
}

// TODO
// MenuComponent.propTypes = {
//     children: PropTypes.node,
//     className: PropTypes.string,
//     componentRef: PropTypes.func,
//     place: PropTypes.oneOf(['left', 'right'])
// };

const MenuItem: any = ({
  children,
  className,
  onClick,
}: PropsInterfaceMenuItem) => (
  <li
    className={classNames(styles.menuItem, styles.hoverable, className)}
    onClick={onClick}
  >
    {children}
  </li>
);

interface PropsInterfaceMenuItem {
  children?: JSX.Element;
  className?: any;
  onClick?: any;
  isRtl: any;
}

// TODO
// MenuItem.propTypes = {
//     children: PropTypes.node,
//     className: PropTypes.string,
//     onClick: PropTypes.func
// };

const addDividerClassToFirstChild = (child: any, id: any) =>
  child &&
  React.cloneElement(child, {
    className: classNames(child.className, { [styles.menuSection]: id === 0 }),
    key: id,
  });

const MenuSection: any = ({ children }: MenuSectionInterface) => (
  <React.Fragment>
    {React.Children.map(children, addDividerClassToFirstChild)}
  </React.Fragment>
);

interface MenuSectionInterface {
  children?: JSX.Element;
}

// TODO
// MenuSection.propTypes = {
//     children: PropTypes.node
// };

export { MenuComponent as default, MenuItem, MenuSection };
