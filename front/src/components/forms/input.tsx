import classNames from 'classnames';

import styles from './input.module.css';

const Input = (props: PropsInterface) => {
  const { small, ...componentProps } = props;
  return (
    <input
      {...componentProps}
      className={classNames(styles.inputForm, props.className, {
        [styles.inputSmall]: small,
      })}
    />
  );
};

interface PropsInterface {
  className?: string;
  small?: boolean;
  autoFocus?: any;
  value?: any;
  onChange?: any;
  onKeyPress?: any;
}

// TODO
// Input.propTypes = {
//   className: PropTypes.string,
//   small: PropTypes.bool,
// };

Input.defaultProps = {
  small: false,
};

export default Input;
