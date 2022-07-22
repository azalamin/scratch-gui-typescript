import classNames from 'classnames';
import { ContextMenu, MenuItem } from 'react-contextmenu';

import styles from './contextMenu.module.css';

const StyledContextMenu = (props: any) => (
  <ContextMenu {...props} className={styles.contextMenu} />
);

const StyledMenuItem = (props: any) => (
  <MenuItem {...props} attributes={{ className: styles.menuItem }} />
);

const BorderedMenuItem = (props: any) => (
  <MenuItem
    {...props}
    attributes={{
      className: classNames(styles.menuItem, styles.menuItemBordered),
    }}
  />
);

const DangerousMenuItem = (props: any) => (
  <MenuItem
    {...props}
    attributes={{
      className: classNames(
        styles.menuItem,
        styles.menuItemBordered,
        styles.menuItemDanger
      ),
    }}
  />
);

export {
  BorderedMenuItem,
  DangerousMenuItem,
  StyledContextMenu as ContextMenu,
  StyledMenuItem as MenuItem,
};
