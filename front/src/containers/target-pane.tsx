import { useCallback, useEffect } from 'react';
import { injectIntl, IntlShape } from 'react-intl';
import { connect } from 'react-redux';

import TargetPaneComponent from '../components/target-pane/target-pane.jsx';
import { fetchCode, fetchSprite } from '../lib/backpack-api';
import downloadBlob from '../lib/download-blob';
import DragConstants from '../lib/drag-constants';
import { emptySprite } from '../lib/empty-assets';
import { handleFileUpload, spriteUpload } from '../lib/file-uploader.js';
import { BLOCKS_DEFAULT_SCALE } from '../lib/layout-constants';
import spriteLibraryContent from '../lib/libraries/sprites.json';
import randomizeSpritePosition from '../lib/randomize-sprite-position';
import sharedMessages from '../lib/shared-messages';
import { closeAlertWithId, showStandardAlert } from '../reducers/alerts';
import {
  activateTab,
  BLOCKS_TAB_INDEX,
  COSTUMES_TAB_INDEX,
} from '../reducers/editor-tab';
import { setReceivedBlocks } from '../reducers/hovered-target';
import { closeSpriteLibrary, openSpriteLibrary } from '../reducers/modals';
import { setRestore } from '../reducers/restore-deletion';
import { highlightTarget } from '../reducers/targets';

const TargetPane = (props: PropsInterface) => {
  let fileInput: any;
  const handleChangeSpriteDirection = (direction: any) => {
    props.vm.postSpriteInfo({ direction });
  };
  const handleChangeSpriteRotationStyle = (rotationStyle: any) => {
    props.vm.postSpriteInfo({ rotationStyle });
  };
  const handleChangeSpriteName = (name: any) => {
    props.vm.renameSprite(props.editingTarget, name);
  };
  const handleChangeSpriteSize = (size: any) => {
    props.vm.postSpriteInfo({ size });
  };
  const handleChangeSpriteVisibility = (visible: any) => {
    props.vm.postSpriteInfo({ visible });
  };
  const handleChangeSpriteX = (x: any) => {
    props.vm.postSpriteInfo({ x });
  };
  const handleChangeSpriteY = (y: any) => {
    props.vm.postSpriteInfo({ y });
  };
  const handleDeleteSprite = (id: any) => {
    const restoreSprite: any = props.vm.deleteSprite(id);
    const restoreFun = () => restoreSprite().then(handleActivateBlocksTab);
    props.dispatchUpdateRestore({
      restoreFun: restoreFun,
      deletedItem: 'Sprite',
    });
  };
  const handleDuplicateSprite = (id: any) => {
    props.vm.duplicateSprite(id);
  };
  const handleExportSprite = (id: any) => {
    const spriteName = props.vm.runtime.getTargetById(id).getName();
    const saveLink = document.createElement('a');
    document.body.appendChild(saveLink);

    props.vm.exportSprite(id).then((content: any) => {
      downloadBlob(`${spriteName}.sprite3`, content);
    });
  };
  const handleSelectSprite = (id: any) => {
    props.vm.setEditingTarget(id);
    if (props.stage && id !== props.stage.id) {
      props.onHighlightTarget(id);
    }
  };
  const handleSurpriseSpriteClick = () => {
    const surpriseSprites = spriteLibraryContent.filter(
      (sprite: any) =>
        sprite.tags.indexOf('letters') === -1 &&
        sprite.tags.indexOf('numbers') === -1
    );
    const item =
      surpriseSprites[Math.floor(Math.random() * surpriseSprites.length)];
    randomizeSpritePosition(item);
    props.vm.addSprite(JSON.stringify(item)).then(handleActivateBlocksTab);
  };
  const handlePaintSpriteClick = () => {
    const formatMessage = props.intl.formatMessage;
    const emptyItem = emptySprite(
      formatMessage(sharedMessages.sprite, { index: 1 }),
      formatMessage(sharedMessages.pop),
      formatMessage(sharedMessages.costume, { index: 1 })
    );
    props.vm.addSprite(JSON.stringify(emptyItem)).then(() => {
      setTimeout(() => {
        // Wait for targets update to propagate before tab switching
        props.onActivateTab(COSTUMES_TAB_INDEX);
      });
    });
  };
  const handleActivateBlocksTab = () => {
    props.onActivateTab(BLOCKS_TAB_INDEX);
  };
  const handleNewSprite = (spriteJSONString: any) => {
    return props.vm.addSprite(spriteJSONString).then(handleActivateBlocksTab);
  };
  const handleFileUploadClick = () => {
    fileInput.click();
  };
  const handleSpriteUpload = (e: any) => {
    const storage = props.vm.runtime.storage;
    props.onShowImporting();
    handleFileUpload(
      e.target,
      (
        buffer: any,
        fileType: any,
        fileName: any,
        fileIndex: any,
        fileCount: any
      ) => {
        spriteUpload(
          buffer,
          fileType,
          fileName,
          storage,
          (newSprite: any) => {
            handleNewSprite(newSprite)
              .then(() => {
                if (fileIndex === fileCount - 1) {
                  props.onCloseImporting();
                }
              })
              .catch(props.onCloseImporting);
          },
          props.onCloseImporting
        );
      },
      props.onCloseImporting
    );
  };
  const setFileInput = (input: any) => {
    fileInput = input;
  };

  const shareBlocks = useCallback(
    (blocks: any, targetId: any, optFromTargetId: any) => {
      // Position the top-level block based on the scroll position.
      const topBlock = blocks.find((block: any) => block.topLevel);
      if (topBlock) {
        let metrics;
        if (props.workspaceMetrics.targets[targetId]) {
          metrics = props.workspaceMetrics.targets[targetId];
        } else {
          metrics = {
            scrollX: 0,
            scrollY: 0,
            scale: BLOCKS_DEFAULT_SCALE,
          };
        }

        // Determine position of the top-level block based on the target's workspace metrics.
        const { scrollX, scrollY, scale } = metrics;
        const posY = -scrollY + 30;
        let posX;
        if (props.isRtl) {
          posX = scrollX + 30;
        } else {
          posX = -scrollX + 30;
        }

        // Actually apply the position!
        topBlock.x = posX / scale;
        topBlock.y = posY / scale;
      }

      return props.vm.shareBlocksToTarget(blocks, targetId, optFromTargetId);
    },
    [props.isRtl, props.vm, props.workspaceMetrics.targets]
  );

  const handleBlockDragEnd = useCallback(
    blocks => {
      if (
        props.hoveredTarget.sprite &&
        props.hoveredTarget.sprite !== props.editingTarget
      ) {
        shareBlocks(blocks, props.hoveredTarget.sprite, props.editingTarget);
        props.onReceivedBlocks(true);
      }
    },
    [props, shareBlocks]
  );

  const handleDrop = (dragInfo: any) => {
    const { sprite: targetId } = props.hoveredTarget;
    if (dragInfo.dragType === DragConstants.SPRITE) {
      // Add one to both new and target index because we are not counting/moving the stage
      props.vm.reorderTarget(dragInfo.index + 1, dragInfo.newIndex + 1);
    } else if (dragInfo.dragType === DragConstants.BACKPACK_SPRITE) {
      // TODO storage does not have a way of loading zips right now, and may never need it.
      // So for now just grab the zip manually.
      fetchSprite(dragInfo.payload.bodyUrl).then((sprite3Zip: any) =>
        props.vm.addSprite(sprite3Zip)
      );
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
        props.vm.addCostume(
          dragInfo.payload.body,
          {
            name: dragInfo.payload.name,
          },
          targetId
        );
      } else if (dragInfo.dragType === DragConstants.BACKPACK_SOUND) {
        props.vm.addSound(
          {
            md5: dragInfo.payload.body,
            name: dragInfo.payload.name,
          },
          targetId
        );
      } else if (dragInfo.dragType === DragConstants.BACKPACK_CODE) {
        fetchCode(dragInfo.payload.bodyUrl)
          .then((blocks: any) => shareBlocks(blocks, targetId, null))
          .then(() => props.vm.refreshWorkspace());
      }
    }
  };

  useEffect(() => {
    props.vm.addListener('BLOCK_DRAG_END', handleBlockDragEnd);
    return () => {
      props.vm.removeListener('BLOCK_DRAG_END', handleBlockDragEnd);
    };
  }, [handleBlockDragEnd, props]);

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
      fileInputRef={setFileInput}
      onActivateBlocksTab={handleActivateBlocksTab}
      onChangeSpriteDirection={handleChangeSpriteDirection}
      onChangeSpriteName={handleChangeSpriteName}
      onChangeSpriteRotationStyle={handleChangeSpriteRotationStyle}
      onChangeSpriteSize={handleChangeSpriteSize}
      onChangeSpriteVisibility={handleChangeSpriteVisibility}
      onChangeSpriteX={handleChangeSpriteX}
      onChangeSpriteY={handleChangeSpriteY}
      onDeleteSprite={handleDeleteSprite}
      onDrop={handleDrop}
      onDuplicateSprite={handleDuplicateSprite}
      onExportSprite={handleExportSprite}
      onFileUploadClick={handleFileUploadClick}
      onPaintSpriteClick={handlePaintSpriteClick}
      onSelectSprite={handleSelectSprite}
      onSpriteUpload={handleSpriteUpload}
      onSurpriseSpriteClick={handleSurpriseSpriteClick}
    />
  );
};

const {
  onSelectSprite, // eslint-disable-line no-unused-vars
  onActivateBlocksTab, // eslint-disable-line no-unused-vars
  ...targetPaneProps
}: any = TargetPaneComponent;

interface PropsInterface {
  intl: IntlShape;
  isRtl: any;
  onCloseImporting: any;
  onShowImporting: any;
  vm: any;
  editingTarget: any;
  dispatchUpdateRestore: any;
  stage: any;
  onHighlightTarget: any;
  onActivateTab: any;
  hoveredTarget: any;
  onReceivedBlocks: any;
  workspaceMetrics: any;
  stageSize: any;
}

// TODO
// TargetPane.propTypes = {
//   intl: intlShape.isRequired,
//   onCloseImporting: PropTypes.func,
//   onShowImporting: PropTypes.func,
//   ...targetPaneProps,
// };

const mapStateToProps = (state: any) => ({
  editingTarget: state.scratchGui.targets.editingTarget,
  hoveredTarget: state.scratchGui.hoveredTarget,
  isRtl: state.locales.isRtl,
  spriteLibraryVisible: state.scratchGui.modals.spriteLibrary,
  sprites: state.scratchGui.targets.sprites,
  stage: state.scratchGui.targets.stage,
  raiseSprites: state.scratchGui.blockDrag,
  workspaceMetrics: state.scratchGui.workspaceMetrics,
});

const mapDispatchToProps = (dispatch: any) => ({
  onNewSpriteClick: (e: any) => {
    e.preventDefault();
    dispatch(openSpriteLibrary());
  },
  onRequestCloseSpriteLibrary: () => {
    dispatch(closeSpriteLibrary());
  },
  onActivateTab: (tabIndex: any) => {
    dispatch(activateTab(tabIndex));
  },
  onReceivedBlocks: (receivedBlocks: any) => {
    dispatch(setReceivedBlocks(receivedBlocks));
  },
  dispatchUpdateRestore: (restoreState: any) => {
    dispatch(setRestore(restoreState));
  },
  onHighlightTarget: (id: any) => {
    dispatch(highlightTarget(id));
  },
  onCloseImporting: () => dispatch(closeAlertWithId('importingAsset')),
  onShowImporting: () => dispatch(showStandardAlert('importingAsset')),
});

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(TargetPane)
);
