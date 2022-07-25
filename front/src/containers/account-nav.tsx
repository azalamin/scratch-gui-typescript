/*
NOTE: this file only temporarily resides in scratch-gui.
Nearly identical code appears in scratch-www, and the two should
eventually be consolidated.
*/

import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';

import AccountNavComponent from '../components/menu-bar/account-nav';

const AccountNav: any = function (props: PropsInterface) {
  const { ...componentProps } = props;
  return <AccountNavComponent {...componentProps} />;
};

interface PropsInterface {
  className?: any;
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

const mapStateToProps = (state: any) => ({
  classroomId:
    state.session && state.session.session && state.session.session.user
      ? state.session.session.user.classroomId
      : '',
  isEducator:
    state.session &&
    state.session.permissions &&
    state.session.permissions.educator,
  isStudent:
    state.session &&
    state.session.permissions &&
    state.session.permissions.student,
  profileUrl:
    state.session && state.session.session && state.session.session.user
      ? `/users/${state.session.session.user.username}`
      : '',
  thumbnailUrl:
    state.session && state.session.session && state.session.session.user
      ? state.session.session.user.thumbnailUrl
      : null,
  username:
    state.session && state.session.session && state.session.session.user
      ? state.session.session.user.username
      : '',
});

const mapDispatchToProps = () => ({});

export default injectIntl<PropsInterface>(
  connect(mapStateToProps, mapDispatchToProps)(AccountNav)
);
