import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import Button from '../button/button.js';

import styles from './communityButton.module.css';
import communityIcon from './icon--see-community.svg';

const CommunityButton: any = ({ className, onClick }: PropsInterface) => (
  <Button
    className={classNames(className, styles.communityButton)}
    iconClassName={styles.communityButtonIcon}
    iconSrc={communityIcon}
    onClick={onClick}
  >
    <FormattedMessage
      defaultMessage='See Project Page'
      description='Label for see project page button'
      id='gui.menuBar.seeProjectPage'
    />
  </Button>
);

interface PropsInterface {
  className: string;
  onClick: any;
}

// TODO
// CommunityButton.propTypes = {
//     className: PropTypes.string,
//     onClick: PropTypes.func
// };

CommunityButton.defaultProps = {
  onClick: () => {},
};

export default CommunityButton;
