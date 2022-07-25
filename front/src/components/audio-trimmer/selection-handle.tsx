import classNames from 'classnames';
import Box from '../box/box';
import styles from './audioTrimmer.module.css';
import handleIcon from './icon--handle.svg';

const SelectionHandle = (props: PropsInterface) => (
  <Box
    className={classNames(styles.trimLine, props.handleStyle)}
    onMouseDown={props.onMouseDown}
    onTouchStart={props.onMouseDown}
  >
    <Box className={classNames(styles.trimHandle, styles.topTrimHandle)}>
      <img src={handleIcon} alt='' />
    </Box>
    <Box className={classNames(styles.trimHandle, styles.bottomTrimHandle)}>
      <img src={handleIcon} alt='' />
    </Box>
  </Box>
);

interface PropsInterface {
  handleStyle: string;
  onMouseDown?: any;
}

// TODO
// SelectionHandle.propTypes = {
//     handleStyle: PropTypes.string,
//     onMouseDown: PropTypes.func
// };

export default SelectionHandle;
