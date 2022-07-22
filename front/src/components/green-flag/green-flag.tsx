import classNames from 'classnames';

import styles from './greenFlag.module.css';
import greenFlagIcon from './icon--green-flag.svg';

const GreenFlagComponent = function (props: PropsInterface) {
  const { active, className, onClick, title, ...componentProps } = props;
  return (
    <img
      className={classNames(className, styles.greenFlag, {
        [styles.isActive]: active,
      })}
      draggable={false}
      src={greenFlagIcon}
      title={title}
      onClick={onClick}
      alt=''
      {...componentProps}
    />
  );
};

interface PropsInterface {
  active: boolean;
  className: string;
  onClick: any;
  title: string;
}

// TODo
// GreenFlagComponent.propTypes = {
//     active: PropTypes.bool,
//     className: PropTypes.string,
//     onClick: PropTypes.func.isRequired,
//     title: PropTypes.string
// };

GreenFlagComponent.defaultProps = {
  active: false,
  title: 'Go',
};
export default GreenFlagComponent;
