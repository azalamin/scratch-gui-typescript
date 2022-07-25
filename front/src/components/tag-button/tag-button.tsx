import classNames from 'classnames';
import { FC } from 'react';
import { FormattedMessage } from 'react-intl';

import Button from '../button/button';

import styles from './tagButton.module.css';

const TagButtonComponent: FC<PropsInterface> = ({
  active,
  iconClassName,
  className,
  tag, // eslint-disable-line no-unused-vars
  intlLabel,
  ...props
}) => (
  <Button
    className={classNames(styles.tagButton, className, {
      [styles.active]: active,
    })}
    iconClassName={classNames(styles.tagButtonIcon, iconClassName)}
    {...props}
  >
    <FormattedMessage {...intlLabel} />
  </Button>
);

interface PropsInterface {
  active?: boolean;
  intlLabe?: any;
  tag?: string;
  iconClassName?: any;
  className?: any;
  intlLabel?: any;
  onClick?: any;
}

// TODO
// TagButtonComponent.propTypes = {
//     ...Button.propTypes,
//     active: PropTypes.bool,
//     intlLabel: PropTypes.shape({
//         defaultMessage: PropTypes.string,
//         description: PropTypes.string,
//         id: PropTypes.string
//     }).isRequired,
//     tag: PropTypes.string.isRequired
// };

TagButtonComponent.defaultProps = {
  active: false,
};

export default TagButtonComponent;
