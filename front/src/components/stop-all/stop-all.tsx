import classNames from 'classnames';

import stopAllIcon from './icon--stop-all.svg';
import styles from './stopAll.module.css';

const StopAllComponent = function (props: PropsInterface) {
  const { active, className, onClick, title, ...componentProps } = props;
  return (
    <img
      className={classNames(className, styles.stopAll, {
        [styles.isActive]: active,
      })}
      draggable={false}
      src={stopAllIcon}
      title={title}
      onClick={onClick}
      {...componentProps}
      alt=''
    />
  );
};

interface PropsInterface {
  active: boolean;
  className: string;
  onClick: any;
  title: string;
}

// TODO
// StopAllComponent.propTypes = {
//     active: PropTypes.bool,
//     className: PropTypes.string,
//     onClick: PropTypes.func.isRequired,
//     title: PropTypes.string
// };

StopAllComponent.defaultProps = {
  active: false,
  title: 'Stop',
};

export default StopAllComponent;
