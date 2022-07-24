import styles from './monitor.module.css';

const LargeMonitor = ({ categoryColor, value }: PropsInterface) => (
  <div className={styles.largeMonitor}>
    <div className={styles.largeValue} style={{ background: categoryColor }}>
      {value}
    </div>
  </div>
);

interface PropsInterface {
  categoryColor: string;
  value: string | number;
}

// TODO
// LargeMonitor.propTypes = {
//     categoryColor: PropTypes.string,
//     value: PropTypes.oneOfType([
//         PropTypes.string,
//         PropTypes.number
//     ])
// };

export default LargeMonitor;
