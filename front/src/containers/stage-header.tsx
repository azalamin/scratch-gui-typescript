import { useCallback, useEffect } from 'react';
import { STAGE_SIZE_MODES } from '../lib/layout-constants';
import { setFullScreen } from '../reducers/mode';
import { setStageSize } from '../reducers/stage-size';

import { connect } from 'react-redux';

import StageHeaderComponent from '../components/stage-header/stage-header';

const StageHeader = (prop: PropsInterface) => {
  const handleKeyPress = useCallback(
    event => {
      if (event.key === 'Escape' && prop.isFullScreen) {
        prop.onSetStageUnFull(false);
      }
    },
    [prop]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  const { ...props } = prop;

  return <StageHeaderComponent {...props} onKeyPress={handleKeyPress} />;
};

interface PropsInterface {
  isFullScreen: boolean;
  isPlayerOnly: boolean;
  onSetStageUnFull: any;
  showBranding: boolean;
  stageSizeMode: any;
  vm: any;
  stageSize: any;
}

// TODO
// StageHeader.propTypes = {
//     isFullScreen: PropTypes.bool,
//     isPlayerOnly: PropTypes.bool,
//     onSetStageUnFull: PropTypes.func.isRequired,
//     showBranding: PropTypes.bool,
//     stageSizeMode: PropTypes.oneOf(Object.keys(STAGE_SIZE_MODES)),
//     vm: PropTypes.instanceOf(VM).isRequired
// };

const mapStateToProps = (state: any) => ({
  stageSizeMode: state.scratchGui.stageSize.stageSize,
  showBranding: state.scratchGui.mode.showBranding,
  isFullScreen: state.scratchGui.mode.isFullScreen,
  isPlayerOnly: state.scratchGui.mode.isPlayerOnly,
});

const mapDispatchToProps = (dispatch: any) => ({
  onSetStageLarge: () => dispatch(setStageSize(STAGE_SIZE_MODES.large)),
  onSetStageSmall: () => dispatch(setStageSize(STAGE_SIZE_MODES.small)),
  onSetStageFull: () => dispatch(setFullScreen(true)),
  onSetStageUnFull: () => dispatch(setFullScreen(false)),
});

export default connect(mapStateToProps, mapDispatchToProps)(StageHeader);
