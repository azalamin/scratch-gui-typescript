import styles from './monitor.module.css';

const DefaultMonitor = ({ categoryColor, label, value }: PropsInterface) => (
  <div className={styles.defaultMonitor}>
    <div className={styles.row}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value} style={{ background: categoryColor }}>
        {value}
      </div>
    </div>
  </div>
);

interface PropsInterface {
  categoryColor: string;
  label: string;
  value: string | number;
}

// TODO
// DefaultMonitor.propTypes = {
//     categoryColor: PropTypes.string.isRequired,
//     label: PropTypes.string.isRequired,
//     value: PropTypes.oneOfType([
//         PropTypes.string,
//         PropTypes.number
//     ])
// };

export default DefaultMonitor;
