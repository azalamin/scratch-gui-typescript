import { useEffect, useRef } from 'react';

import MenuComponent from '../components/menu/menu.jsx';

const Menu = (prop: PropsInterface) => {
  let menu: any = useRef();

  const addListeners = () => {
    document.addEventListener('mouseup', handleClick);
  };
  const removeListeners = () => {
    document.removeEventListener('mouseup', handleClick);
  };
  const handleClick = (e: any) => {
    if (prop.open && !menu.contains(e.target)) {
      prop.onRequestClose();
    }
  };
  const ref = (c: any) => {
    menu = c;
  };

  useEffect(() => {
    if (prop.open) addListeners();

    return () => {
      removeListeners();
    };
  }, [addListeners, prop.open, removeListeners]);

  const { open, children, ...props } = prop;

  if (!open) return null;

  return (
    <MenuComponent componentRef={ref} {...props}>
      {children}
    </MenuComponent>
  );
};

interface PropsInterface {
  children: any;
  // children: PropTypes.node,
  onRequestClose: any;
  open: boolean;
}

export default Menu;
