import classNames from 'classnames';

import styles from './filter.module.css';
import filterIcon from './icon--filter.svg';
import xIcon from './icon--x.svg';

const FilterComponent = (props: PropsInterface) => {
  const {
    className,
    onChange,
    onClear,
    placeholderText,
    filterQuery,
    inputClassName,
  } = props;
  return (
    <div
      className={classNames(className, styles.filter, {
        [styles.isActive]: filterQuery.length > 0,
      })}
    >
      <img className={styles.filterIcon} src={filterIcon} alt='' />
      <input
        className={classNames(styles.filterInput, inputClassName)}
        placeholder={placeholderText}
        type='text'
        value={filterQuery}
        onChange={onChange}
      />
      <div className={styles.xIconWrapper} onClick={onClear}>
        <img className={styles.xIcon} src={xIcon} alt='' />
      </div>
    </div>
  );
};

interface PropsInterface {
  className: string;
  filterQuery: string;
  inputClassName: string;
  onChange: any;
  onClear: any;
  placeholderText: string;
}

// TODO
// FilterComponent.propTypes = {
//     className: PropTypes.string,
//     filterQuery: PropTypes.string,
//     inputClassName: PropTypes.string,
//     onChange: PropTypes.func,
//     onClear: PropTypes.func,
//     placeholderText: PropTypes.string
// };

FilterComponent.defaultProps = {
  placeholderText: 'Search',
};
export default FilterComponent;
