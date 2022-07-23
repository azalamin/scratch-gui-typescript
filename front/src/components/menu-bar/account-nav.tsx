/*
NOTE: this file only temporarily resides in scratch-gui.
Nearly identical code appears in scratch-www, and the two should
eventually be consolidated.
*/

import classNames from 'classnames';
import React, { FC } from 'react';
import { FormattedMessage } from 'react-intl';

import MenuItemContainer from '../../containers/menu-item.js';
import { MenuSection } from '../menu/menu.js';
import dropdownCaret from './dropdown-caret.svg';
import MenuBarMenu from './menu-bar-menu.jsx';
import UserAvatar from './user-avatar.jsx';

import styles from './accountNav.module.css';

const AccountNavComponent: any = ({
  className,
  classroomId,
  isEducator,
  isOpen,
  isRtl,
  isStudent,
  menuBarMenuClassName,
  onClick,
  onClose,
  onLogOut,
  profileUrl,
  thumbnailUrl,
  username,
}: PropsInterface) => (
  <React.Fragment>
    <div className={classNames(styles.userInfo, className)} onMouseUp={onClick}>
      {thumbnailUrl ? (
        <UserAvatar className={styles.avatar} imageUrl={thumbnailUrl} />
      ) : null}
      <span className={styles.profileName}>{username}</span>
      <div className={styles.dropdownCaretPosition}>
        <img className={styles.dropdownCaretIcon} src={dropdownCaret} alt='' />
      </div>
    </div>
    <MenuBarMenu
      className={menuBarMenuClassName}
      open={isOpen}
      // note: the Rtl styles are switched here, because this menu is justified
      // opposite all the others
      place={isRtl ? 'right' : 'left'}
      onRequestClose={onClose}
    >
      <MenuItemContainer href={profileUrl}>
        <FormattedMessage
          defaultMessage='Profile'
          description='Text to link to my user profile, in the account navigation menu'
          id='gui.accountMenu.profile'
        />
      </MenuItemContainer>
      <MenuItemContainer href='/mystuff/'>
        <FormattedMessage
          defaultMessage='My Stuff'
          description='Text to link to list of my projects, in the account navigation menu'
          id='gui.accountMenu.myStuff'
        />
      </MenuItemContainer>
      {isEducator ? (
        <MenuItemContainer href='/educators/classes/'>
          <FormattedMessage
            defaultMessage='My Classes'
            description='Text to link to my classes (if I am a teacher), in the account navigation menu'
            id='gui.accountMenu.myClasses'
          />
        </MenuItemContainer>
      ) : null}
      {isStudent ? (
        <MenuItemContainer href={`/classes/${classroomId}/`}>
          <FormattedMessage
            defaultMessage='My Class'
            description='Text to link to my class (if I am a student), in the account navigation menu'
            id='gui.accountMenu.myClass'
          />
        </MenuItemContainer>
      ) : null}
      <MenuItemContainer href='/accounts/settings/'>
        <FormattedMessage
          defaultMessage='Account settings'
          description='Text to link to my account settings, in the account navigation menu'
          id='gui.accountMenu.accountSettings'
        />
      </MenuItemContainer>
      <MenuSection>
        <MenuItemContainer onClick={onLogOut}>
          <FormattedMessage
            defaultMessage='Sign out'
            description='Text to link to sign out, in the account navigation menu'
            id='gui.accountMenu.signOut'
          />
        </MenuItemContainer>
      </MenuSection>
    </MenuBarMenu>
  </React.Fragment>
);

interface PropsInterface {
  className: string;
  classroomId: string;
  isEducator: boolean;
  isOpen: boolean;
  isRtl: boolean;
  isStudent: boolean;
  menuBarMenuClassName: string;
  onClick: any;
  onClose: any;
  onLogOut: any;
  profileUrl: string;
  thumbnailUrl: string;
  username: string;
}

// TODO
// AccountNavComponent.propTypes = {
//     className: PropTypes.string,
//     classroomId: PropTypes.string,
//     isEducator: PropTypes.bool,
//     isOpen: PropTypes.bool,
//     isRtl: PropTypes.bool,
//     isStudent: PropTypes.bool,
//     menuBarMenuClassName: PropTypes.string,
//     onClick: PropTypes.func,
//     onClose: PropTypes.func,
//     onLogOut: PropTypes.func,
//     profileUrl: PropTypes.string,
//     thumbnailUrl: PropTypes.string,
//     username: PropTypes.string
// };

export default AccountNavComponent;
