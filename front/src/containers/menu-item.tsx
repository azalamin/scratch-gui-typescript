import { MenuItem as MenuItemComponent } from '../components/menu/menu.jsx';

const MenuItem = (props: PropsInterface) => {
  const navigateToHref = () => {
    if (props.href) window.location.href = props.href;
  };
  const { children, className, onClick } = props;
  const clickAction = onClick ? onClick : navigateToHref;

  return (
    <MenuItemComponent className={className} onClick={clickAction}>
      {children}
    </MenuItemComponent>
  );
};

interface PropsInterface {
  //   children: Element;
  children: JSX.Element;
  className: string;
  // can take an onClick prop, or take an href and build an onClick handler
  href: string;
  onClick: any;
}

export default MenuItem;
