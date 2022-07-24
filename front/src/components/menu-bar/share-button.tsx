import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import Button from '../button/button.js';

import styles from './shareButton.module.css';

const ShareButton = ({ className, isShared, onClick }: PropsInterface) => (
  <Button
    className={classNames(className, styles.shareButton, {
      [styles.shareButtonIsShared]: isShared,
    })}
    onClick={onClick}
  >
    {isShared ? (
      <FormattedMessage
        defaultMessage='Shared'
        description='Label for shared project'
        id='gui.menuBar.isShared'
      />
    ) : (
      <FormattedMessage
        defaultMessage='Share'
        description='Label for project share button'
        id='gui.menuBar.share'
      />
    )}
  </Button>
);

interface PropsInterface {
  className: string;
  isShared?: boolean;
  onClick: any;
}

// TODO
// ShareButton.propTypes = {
//     className: PropTypes.string,
//     isShared: PropTypes.bool,
//     onClick: PropTypes.func
// };

ShareButton.defaultProps = {
  onClick: () => {},
};

export default ShareButton;
