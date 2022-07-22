import classNames from 'classnames';

import styles from './deleteButton.module.css';
import deleteIcon from './icon--delete.svg';

const DeleteButton = (props: PropsInterface) => (
  <div
    aria-label='Delete'
    className={classNames(styles.deleteButton, props.className)}
    role='button'
    tabIndex={props.tabIndex}
    onClick={props.onClick}
  >
    <div className={styles.deleteButtonVisible}>
      <img className={styles.deleteIcon} src={deleteIcon} alt='' />
    </div>
  </div>
);

interface PropsInterface {
  className: string;
  onClick: any;
  tabIndex: number;
}

// DeleteButton.propTypes = {
//     className: PropTypes.string,
//     onClick: PropTypes.func.isRequired,
//     tabIndex: PropTypes.number
// };

DeleteButton.defaultProps = {
  tabIndex: 0,
};

export default DeleteButton;
