import bindAll from 'lodash.bindall';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {intlShape, injectIntl} from 'react-intl';

import {
    openSpriteLibrary,
    closeSpriteLibrary
} from '../reducers/modals';
import {activateTab, COSTUMES_TAB_INDEX, BLOCKS_TAB_INDEX} from '../reducers/editor-tab';
import {setReceivedBlocks} from '../reducers/hovered-target';
import {showStandardAlert, closeAlertWithId} from '../reducers/alerts';
import {setRestore} from '../reducers/restore-deletion';
import DragConstants from '../lib/drag-constants';
import TargetPaneComponent from '../components/target-pane/target-pane.jsx';
import {BLOCKS_DEFAULT_SCALE} from '../lib/layout-constants';
import spriteLibraryContent from '../lib/libraries/sprites.json';
import {handleFileUpload, spriteUpload} from '../lib/file-uploader.js';
import sharedMessages from '../lib/shared-messages';
import {emptySprite} from '../lib/empty-assets';
import {highlightTarget} from '../reducers/targets';
import {fetchSprite, fetchCode} from '../lib/backpack-api';
import randomizeSpritePosition from '../lib/randomize-sprite-position';
import downloadBlob from '../lib/download-blob';

const TargetPane = (props) => {

    useEffect(() => {
      props.vm.addListener('BLOCK_DRAG_END', handleBlockDragEnd);
      return () => {
        props.vm.removeListener('BLOCK_DRAG_END', handleBlockDragEnd);
      }
    }, [handleBlockDragEnd, props])
    
    let fileInput;
    const handleChangeSpriteDirection = (direction) => {
        props.vm.postSpriteInfo({direction});
    }
    const handleChangeSpriteRotationStyle = (rotationStyle) => {
        props.vm.postSpriteInfo({rotationStyle});
    }
    const handleChangeSpriteName = (name) => {
        props.vm.renameSprite( props.editingTarget, name);
    }
    const handleChangeSpriteSize = (size) => {
        props.vm.postSpriteInfo({size});
    }
    const handleChangeSpriteVisibility = (visible) => {
        props.vm.postSpriteInfo({visible});
    }
    const handleChangeSpriteX = (x) => {
        props.vm.postSpriteInfo({x});
    }
    const handleChangeSpriteY = (y) => {
        props.vm.postSpriteInfo({y});
    }
    const handleDeleteSprite = (id) => {
        const restoreSprite =  props.vm.deleteSprite(id);
        const restoreFun = () => restoreSprite().then( handleActivateBlocksTab);
         props.dispatchUpdateRestore({
            restoreFun: restoreFun,
            deletedItem: 'Sprite'
        });

    }
    const handleDuplicateSprite = (id) => {
         props.vm.duplicateSprite(id);
    }
    const handleExportSprite = (id) => {
        const spriteName =  props.vm.runtime.getTargetById(id).getName();
        const saveLink = document.createElement('a');
        document.body.appendChild(saveLink);

         props.vm.exportSprite(id).then(content => {
            downloadBlob(`${spriteName}.sprite3`, content);
        });
    }
    const handleSelectSprite = (id) => {
         props.vm.setEditingTarget(id);
        if ( props.stage && id !==  props.stage.id) {
             props.onHighlightTarget(id);
        }
    }
    const handleSurpriseSpriteClick = () => {
        const surpriseSprites = spriteLibraryContent.filter(sprite =>
            (sprite.tags.indexOf('letters') === -1) && (sprite.tags.indexOf('numbers') === -1)
        );
        const item = surpriseSprites[Math.floor(Math.random() * surpriseSprites.length)];
        randomizeSpritePosition(item);
         props.vm.addSprite(JSON.stringify(item))
            .then( handleActivateBlocksTab);
    }
    const handlePaintSpriteClick = () => {
        const formatMessage =  props.intl.formatMessage;
        const emptyItem = emptySprite(
            formatMessage(sharedMessages.sprite, {index: 1}),
            formatMessage(sharedMessages.pop),
            formatMessage(sharedMessages.costume, {index: 1})
        );
         props.vm.addSprite(JSON.stringify(emptyItem)).then(() => {
            setTimeout(() => { // Wait for targets update to propagate before tab switching
                 props.onActivateTab(COSTUMES_TAB_INDEX);
            });
        });
    }
    const handleActivateBlocksTab = () => {
         props.onActivateTab(BLOCKS_TAB_INDEX);
    }
    const handleNewSprite = (spriteJSONString) => {
        return  props.vm.addSprite(spriteJSONString)
            .then( handleActivateBlocksTab);
    }
    const handleFileUploadClick = () => {
         fileInput.click();
    }
    const handleSpriteUpload = (e) => {
        const storage =  props.vm.runtime.storage;
         props.onShowImporting();
        handleFileUpload(e.target, (buffer, fileType, fileName, fileIndex, fileCount) => {
            spriteUpload(buffer, fileType, fileName, storage, newSprite => {
                 handleNewSprite(newSprite)
                    .then(() => {
                        if (fileIndex === fileCount - 1) {
                             props.onCloseImporting();
                        }
                    })
                    .catch( props.onCloseImporting);
            },  props.onCloseImporting);
        },  props.onCloseImporting);
    }
    const setFileInput = (input) => {
         fileInput = input;
    }
    const handleBlockDragEnd = (blocks) => {
        if ( props.hoveredTarget.sprite &&  props.hoveredTarget.sprite !==  props.editingTarget) {
             shareBlocks(blocks,  props.hoveredTarget.sprite,  props.editingTarget);
             props.onReceivedBlocks(true);
        }
    }
    const shareBlocks = (blocks, targetId, optFromTargetId) => {
        // Position the top-level block based on the scroll position.
        const topBlock = blocks.find(block => block.topLevel);
        if (topBlock) {
            let metrics;
            if ( props.workspaceMetrics.targets[targetId]) {
                metrics =  props.workspaceMetrics.targets[targetId];
            } else {
                metrics = {
                    scrollX: 0,
                    scrollY: 0,
                    scale: BLOCKS_DEFAULT_SCALE
                };
            }

            // Determine position of the top-level block based on the target's workspace metrics.
            const {scrollX, scrollY, scale} = metrics;
            const posY = -scrollY + 30;
            let posX;
            if ( props.isRtl) {
                posX = scrollX + 30;
            } else {
                posX = -scrollX + 30;
            }

            // Actually apply the position!
            topBlock.x = posX / scale;
            topBlock.y = posY / scale;
        }

        return  props.vm.shareBlocksToTarget(blocks, targetId, optFromTargetId);
    }
    const handleDrop = (dragInfo) => {
        const {sprite: targetId} =  props.hoveredTarget;
        if (dragInfo.dragType === DragConstants.SPRITE) {
            // Add one to both new and target index because we are not counting/moving the stage
             props.vm.reorderTarget(dragInfo.index + 1, dragInfo.newIndex + 1);
        } else if (dragInfo.dragType === DragConstants.BACKPACK_SPRITE) {
            // TODO storage does not have a way of loading zips right now, and may never need it.
            // So for now just grab the zip manually.
            fetchSprite(dragInfo.payload.bodyUrl)
                .then(sprite3Zip =>  props.vm.addSprite(sprite3Zip));
        } else if (targetId) {
            // Something is being dragged over one of the sprite tiles or the backdrop.
            // Dropping assets like sounds and costumes duplicate the asset on the
            // hovered target. Shared costumes also become the current costume on that target.
            // However, dropping does not switch the editing target or activate that editor tab.
            // This is based on 2.0 behavior, but seems like it keeps confusing switching to a minimum.
            // it allows the user to share multiple things without switching back and forth.
            if (dragInfo.dragType === DragConstants.COSTUME) {
                 props.vm.shareCostumeToTarget(dragInfo.index, targetId);
            } else if (targetId && dragInfo.dragType === DragConstants.SOUND) {
                 props.vm.shareSoundToTarget(dragInfo.index, targetId);
            } else if (dragInfo.dragType === DragConstants.BACKPACK_COSTUME) {
                // In scratch 2, this only creates a new sprite from the costume.
                // We may be able to handle both kinds of drops, depending on where
                // the drop happens. For now, just add the costume.
                 props.vm.addCostume(dragInfo.payload.body, {
                    name: dragInfo.payload.name
                }, targetId);
            } else if (dragInfo.dragType === DragConstants.BACKPACK_SOUND) {
                 props.vm.addSound({
                    md5: dragInfo.payload.body,
                    name: dragInfo.payload.name
                }, targetId);
            } else if (dragInfo.dragType === DragConstants.BACKPACK_CODE) {
                fetchCode(dragInfo.payload.bodyUrl)
                    .then(blocks =>  shareBlocks(blocks, targetId))
                    .then(() =>  props.vm.refreshWorkspace());
            }
        }
    };

    /* eslint-disable no-unused-vars */
    const {
        dispatchUpdateRestore,
        isRtl,
        onActivateTab,
        onCloseImporting,
        onHighlightTarget,
        onReceivedBlocks,
        onShowImporting,
        workspaceMetrics,
        ...componentProps
    } = props;
    /* eslint-enable no-unused-vars */

    return (
        <TargetPaneComponent
            {...componentProps}
            fileInputRef={ setFileInput}
            onActivateBlocksTab={ handleActivateBlocksTab}
            onChangeSpriteDirection={ handleChangeSpriteDirection}
            onChangeSpriteName={ handleChangeSpriteName}
            onChangeSpriteRotationStyle={ handleChangeSpriteRotationStyle}
            onChangeSpriteSize={ handleChangeSpriteSize}
            onChangeSpriteVisibility={ handleChangeSpriteVisibility}
            onChangeSpriteX={ handleChangeSpriteX}
            onChangeSpriteY={ handleChangeSpriteY}
            onDeleteSprite={ handleDeleteSprite}
            onDrop={ handleDrop}
            onDuplicateSprite={ handleDuplicateSprite}
            onExportSprite={ handleExportSprite}
            onFileUploadClick={ handleFileUploadClick}
            onPaintSpriteClick={ handlePaintSpriteClick}
            onSelectSprite={ handleSelectSprite}
            onSpriteUpload={ handleSpriteUpload}
            onSurpriseSpriteClick={ handleSurpriseSpriteClick}
         />
    );
};

const {
    onSelectSprite, // eslint-disable-line no-unused-vars
    onActivateBlocksTab, // eslint-disable-line no-unused-vars
    ...targetPaneProps
} = TargetPaneComponent.propTypes;

TargetPane.propTypes = {
    intl: intlShape.isRequired,
    onCloseImporting: PropTypes.func,
    onShowImporting: PropTypes.func,
    ...targetPaneProps
};

const mapStateToProps = state => ({
    editingTarget: state.scratchGui.targets.editingTarget,
    hoveredTarget: state.scratchGui.hoveredTarget,
    isRtl: state.locales.isRtl,
    spriteLibraryVisible: state.scratchGui.modals.spriteLibrary,
    sprites: state.scratchGui.targets.sprites,
    stage: state.scratchGui.targets.stage,
    raiseSprites: state.scratchGui.blockDrag,
    workspaceMetrics: state.scratchGui.workspaceMetrics
});

const mapDispatchToProps = dispatch => ({
    onNewSpriteClick: e => {
        e.preventDefault();
        dispatch(openSpriteLibrary());
    },
    onRequestCloseSpriteLibrary: () => {
        dispatch(closeSpriteLibrary());
    },
    onActivateTab: tabIndex => {
        dispatch(activateTab(tabIndex));
    },
    onReceivedBlocks: receivedBlocks => {
        dispatch(setReceivedBlocks(receivedBlocks));
    },
    dispatchUpdateRestore: restoreState => {
        dispatch(setRestore(restoreState));
    },
    onHighlightTarget: id => {
        dispatch(highlightTarget(id));
    },
    onCloseImporting: () => dispatch(closeAlertWithId('importingAsset')),
    onShowImporting: () => dispatch(showStandardAlert('importingAsset'))
});

export default injectIntl(connect(
    mapStateToProps,
    mapDispatchToProps
)(TargetPane));
