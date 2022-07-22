import defaultsDeep from 'lodash.defaultsdeep';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import ScratchBlocks from 'scratch-blocks';
import { boolean } from 'yup';
import CustomProceduresComponent from '../components/custom-procedures/custom-procedures.jsx';

const CustomProcedures = (props: PropsInterface) => {
  const [states, setStates] = useState<any>({
    rtlOffset: 0,
    warp: false,
  });
  let workspace: any;
  let blocks: any = useRef();
  let mutationRoot: any;

  useEffect(() => {
    return () => {
      if (workspace) {
        workspace.dispose();
      }
    };
  }, [workspace]);

  const setBlocks = (blocksRef: any) => {
    if (!blocksRef) return;
    blocks = blocksRef;
    const workspaceConfig = defaultsDeep(
      {},
      CustomProcedures.defaultOptions,
      props.options,
      { rtl: props.isRtl }
    );

    // @todo This is a hack to make there be no toolbox.
    const oldDefaultToolbox = ScratchBlocks.Blocks.defaultToolbox;
    ScratchBlocks.Blocks.defaultToolbox = null;
    workspace = ScratchBlocks.inject(blocks, workspaceConfig);
    ScratchBlocks.Blocks.defaultToolbox = oldDefaultToolbox;

    // Create the procedure declaration block for editing the mutation.
    mutationRoot = workspace.newBlock('procedures_declaration');
    // Make the declaration immovable, undeletable and have no context menu
    mutationRoot.setMovable(false);
    mutationRoot.setDeletable(false);
    mutationRoot.contextMenu = false;

    workspace.addChangeListener(() => {
      mutationRoot.onChangeFn();
      // Keep the block centered on the workspace
      const metrics = workspace.getMetrics();
      const { x, y } = mutationRoot.getRelativeToSurfaceXY();
      const dy = metrics.viewHeight / 2 - mutationRoot.height / 2 - y;
      let dx;
      if (props.isRtl) {
        // // TODO: https://github.com/LLK/scratch-gui/issues/2838
        // This is temporary until we can figure out what's going on width
        // block positioning on the workspace for RTL.
        // Workspace is always origin top-left, with x increasing to the right
        // Calculate initial starting offset and save it, every other move
        // has to take the original offset into account.
        // Calculate a new left postion based on new width
        // Convert current x position into LTR (mirror) x position (uses original offset)
        // Use the difference between ltrX and mirrorX as the amount to move
        const ltrX = metrics.viewWidth / 2 - mutationRoot.width / 2 + 25;
        const mirrorX = x - (x - states.rtlOffset) * 2;
        if (mirrorX === ltrX) {
          return;
        }
        dx = mirrorX - ltrX;
        const midPoint = metrics.viewWidth / 2;
        if (x === 0) {
          // if it's the first time positioning, it should always move right
          if (mutationRoot.width < midPoint) {
            dx = ltrX;
          } else if (mutationRoot.width < metrics.viewWidth) {
            dx = midPoint - (metrics.viewWidth - mutationRoot.width) / 2;
          } else {
            dx = midPoint + (mutationRoot.width - metrics.viewWidth);
          }
          mutationRoot.moveBy(dx, dy);
          setStates({
            ...states,
            rtlOffset: mutationRoot.getRelativeToSurfaceXY().x,
          });
          return;
        }
        if (mutationRoot.width > metrics.viewWidth) {
          dx = dx + mutationRoot.width - metrics.viewWidth;
        }
      } else {
        dx = metrics.viewWidth / 2 - mutationRoot.width / 2 - x;
        // If the procedure declaration is wider than the view width,
        // keep the right-hand side of the procedure in view.
        if (mutationRoot.width > metrics.viewWidth) {
          dx = metrics.viewWidth - mutationRoot.width - x;
        }
      }
      mutationRoot.moveBy(dx, dy);
    });
    mutationRoot.domToMutation(props.mutator);
    mutationRoot.initSvg();
    mutationRoot.render();
    setStates({ ...states, warp: mutationRoot.getWarp() });
    // Allow the initial events to run to position this block, then focus.
    setTimeout(() => {
      mutationRoot.focusLastEditor_();
    });
  };
  const handleCancel = () => {
    props.onRequestClose();
  };
  const handleOk = () => {
    const newMutation = mutationRoot ? mutationRoot.mutationToDom(true) : null;
    props.onRequestClose(newMutation);
  };
  const handleAddLabel = () => {
    if (mutationRoot) {
      mutationRoot.addLabelExternal();
    }
  };
  const handleAddBoolean = () => {
    if (mutationRoot) {
      mutationRoot.addBooleanExternal();
    }
  };
  const handleAddTextNumber = () => {
    if (mutationRoot) {
      mutationRoot.addStringNumberExternal();
    }
  };
  const handleToggleWarp = () => {
    if (mutationRoot) {
      const newWarp = !mutationRoot.getWarp();
      mutationRoot.setWarp(newWarp);
      setStates({ ...states, warp: newWarp });
    }
  };

  return (
    <CustomProceduresComponent
      componentRef={setBlocks}
      warp={states.warp}
      onAddBoolean={handleAddBoolean}
      onAddLabel={handleAddLabel}
      onAddTextNumber={handleAddTextNumber}
      onCancel={handleCancel}
      onOk={handleOk}
      onToggleWarp={handleToggleWarp}
    />
  );
};

interface PropsInterface {
  isRtl: boolean;
  mutator: any;
  onRequestClose: any;
  options: any;
}

// TODO
// CustomProcedures.propTypes = {
//   isRtl: PropTypes.bool,
//   mutator: PropTypes.instanceOf(Element),
//   onRequestClose: PropTypes.func.isRequired,
//   options: PropTypes.shape({
//     media: PropTypes.string,
//     zoom: PropTypes.shape({
//       controls: PropTypes.bool,
//       wheel: PropTypes.bool,
//       startScale: PropTypes.number,
//     }),
//     comments: PropTypes.bool,
//     collapse: PropTypes.bool,
//   }),
// };

CustomProcedures.defaultOptions = {
  zoom: {
    controls: false,
    wheel: false,
    startScale: 0.9,
  },
  comments: false,
  collapse: false,
  scrollbars: true,
};

CustomProcedures.defaultProps = {
  options: CustomProcedures.defaultOptions,
};

const mapStateToProps = (state: any) => ({
  isRtl: state.locales.isRtl,
  mutator: state.scratchGui.customProcedures.mutator,
});

export default connect(mapStateToProps)(CustomProcedures);
