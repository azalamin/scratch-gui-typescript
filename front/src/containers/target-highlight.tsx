import { connect } from 'react-redux';

const TargetHighlight = (props: PropsInterface) => {
  // Transform scratch coordinates into page coordinates
  const getPageCoords = (x: any, y: any) => {
    const { stageWidth, stageHeight, vm } = props;
    // The renderers "nativeSize" is the [width, height] of the stage in scratch-units
    const nativeSize = vm.renderer.getNativeSize();
    return [
      (stageWidth / nativeSize[0]) * x + stageWidth / 2,
      -((stageHeight / nativeSize[1]) * y) + stageHeight / 2,
    ];
  };

  const { className, highlightedTargetId, highlightedTargetTime, vm } = props;

  if (
    !(
      highlightedTargetId &&
      vm &&
      vm.renderer &&
      vm.runtime.getTargetById(highlightedTargetId)
    )
  )
    return null;

  const target = vm.runtime.getTargetById(highlightedTargetId);
  const bounds = vm.renderer.getBounds(target.drawableID);
  const [left, top] = getPageCoords(bounds.left, bounds.top);
  const [right, bottom] = getPageCoords(bounds.right, bounds.bottom);

  const pad = 2; // px

  return (
    <div
      className={className}
      // Ensure new DOM element each update to restart animation
      key={highlightedTargetTime}
      style={{
        position: 'absolute',
        top: `${top - pad}px`,
        left: `${left - pad}px`,
        width: `${right - left + 2 * pad}px`,
        height: `${bottom - top + 2 * pad}px`,
      }}
    />
  );
};

interface PropsInterface {
  className: string;
  highlightedTargetId: string;
  highlightedTargetTime: number;
  stageHeight: number;
  stageWidth: number;
  vm: any;
}

const mapStateToProps = (state: any) => ({
  highlightedTargetTime: state.scratchGui.targets.highlightedTargetTime,
  highlightedTargetId: state.scratchGui.targets.highlightedTargetId,
  vm: state.scratchGui.vm,
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(TargetHighlight);
