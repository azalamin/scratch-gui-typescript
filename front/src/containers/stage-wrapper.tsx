import StageWrapperComponent from '../components/stage-wrapper/stage-wrapper';

const StageWrapper = (props: any) => <StageWrapperComponent {...props} />;

// TODo
// interface PropsInterface {
//   isRendererSupported: boolean;
//   stageSize: any;
//   vm: any;
// }

// TODO
// StageWrapper.propTypes = {
//     isRendererSupported: PropTypes.bool.isRequired,
//     stageSize: PropTypes.oneOf(Object.keys(STAGE_DISPLAY_SIZES)).isRequired,
//     vm: PropTypes.instanceOf(VM).isRequired
// };

export default StageWrapper;
