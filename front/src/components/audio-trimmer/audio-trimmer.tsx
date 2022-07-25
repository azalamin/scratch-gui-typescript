import classNames from 'classnames';
import Box from '../box/box';
import styles from './audioTrimmer.module.css';
import Playhead from './playhead';
import SelectionHandle from './selection-handle';

const AudioTrimmer = (props: PropsInterface) => (
  <div
    className={classNames(styles.absolute, styles.trimmer)}
    ref={props.containerRef}
  >
    {props.trimStart === null ? null : (
      <Box
        className={classNames(
          styles.absolute,
          styles.trimBackground,
          styles.startTrimBackground
        )}
        style={{
          width: `${100 * props.trimStart}%`,
        }}
        onTouchStart={props.onTrimStartMouseDown}
        onMouseDown={props.onTrimStartMouseDown}
      >
        <Box
          className={classNames(styles.absolute, styles.trimBackgroundMask)}
        />
        <SelectionHandle handleStyle={styles.leftHandle} />
      </Box>
    )}
    {props.playhead ? <Playhead playbackPosition={props.playhead} /> : null}
    {props.trimEnd === null ? null : (
      <Box
        className={classNames(
          styles.absolute,
          styles.trimBackground,
          styles.endTrimBackground
        )}
        style={{
          left: `${100 * props.trimEnd}%`,
          width: `${100 - 100 * props.trimEnd}%`,
        }}
        onTouchStart={props.onTrimEndMouseDown}
        onMouseDown={props.onTrimEndMouseDown}
      >
        <Box
          className={classNames(styles.absolute, styles.trimBackgroundMask)}
        />
        <SelectionHandle handleStyle={styles.rightHandle} />
      </Box>
    )}
  </div>
);

interface PropsInterface {
  containerRef: any;
  onTrimEndMouseDown: any;
  onTrimStartMouseDown: any;
  playhead: number;
  trimEnd: number;
  trimStart: number;
  onTouchStart?: any;
}

// TODO
// AudioTrimmer.propTypes = {
//     containerRef: PropTypes.func,
//     onTrimEndMouseDown: PropTypes.func.isRequired,
//     onTrimStartMouseDown: PropTypes.func.isRequired,
//     playhead: PropTypes.number,
//     trimEnd: PropTypes.number,
//     trimStart: PropTypes.number
// };

export default AudioTrimmer;
