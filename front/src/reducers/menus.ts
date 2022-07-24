const OPEN_MENU: any = 'scratch-gui/menus/OPEN_MENU';
const CLOSE_MENU: any = 'scratch-gui/menus/CLOSE_MENU';

const MENU_ABOUT: any = 'aboutMenu';
const MENU_ACCOUNT: any = 'accountMenu';
const MENU_FILE: any = 'fileMenu';
const MENU_EDIT: any = 'editMenu';
const MENU_LANGUAGE: any = 'languageMenu';
const MENU_LOGIN: any = 'loginMenu';

const initialState: any = {
  [MENU_ABOUT]: false,
  [MENU_ACCOUNT]: false,
  [MENU_FILE]: false,
  [MENU_EDIT]: false,
  [MENU_LANGUAGE]: false,
  [MENU_LOGIN]: false,
};

const reducer = function (state: any, action: any) {
  if (typeof state === 'undefined') state = initialState;
  switch (action.type) {
    case OPEN_MENU:
      return Object.assign({}, state, {
        [action.menu]: true,
      });
    case CLOSE_MENU:
      return Object.assign({}, state, {
        [action.menu]: false,
      });
    default:
      return state;
  }
};
const openMenu = (menu: any) => ({
  type: OPEN_MENU,
  menu: menu,
});
const closeMenu = (menu: any) => ({
  type: CLOSE_MENU,
  menu: menu,
});
const openAboutMenu = () => openMenu(MENU_ABOUT);
const closeAboutMenu = () => closeMenu(MENU_ABOUT);
const aboutMenuOpen = (state: any) => state.scratchGui.menus[MENU_ABOUT];
const openAccountMenu = () => openMenu(MENU_ACCOUNT);
const closeAccountMenu = () => closeMenu(MENU_ACCOUNT);
const accountMenuOpen = (state: any) => state.scratchGui.menus[MENU_ACCOUNT];
const openFileMenu = () => openMenu(MENU_FILE);
const closeFileMenu = () => closeMenu(MENU_FILE);
const fileMenuOpen = (state: any) => state.scratchGui.menus[MENU_FILE];
const openEditMenu = () => openMenu(MENU_EDIT);
const closeEditMenu = () => closeMenu(MENU_EDIT);
const editMenuOpen = (state: any) => state.scratchGui.menus[MENU_EDIT];
const openLanguageMenu = () => openMenu(MENU_LANGUAGE);
const closeLanguageMenu = () => closeMenu(MENU_LANGUAGE);
const languageMenuOpen = (state: any) => state.scratchGui.menus[MENU_LANGUAGE];
const openLoginMenu = () => openMenu(MENU_LOGIN);
const closeLoginMenu = () => closeMenu(MENU_LOGIN);
const loginMenuOpen = (state: any) => state.scratchGui.menus[MENU_LOGIN];

export {
  reducer as default,
  initialState as menuInitialState,
  openAboutMenu,
  closeAboutMenu,
  aboutMenuOpen,
  openAccountMenu,
  closeAccountMenu,
  accountMenuOpen,
  openFileMenu,
  closeFileMenu,
  fileMenuOpen,
  openEditMenu,
  closeEditMenu,
  editMenuOpen,
  openLanguageMenu,
  closeLanguageMenu,
  languageMenuOpen,
  openLoginMenu,
  closeLoginMenu,
  loginMenuOpen,
};
