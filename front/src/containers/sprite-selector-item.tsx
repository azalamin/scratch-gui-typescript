import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import {connect} from 'react-redux';

import {setHoveredSprite} from '../reducers/hovered-target';
import {updateAssetDrag} from '../reducers/asset-drag';
import storage from '../lib/storage';
import VM from 'scratch-vm';
import getCostumeUrl from '../lib/get-costume-url';
import DragRecognizer from '../lib/drag-recognizer';
import {getEventXY} from '../lib/touch-utils';

import SpriteSelectorItemComponent from '../components/sprite-selector-item/sprite-selector-item.jsx';

const SpriteSelectorItem = (prop) => {
    const dragRecognizer = new DragRecognizer({
            onDrag: handleDrag,
            onDragEnd: handleDragEnd
        });

    useEffect(() => {
      document.addEventListener('touchend', handleTouchEnd);
    
      return () => {
        document.removeEventListener('touchend', handleTouchEnd);
        dragRecognizer.reset();
      }
    }, []);

    let noClick;
    let ref = useRef();
    const getCostumeData = () => {
        if (prop.costumeURL) return prop.costumeURL;
        if (!prop.asset) return null;

        return getCostumeUrl(prop.asset);
    }
    const handleDragEnd = () => {
        if (prop.dragging) {
            prop.onDrag({
                img: null,
                currentOffset: null,
                dragging: false,
                dragType: null,
                index: null
            });
        }
        setTimeout(() => {
             noClick = false;
        });
    }
    const handleDrag = (currentOffset) => {
         prop.onDrag({
            img:  getCostumeData(),
            currentOffset: currentOffset,
            dragging: true,
            dragType:  prop.dragType,
            index:  prop.index,
            payload:  prop.dragPayload
        });
         noClick = true;
    }
    const handleTouchEnd = (e) => {
        const {x, y} = getEventXY(e);
        const {top, left, bottom, right} = ref.getBoundingClientRect();
        if (x >= left && x <= right && y >= top && y <= bottom) {
             handleMouseEnter();
        }
    }
    const handleMouseDown = (e) => {
         dragRecognizer.start(e);
    }
    const handleClick = (e) => {
        e.preventDefault();
        if (!noClick) {
             prop.onClick(prop.id);
        }
    }
    const handleDelete = (e) => {
        e.stopPropagation(); // To prevent from bubbling back to handleClick
         prop.onDeleteButtonClick(prop.id);
    }
    const handleDuplicate = (e) => {
        e.stopPropagation(); // To prevent from bubbling back to handleClick
        prop.onDuplicateButtonClick(prop.id);
    }
    const handleExport = (e) => {
        e.stopPropagation();
         prop.onExportButtonClick( prop.id);
    }
    const handleMouseLeave = () => {
         prop.dispatchSetHoveredSprite(null);
    }
    const handleMouseEnter = () => {
         prop.dispatchSetHoveredSprite( prop.id);
    }
    const setRef = (component) => {
        // Access the DOM node using .elem because it is going through ContextMenuTrigger
         ref = component && component.elem;
    }

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
        } =  prop;
    
    return (
        <SpriteSelectorItemComponent
            componentRef={setRef}
            costumeURL={getCostumeData()}
            preventContextMenu={ dragRecognizer.gestureInProgress()}
            onClick={handleClick}
            onDeleteButtonClick={onDeleteButtonClick ?  handleDelete : null}
            onDuplicateButtonClick={onDuplicateButtonClick ?  handleDuplicate : null}
            onExportButtonClick={onExportButtonClick ?  handleExport : null}
            onMouseDown={ handleMouseDown}
            onMouseEnter={ handleMouseEnter}
            onMouseLeave={ handleMouseLeave}
            {...props}
        />
    );
};

SpriteSelectorItem.propTypes = {
    asset: PropTypes.instanceOf(storage.Asset),
    costumeURL: PropTypes.string,
    dispatchSetHoveredSprite: PropTypes.func.isRequired,
    dragPayload: PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.number]),
    dragType: PropTypes.string,
    dragging: PropTypes.bool,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    index: PropTypes.number,
    name: PropTypes.string,
    onClick: PropTypes.func,
    onDeleteButtonClick: PropTypes.func,
    onDrag: PropTypes.func.isRequired,
    onDuplicateButtonClick: PropTypes.func,
    onExportButtonClick: PropTypes.func,
    receivedBlocks: PropTypes.bool.isRequired,
    selected: PropTypes.bool,
    vm: PropTypes.instanceOf(VM).isRequired
};

const mapStateToProps = (state, {id}) => ({
    dragging: state.scratchGui.assetDrag.dragging,
    receivedBlocks: state.scratchGui.hoveredTarget.receivedBlocks &&
            state.scratchGui.hoveredTarget.sprite === id,
    vm: state.scratchGui.vm
});
const mapDispatchToProps = dispatch => ({
    dispatchSetHoveredSprite: spriteId => {
        dispatch(setHoveredSprite(spriteId));
    },
    onDrag: data => dispatch(updateAssetDrag(data))
});

const ConnectedComponent = connect(
    mapStateToProps,
    mapDispatchToProps
)(SpriteSelectorItem);

export default ConnectedComponent;
