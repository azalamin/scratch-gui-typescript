import Menu from '../../containers/menu.js';

const MenuBarMenu: any = ({
  children,
  className,
  onRequestClose,
  open,
  place = 'right',
}: PropsInterface) => (
  <div className={className}>
    <Menu open={open} place={place} onRequestClose={onRequestClose}>
      {children}
    </Menu>
  </div>
);

interface PropsInterface {
  children: JSX.Element;
  className: string;
  onRequestClose: any;
  open: boolean;
  place?: any;
}

// TODO
// MenuBarMenu.propTypes = {
//     children: PropTypes.node,
//     className: PropTypes.string,
//     onRequestClose: PropTypes.func,
//     open: PropTypes.bool,
//     place: PropTypes.oneOf(['left', 'right'])
// };

export default MenuBarMenu;
