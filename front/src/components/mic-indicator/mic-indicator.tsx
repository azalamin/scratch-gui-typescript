import { stageSizeToTransform } from '../../lib/screen-utils';
import micIcon from './mic-indicator.svg';
import styles from './micIndicator.module.css';

const MicIndicatorComponent = (props: PropsInterface) => (
  <div
    className={props.className}
    style={stageSizeToTransform(props.stageSize)}
  >
    <img className={styles.micImg} src={micIcon} alt='' />
  </div>
);

interface PropsInterface {
  className: string;
  stageSize: any;
}

// TODO
// MicIndicatorComponent.propTypes = {
//     className: PropTypes.string,
//     stageSize: PropTypes.shape({
//         width: PropTypes.number,
//         height: PropTypes.number,
//         widthDefault: PropTypes.number,
//         heightDefault: PropTypes.number
//     }).isRequired
// };

export default MicIndicatorComponent;
