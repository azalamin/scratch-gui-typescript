import classNames from 'classnames';

import Box from '../box/box';
import styles from './connectionModal.module.css';

const Dots = (props: DotsPropsInterface) => (
  <Box className={classNames(props.className, styles.dotsRow)}>
    <div
      className={classNames(styles.dotsHolder, {
        [styles.dotsHolderError]: props.error,
        [styles.dotsHolderSuccess]: props.success,
      })}
    >
      {Array(props.total)
        .fill(0)
        .map((_, i) => {
          let type = 'inactive';
          if (props.counter === i) type = 'active';
          if (props.success) type = 'success';
          if (props.error) type = 'error';
          return <Dot key={`dot-${i}`} type={type} />;
        })}
    </div>
  </Box>
);

interface DotsPropsInterface {
  className?: string;
  counter?: number;
  error?: boolean;
  success?: boolean;
  total?: number;
}

// TODO
// Dots.propTypes = {
//     className: PropTypes.string,
//     counter: PropTypes.number,
//     error: PropTypes.bool,
//     success: PropTypes.bool,
//     total: PropTypes.number
// };

const Dot = (props: DotPropsInterface) => (
  <div
    className={classNames(styles.dot, {
      [styles.inactiveStepDot]: props.type === 'inactive',
      [styles.activeStepDot]: props.type === 'active',
      [styles.successDot]: props.type === 'success',
      [styles.errorDot]: props.type === 'error',
    })}
  />
);

interface DotPropsInterface {
  type: string;
}

// TODO
// Dot.propTypes = {
//   type: PropTypes.string,
// };

export default Dots;
