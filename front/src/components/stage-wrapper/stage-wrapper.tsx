import classNames from 'classnames';

import StageHeader from '../../containers/stage-header.js';
import Stage from '../../containers/stage.js';
import Box from '../box/box.jsx';
import Loader from '../loader/loader.jsx';

import styles from './stage-wrapper.module.css';

const StageWrapperComponent = function (props: PropsInterface) {
  const { isFullScreen, isRtl, isRendererSupported, loading, stageSize, vm } =
    props;

  return (
    <Box
      className={classNames(styles.stageWrapper, {
        [styles.fullScreen]: isFullScreen,
      })}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <Box className={styles.stageMenuWrapper}>
        <StageHeader stageSize={stageSize} vm={vm} />
      </Box>
      <Box className={styles.stageCanvasWrapper}>
        {isRendererSupported ? <Stage stageSize={stageSize} vm={vm} /> : null}
      </Box>
      {loading ? <Loader isFullScreen={isFullScreen} /> : null}
    </Box>
  );
};

interface PropsInterface {
  isFullScreen?: boolean;
  isRendererSupported: boolean;
  isRtl?: boolean;
  loading?: boolean;
  stageSize: any;
  vm: any;
}

// TODO
// StageWrapperComponent.propTypes = {
//     isFullScreen: PropTypes.bool,
//     isRendererSupported: PropTypes.bool.isRequired,
//     isRtl: PropTypes.bool.isRequired,
//     loading: PropTypes.bool,
//     stageSize: PropTypes.oneOf(Object.keys(STAGE_DISPLAY_SIZES)).isRequired,
//     vm: PropTypes.instanceOf(VM).isRequired
// };

export default StageWrapperComponent;
