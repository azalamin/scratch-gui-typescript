import { useCallback, useEffect, useRef } from 'react';

import MenuComponent from '../components/menu/menu.jsx';

const Menu = (prop: PropsInterface) => {
  let menu: any = useRef();

  const handleClick = useCallback(
    (e: any) => {
      if (prop.open && !menu.contains(e.target)) {
        prop.onRequestClose();
      }
    },
    [prop]
  );
  const ref = (c: any) => {
    menu = c;
  };

  const addListeners = useCallback(() => {
    document.addEventListener('mouseup', handleClick);
  }, [handleClick]);

  const removeListeners = useCallback(() => {
    document.removeEventListener('mouseup', handleClick);
  }, [handleClick]);

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
