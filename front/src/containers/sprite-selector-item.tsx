import { useCallback, useEffect, useRef } from 'react';
import { connect } from 'react-redux';

import DragRecognizer from '../lib/drag-recognizer';
import getCostumeUrl from '../lib/get-costume-url';
import { getEventXY } from '../lib/touch-utils';
import { updateAssetDrag } from '../reducers/asset-drag';
import { setHoveredSprite } from '../reducers/hovered-target';

import SpriteSelectorItemComponent from '../components/sprite-selector-item/sprite-selector-item';

const SpriteSelectorItem = (prop: PropsInterface) => {
  let noClick: any;
  let ref: any = useRef();
  const getCostumeData = () => {
    if (prop.costumeURL) return prop.costumeURL;
    if (!prop.asset) return null;

    return getCostumeUrl(prop.asset);
  };
  const handleDragEnd = () => {
    if (prop.dragging) {
      prop.onDrag({
        img: null,
        currentOffset: null,
        dragging: false,
        dragType: null,
        index: null,
      });
    }
    setTimeout(() => {
      noClick = false;
    });
  };
  const handleDrag = (currentOffset: any) => {
    prop.onDrag({
      img: getCostumeData(),
      currentOffset: currentOffset,
      dragging: true,
      dragType: prop.dragType,
      index: prop.index,
      payload: prop.dragPayload,
    });
    noClick = true;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dragRecognizer = new DragRecognizer({
    onDrag: handleDrag,
    onDragEnd: handleDragEnd,
  });

  const handleMouseDown = (e: any) => {
    dragRecognizer.start(e);
  };
  const handleClick = (e: any) => {
    e.preventDefault();
    if (!noClick) {
      prop.onClick(prop.id);
    }
  };
  const handleDelete = (e: any) => {
    e.stopPropagation(); // To prevent from bubbling back to handleClick
    prop.onDeleteButtonClick(prop.id);
  };
  const handleDuplicate = (e: any) => {
    e.stopPropagation(); // To prevent from bubbling back to handleClick
    prop.onDuplicateButtonClick(prop.id);
  };
  const handleExport = (e: any) => {
    e.stopPropagation();
    prop.onExportButtonClick(prop.id);
  };
  const handleMouseLeave = () => {
    prop.dispatchSetHoveredSprite(null);
  };
  const handleMouseEnter = useCallback(() => {
    prop.dispatchSetHoveredSprite(prop.id);
  }, [prop]);
  const handleTouchEnd = useCallback(
    e => {
      const { x, y } = getEventXY(e);
      const { top, left, bottom, right } = ref.getBoundingClientRect();
      if (x >= left && x <= right && y >= top && y <= bottom) {
        handleMouseEnter();
      }
    },
    [handleMouseEnter]
  );

  const setRef = (component: any) => {
    // Access the DOM node using .elem because it is going through ContextMenuTrigger
    ref = component && component.elem;
  };

  useEffect(() => {
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchend', handleTouchEnd);
      dragRecognizer.reset();
    };
  }, [dragRecognizer, handleTouchEnd]);

  const {
    /* eslint-disable no-unused-vars */
    asset,
    id,
    index,
    onClick,
    onDeleteButtonClick,
    onDuplicateButtonClick,
    onExportButtonClick,
    dragPayload,
    receivedBlocks,
    costumeURL,
    vm,
    /* eslint-enable no-unused-vars */
    ...props
  } = prop;

  return (
    <SpriteSelectorItemComponent
      componentRef={setRef}
      costumeURL={getCostumeData()}
      preventContextMenu={dragRecognizer.gestureInProgress()}
      onClick={handleClick}
      onDeleteButtonClick={onDeleteButtonClick ? handleDelete : null}
      onDuplicateButtonClick={onDuplicateButtonClick ? handleDuplicate : null}
      onExportButtonClick={onExportButtonClick ? handleExport : null}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    />
  );
};

interface PropsInterface {
  asset: any;
  costumeURL: string;
  dispatchSetHoveredSprite: any;
  dragPayload: object | string | number;
  dragType: string;
  dragging: boolean;
  id: number | string;
  index: number;
  name: string;
  onClick: any;
  onDeleteButtonClick: any;
  onDrag: any;
  onDuplicateButtonClick: any;
  onExportButtonClick: any;
  receivedBlocks: boolean;
  selected: boolean;
  vm: any;
}

// TODO
// SpriteSelectorItem.propTypes = {
//     asset: PropTypes.instanceOf(storage.Asset),
//     costumeURL: PropTypes.string,
//     dispatchSetHoveredSprite: PropTypes.func.isRequired,
//     dragPayload: PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.number]),
//     dragType: PropTypes.string,
//     dragging: PropTypes.bool,
//     id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
//     index: PropTypes.number,
//     name: PropTypes.string,
//     onClick: PropTypes.func,
//     onDeleteButtonClick: PropTypes.func,
//     onDrag: PropTypes.func.isRequired,
//     onDuplicateButtonClick: PropTypes.func,
//     onExportButtonClick: PropTypes.func,
//     receivedBlocks: PropTypes.bool.isRequired,
//     selected: PropTypes.bool,
//     vm: PropTypes.instanceOf(VM).isRequired
// };

const mapStateToProps = (state: any, { id }: any) => ({
  dragging: state.scratchGui.assetDrag.dragging,
  receivedBlocks:
    state.scratchGui.hoveredTarget.receivedBlocks &&
    state.scratchGui.hoveredTarget.sprite === id,
  vm: state.scratchGui.vm,
});
const mapDispatchToProps = (dispatch: any) => ({
  dispatchSetHoveredSprite: (spriteId: any) => {
    dispatch(setHoveredSprite(spriteId));
  },
  onDrag: (data: any) => dispatch(updateAssetDrag(data)),
});

const ConnectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(SpriteSelectorItem);

export default ConnectedComponent;
