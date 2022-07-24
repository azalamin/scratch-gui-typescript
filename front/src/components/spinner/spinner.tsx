import classNames from 'classnames';

import styles from './spinner.module.css';

const SpinnerComponent = function (props: PropsInterface) {
  const { className, level, small, large } = props;
  return (
    <div
      className={classNames(className, styles.spinner, styles[level], {
        [styles.small]: small,
        [styles.large]: large,
      })}
    />
  );
};

interface PropsInterface {
  className: string;
  large: boolean;
  level: string;
  small: boolean;
}

// SpinnerComponent.propTypes = {
//     className: PropTypes.string,
//     large: PropTypes.bool,
//     level: PropTypes.string,
//     small: PropTypes.bool
// };

SpinnerComponent.defaultProps = {
  className: '',
  large: false,
  level: 'info',
  small: false,
};
export default SpinnerComponent;
