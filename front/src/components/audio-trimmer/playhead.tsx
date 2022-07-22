import classNames from 'classnames';
import styles from './audioTrimmer.module.css';

const Playhead = (props: PropsInterface) => (
  <div className={styles.playheadContainer}>
    <div
      className={classNames(styles.playhead)}
      style={{
        transform: `translateX(${100 * props.playbackPosition}%)`,
      }}
    />
  </div>
);

interface PropsInterface {
  playbackPosition: number;
}

export default Playhead;
