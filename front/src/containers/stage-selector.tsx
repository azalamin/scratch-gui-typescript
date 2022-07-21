import bindAll from 'lodash.bindall';
import omit from 'lodash.omit';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import {intlShape, injectIntl} from 'react-intl';

import {connect} from 'react-redux';
import {openBackdropLibrary} from '../reducers/modals';
import {activateTab, COSTUMES_TAB_INDEX} from '../reducers/editor-tab';
import {showStandardAlert, closeAlertWithId} from '../reducers/alerts';
import {setHoveredSprite} from '../reducers/hovered-target';
import DragConstants from '../lib/drag-constants';
import DropAreaHOC from '../lib/drop-area-hoc.jsx';
import ThrottledPropertyHOC from '../lib/throttled-property-hoc.jsx';
import {emptyCostume} from '../lib/empty-assets';
import sharedMessages from '../lib/shared-messages';
import {fetchCode} from '../lib/backpack-api';
import {getEventXY} from '../lib/touch-utils';

import StageSelectorComponent from '../components/stage-selector/stage-selector.jsx';

import backdropLibraryContent from '../lib/libraries/backdrops.json';
import {handleFileUpload, costumeUpload} from '../lib/file-uploader.js';

const dragTypes = [
    DragConstants.COSTUME,
    DragConstants.SOUND,
    DragConstants.BACKPACK_COSTUME,
    DragConstants.BACKPACK_SOUND,
    DragConstants.BACKPACK_CODE
];

const DroppableThrottledStage = DropAreaHOC(dragTypes)(
    ThrottledPropertyHOC('url', 500)(StageSelectorComponent)
);

const StageSelector = (props) => {
    useEffect(() => {
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('touchend', handleTouchEnd);
      }
    }, [handleTouchEnd]);

    const handleTouchEnd = (e) => {
        const {x, y} = getEventXY(e);
        const {top, left, bottom, right} =  ref.getBoundingClientRect();
        if (x >= left && x <= right && y >= top && y <= bottom) {
             handleMouseEnter();
        }
    }
    const addBackdropFromLibraryItem = (item, shouldActivateTab = true) => {
        const vmBackdrop = {
            name: item.name,
            md5: item.md5ext,
            rotationCenterX: item.rotationCenterX,
            rotationCenterY: item.rotationCenterY,
            bitmapResolution: item.bitmapResolution,
            skinId: null
        };
         handleNewBackdrop(vmBackdrop, shouldActivateTab);
    }
    const handleClick = () => {
         props.onSelect( props.id);
    }
    const handleNewBackdrop = (backdrops_, shouldActivateTab = true) => {
        const backdrops = Array.isArray(backdrops_) ? backdrops_ : [backdrops_];
        return Promise.all(backdrops.map(backdrop =>
             props.vm.addBackdrop(backdrop.md5, backdrop)
        )).then(() => {
            if (shouldActivateTab) {
                return  props.onActivateTab(COSTUMES_TAB_INDEX);
            }
        });
    }
    const handleSurpriseBackdrop = (e) => {
        e.stopPropagation(); // Prevent click from falling through to selecting stage.
        // @todo should this not add a backdrop you already have?
        const item = backdropLibraryContent[Math.floor(Math.random() * backdropLibraryContent.length)];
         addBackdropFromLibraryItem(item, false);
    }
    const handleEmptyBackdrop = (e) => {
        e.stopPropagation(); // Prevent click from falling through to stage selector, select it manually below
         props.vm.setEditingTarget( props.id);
         handleNewBackdrop(emptyCostume( props.intl.formatMessage(sharedMessages.backdrop, {index: 1})));
    }
    const handleBackdropUpload = (e) => {
        const storage =  props.vm.runtime.storage;
         props.onShowImporting();
        handleFileUpload(e.target, (buffer, fileType, fileName, fileIndex, fileCount) => {
            costumeUpload(buffer, fileType, storage, vmCostumes => {
                 props.vm.setEditingTarget( props.id);
                vmCostumes.forEach((costume, i) => {
                    costume.name = `${fileName}${i ? i + 1 : ''}`;
                });
                 handleNewBackdrop(vmCostumes).then(() => {
                    if (fileIndex === fileCount - 1) {
                         props.onCloseImporting();
                    }
                });
            },  props.onCloseImporting);
        },  props.onCloseImporting);
    }
    const handleFileUploadClick = (e) => {
        e.stopPropagation(); // Prevent click from selecting the stage, that is handled manually in backdrop upload
         fileInput.click();
    }
    const handleMouseEnter = () => {
         props.dispatchSetHoveredSprite( props.id);
    }
    const handleMouseLeave = () => {
         props.dispatchSetHoveredSprite(null);
    }
    const handleDrop = (dragInfo) => {
        if (dragInfo.dragType === DragConstants.COSTUME) {
             props.vm.shareCostumeToTarget(dragInfo.index,  props.id);
        } else if (dragInfo.dragType === DragConstants.SOUND) {
             props.vm.shareSoundToTarget(dragInfo.index,  props.id);
        } else if (dragInfo.dragType === DragConstants.BACKPACK_COSTUME) {
             props.vm.addCostume(dragInfo.payload.body, {
                name: dragInfo.payload.name
            },  props.id);
        } else if (dragInfo.dragType === DragConstants.BACKPACK_SOUND) {
             props.vm.addSound({
                md5: dragInfo.payload.body,
                name: dragInfo.payload.name
            },  props.id);
        } else if (dragInfo.dragType === DragConstants.BACKPACK_CODE) {
            fetchCode(dragInfo.payload.bodyUrl)
                .then(blocks => {
                     props.vm.shareBlocksToTarget(blocks,  props.id);
                     props.vm.refreshWorkspace();
                });
        }
    }
    let fileInput;
    const setFileInput = (input) => {
         fileInput = input;
    }
    let ref;
    const setRef = (ref) => {
         ref = ref;
    }

    const componentProps = omit( props, [
            'asset', 'dispatchSetHoveredSprite', 'id', 'intl',
            'onActivateTab', 'onSelect', 'onShowImporting', 'onCloseImporting']
    );
    
    return (
        <DroppableThrottledStage
            componentRef={ setRef}
            fileInputRef={ setFileInput}
            onBackdropFileUpload={ handleBackdropUpload}
            onBackdropFileUploadClick={ handleFileUploadClick}
            onClick={ handleClick}
            onDrop={ handleDrop}
            onEmptyBackdropClick={ handleEmptyBackdrop}
            onMouseEnter={ handleMouseEnter}
            onMouseLeave={ handleMouseLeave}
            onSurpriseBackdropClick={ handleSurpriseBackdrop}
            {...componentProps}
        />
    );
};


StageSelector.propTypes = {
    ...StageSelectorComponent.propTypes,
    id: PropTypes.string,
    intl: intlShape.isRequired,
    onCloseImporting: PropTypes.func,
    onSelect: PropTypes.func,
    onShowImporting: PropTypes.func
};

const mapStateToProps = (state, {asset, id}) => ({
    url: asset && asset.encodeDataURI(),
    vm: state.scratchGui.vm,
    receivedBlocks: state.scratchGui.hoveredTarget.receivedBlocks &&
            state.scratchGui.hoveredTarget.sprite === id,
    raised: state.scratchGui.blockDrag
});

const mapDispatchToProps = dispatch => ({
    onNewBackdropClick: e => {
        e.stopPropagation();
        dispatch(openBackdropLibrary());
    },
    onActivateTab: tabIndex => {
        dispatch(activateTab(tabIndex));
    },
    dispatchSetHoveredSprite: spriteId => {
        dispatch(setHoveredSprite(spriteId));
    },
    onCloseImporting: () => dispatch(closeAlertWithId('importingAsset')),
    onShowImporting: () => dispatch(showStandardAlert('importingAsset'))
});

export default injectIntl(connect(
    mapStateToProps,
    mapDispatchToProps
)(StageSelector));
