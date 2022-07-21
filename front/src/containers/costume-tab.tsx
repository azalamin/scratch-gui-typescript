import { useEffect, useRef, useState } from 'react';
import { defineMessages, injectIntl } from 'react-intl';

import { connect } from 'react-redux';
import AssetPanel from '../components/asset-panel/asset-panel.jsx';
import downloadBlob from '../lib/download-blob';
import DragConstants from '../lib/drag-constants';
import { emptyCostume } from '../lib/empty-assets';
import errorBoundaryHOC from '../lib/error-boundary-hoc.jsx';
import { costumeUpload, handleFileUpload } from '../lib/file-uploader.js';
import sharedMessages from '../lib/shared-messages';
import PaintEditorWrapper from './paint-editor-wrapper.jsx';

import { openBackdropLibrary, openCostumeLibrary } from '../reducers/modals';

import { activateTab, SOUNDS_TAB_INDEX } from '../reducers/editor-tab';

import { closeAlertWithId, showStandardAlert } from '../reducers/alerts';
import { setRestore } from '../reducers/restore-deletion';

import fileUploadIcon from '../components/action-menu/icon--file-upload.svg';
import paintIcon from '../components/action-menu/icon--paint.svg';
import searchIcon from '../components/action-menu/icon--search.svg';
import surpriseIcon from '../components/action-menu/icon--surprise.svg';
import addLibraryBackdropIcon from '../components/asset-panel/icon--add-backdrop-lib.svg';
import addLibraryCostumeIcon from '../components/asset-panel/icon--add-costume-lib.svg';

import backdropLibraryContent from '../lib/libraries/backdrops.json';
import costumeLibraryContent from '../lib/libraries/costumes.json';

let messages: any = defineMessages({
  addLibraryBackdropMsg: {
    defaultMessage: 'Choose a Backdrop',
    description: 'Button to add a backdrop in the editor tab',
    id: 'gui.costumeTab.addBackdropFromLibrary',
  },
  addLibraryCostumeMsg: {
    defaultMessage: 'Choose a Costume',
    description: 'Button to add a costume in the editor tab',
    id: 'gui.costumeTab.addCostumeFromLibrary',
  },
  addBlankCostumeMsg: {
    defaultMessage: 'Paint',
    description: 'Button to add a blank costume in the editor tab',
    id: 'gui.costumeTab.addBlankCostume',
  },
  addSurpriseCostumeMsg: {
    defaultMessage: 'Surprise',
    description: 'Button to add a surprise costume in the editor tab',
    id: 'gui.costumeTab.addSurpriseCostume',
  },
  addFileBackdropMsg: {
    defaultMessage: 'Upload Backdrop',
    description:
      'Button to add a backdrop by uploading a file in the editor tab',
    id: 'gui.costumeTab.addFileBackdrop',
  },
  addFileCostumeMsg: {
    defaultMessage: 'Upload Costume',
    description:
      'Button to add a costume by uploading a file in the editor tab',
    id: 'gui.costumeTab.addFileCostume',
  },
});

messages = { ...messages, ...sharedMessages };

const CostumeTab = (props: PropsInterface) => {
  const [selectedCostumeIndex, setSelectedCostumeIndex] = useState(0);
  const [editingTargetState, setEditingTargetState] = useState(null);
  let fileInput: any = useRef();

  const target =
    props.editingTarget && props.sprites[props.editingTarget]
      ? props.sprites[props.editingTarget]
      : props.stage;

  useEffect(() => {
    if (target && target.currentCostume) {
      setSelectedCostumeIndex(target.currentCostume);
    } else {
      setSelectedCostumeIndex(0);
    }
  }, [target]);

  useEffect(() => {
    const { editingTarget, sprites, stage } = props;

    const targetEffect =
      editingTarget && sprites[editingTarget] ? sprites[editingTarget] : stage;
    if (!targetEffect || !targetEffect.costumes) {
      return;
    }
    if (editingTargetState === editingTarget) {
      // If costumes have been added or removed, change costumes to the editing target's
      // current costume.
      setEditingTargetState(editingTarget);
      const oldTarget = props.sprites[editingTarget]
        ? props.sprites[editingTarget]
        : props.stage;
      // @todo: Find and switch to the index of the costume that is new. This is blocked by
      // https://github.com/LLK/scratch-vm/issues/967
      // Right now, you can land on the wrong costume if a costume changing script is running.
      if (oldTarget.costumeCount !== targetEffect.costumeCount) {
        setSelectedCostumeIndex(targetEffect.currentCostume);
      }
    } else {
      // If switching editing targets, update the costume index
      setSelectedCostumeIndex(targetEffect.currentCostume);
    }
  }, [editingTargetState, props]);

  const handleSelectCostume = (costumeIndex: any) => {
    props.vm.editingTarget.setCostume(costumeIndex);
    setSelectedCostumeIndex(costumeIndex);
  };
  const handleDeleteCostume = (costumeIndex: any) => {
    const restoreCostumeFun = props.vm.deleteCostume(costumeIndex);
    props.dispatchUpdateRestore({
      restoreFun: restoreCostumeFun,
      deletedItem: 'Costume',
    });
  };
  const handleDuplicateCostume = (costumeIndex: any) => {
    props.vm.duplicateCostume(costumeIndex);
  };
  const handleExportCostume = (costumeIndex: any) => {
    const item = props.vm.editingTarget.sprite.costumes[costumeIndex];
    const blob = new Blob([item.asset.data], {
      type: item.asset.assetType.contentType,
    });
    downloadBlob(`${item.name}.${item.asset.dataFormat}`, blob);
  };
  const handleNewCostume = (
    costume: any,
    fromCostumeLibrary: any,
    targetId: any
  ) => {
    const costumes = Array.isArray(costume) ? costume : [costume];

    return Promise.all(
      costumes.map(c => {
        if (fromCostumeLibrary) {
          return props.vm.addCostumeFromLibrary(c.md5, c);
        }
        // If targetId is falsy, VM should default it to editingTarget.id
        // However, targetId should be provided to prevent #5876,
        // if making new costume takes a while
        return props.vm.addCostume(c.md5, c, targetId);
      })
    );
  };
  const handleNewBlankCostume = () => {
    const name = props.vm.editingTarget.isStage
      ? props.intl.formatMessage(messages.backdrop, { index: 1 })
      : props.intl.formatMessage(messages.costume, { index: 1 });
    handleNewCostume(emptyCostume(name));
  };
  const handleSurpriseCostume = () => {
    const item =
      costumeLibraryContent[
        Math.floor(Math.random() * costumeLibraryContent.length)
      ];
    const vmCostume = {
      name: item.name,
      md5: item.md5ext,
      rotationCenterX: item.rotationCenterX,
      rotationCenterY: item.rotationCenterY,
      bitmapResolution: item.bitmapResolution,
      skinId: null,
    };
    handleNewCostume(vmCostume, true /*  */);
  };
  const handleSurpriseBackdrop = () => {
    const item =
      backdropLibraryContent[
        Math.floor(Math.random() * backdropLibraryContent.length)
      ];
    const vmCostume = {
      name: item.name,
      md5: item.md5ext,
      rotationCenterX: item.rotationCenterX,
      rotationCenterY: item.rotationCenterY,
      bitmapResolution: item.bitmapResolution,
      skinId: null,
    };
    handleNewCostume(vmCostume);
  };
  const handleCostumeUpload = e => {
    const storage = props.vm.runtime.storage;
    const targetId = props.vm.editingTarget.id;
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
        costumeUpload(
          buffer,
          fileType,
          storage,
          (vmCostumes: any) => {
            vmCostumes.forEach((costume: any, i: any) => {
              costume.name = `${fileName}${i ? i + 1 : ''}`;
            });
            handleNewCostume(vmCostumes, false, targetId).then(() => {
              if (fileIndex === fileCount - 1) {
                props.onCloseImporting();
              }
            });
          },
          props.onCloseImporting
        );
      },
      props.onCloseImporting
    );
  };
  const handleFileUploadClick = () => {
    fileInput.click();
  };
  const handleDrop = (dropInfo: any) => {
    if (dropInfo.dragType === DragConstants.COSTUME) {
      const sprite = props.vm.editingTarget.sprite;
      const activeCostume = sprite.costumes[selectedCostumeIndex];
      props.vm.reorderCostume(
        props.vm.editingTarget.id,
        dropInfo.index,
        dropInfo.newIndex
      );
      setSelectedCostumeIndex(sprite.costumes.indexOf(activeCostume));
    } else if (dropInfo.dragType === DragConstants.BACKPACK_COSTUME) {
      props.vm.addCostume(dropInfo.payload.body, {
        name: dropInfo.payload.name,
      });
    } else if (dropInfo.dragType === DragConstants.BACKPACK_SOUND) {
      props.onActivateSoundsTab();
      props.vm.addSound({
        md5: dropInfo.payload.body,
        name: dropInfo.payload.name,
      });
    }
  };
  const setFileInput = (input: any) => {
    fileInput = input;
  };
  const formatCostumeDetails = (size: any, optResolution: any) => {
    // If no resolution is given, assume that the costume is an SVG
    const resolution = optResolution ? optResolution : 1;
    // Convert size to stage units by dividing by resolution
    // Round up width and height for scratch-flash compatibility
    // https://github.com/LLK/scratch-flash/blob/9fbac92ef3d09ceca0c0782f8a08deaa79e4df69/src/ui/media/MediaInfo.as#L224-L237
    return `${Math.ceil(size[0] / resolution)} x ${Math.ceil(
      size[1] / resolution
    )}`;
  };

  const {
    dispatchUpdateRestore, // eslint-disable-line no-unused-vars
    intl,
    isRtl,
    onNewLibraryBackdropClick,
    onNewLibraryCostumeClick,
    vm,
  } = props;

  if (!vm.editingTarget) {
    return null;
  }

  const isStage = vm.editingTarget.isStage;
  const targetVm = vm.editingTarget.sprite;

  const addLibraryMessage = isStage
    ? messages.addLibraryBackdropMsg
    : messages.addLibraryCostumeMsg;
  const addFileMessage = isStage
    ? messages.addFileBackdropMsg
    : messages.addFileCostumeMsg;
  const addSurpriseFunc = isStage
    ? handleSurpriseBackdrop
    : handleSurpriseCostume;
  const addLibraryFunc = isStage
    ? onNewLibraryBackdropClick
    : onNewLibraryCostumeClick;
  const addLibraryIcon = isStage
    ? addLibraryBackdropIcon
    : addLibraryCostumeIcon;

  const costumeData = targetVm.costumes
    ? targetVm.costumes.map((costume: any) => ({
        name: costume.name,
        asset: costume.asset,
        details: costume.size
          ? formatCostumeDetails(costume.size, costume.bitmapResolution)
          : null,
        dragPayload: costume,
      }))
    : [];

  return (
    <AssetPanel
      buttons={[
        {
          title: intl.formatMessage(addLibraryMessage),
          img: addLibraryIcon,
          onClick: addLibraryFunc,
        },
        {
          title: intl.formatMessage(addFileMessage),
          img: fileUploadIcon,
          onClick: handleFileUploadClick,
          fileAccept: '.svg, .png, .bmp, .jpg, .jpeg, .gif',
          fileChange: handleCostumeUpload,
          fileInput: setFileInput,
          fileMultiple: true,
        },
        {
          title: intl.formatMessage(messages.addSurpriseCostumeMsg),
          img: surpriseIcon,
          onClick: addSurpriseFunc,
        },
        {
          title: intl.formatMessage(messages.addBlankCostumeMsg),
          img: paintIcon,
          onClick: handleNewBlankCostume,
        },
        {
          title: intl.formatMessage(addLibraryMessage),
          img: searchIcon,
          onClick: addLibraryFunc,
        },
      ]}
      dragType={DragConstants.COSTUME}
      isRtl={isRtl}
      items={costumeData}
      selectedItemIndex={selectedCostumeIndex}
      onDeleteClick={
        target && target.costumes && target.costumes.length > 1
          ? handleDeleteCostume
          : null
      }
      onDrop={handleDrop}
      onDuplicateClick={handleDuplicateCostume}
      onExportClick={handleExportCostume}
      onItemClick={handleSelectCostume}
    >
      {target.costumes ? (
        <PaintEditorWrapper selectedCostumeIndex={selectedCostumeIndex} />
      ) : null}
    </AssetPanel>
  );
};

interface PropsInterface {
  dispatchUpdateRestore: any;
  editingTarget: string;
  intl: any;
  isRtl: boolean;
  onActivateSoundsTab: any;
  onCloseImporting: any;
  onNewLibraryBackdropClick: any;
  onNewLibraryCostumeClick: any;
  onShowImporting: any;
  sprites: any;
  stage: any;
  vm: any;
}

// TODO
// interface PropsInterface {
//     dispatchUpdateRestore: any,
//     editingTarget: string,
//     intl: intlShape,
//     isRtl: boolean,
//     onActivateSoundsTab: any,
//     onCloseImporting: any,
//     onNewLibraryBackdropClick: any,
//     onNewLibraryCostumeClick: any,
//     onShowImporting: any
// sprites: PropTypes.shape({
//     id: PropTypes.shape({
//         costumes: PropTypes.arrayOf(PropTypes.shape({
//             url: PropTypes.string,
//             name: PropTypes.string.isRequired,
//             skinId: PropTypes.number
//         }))
//     })
// }),
// stage: PropTypes.shape({
//     sounds: PropTypes.arrayOf(PropTypes.shape({
//         name: PropTypes.string.isRequired
//     }))
// }),
//     vm: any
// };

const mapStateToProps = (state: any) => ({
  editingTarget: state.scratchGui.targets.editingTarget,
  isRtl: state.locales.isRtl,
  sprites: state.scratchGui.targets.sprites,
  stage: state.scratchGui.targets.stage,
  dragging: state.scratchGui.assetDrag.dragging,
});

const mapDispatchToProps = (dispatch: any) => ({
  onActivateSoundsTab: () => dispatch(activateTab(SOUNDS_TAB_INDEX)),
  onNewLibraryBackdropClick: (e: any) => {
    e.preventDefault();
    dispatch(openBackdropLibrary());
  },
  onNewLibraryCostumeClick: (e: any) => {
    e.preventDefault();
    dispatch(openCostumeLibrary());
  },
  dispatchUpdateRestore: (restoreState: any) => {
    dispatch(setRestore(restoreState));
  },
  onCloseImporting: () => dispatch(closeAlertWithId('importingAsset')),
  onShowImporting: () => dispatch(showStandardAlert('importingAsset')),
});

export default errorBoundaryHOC('Costume Tab')(
  injectIntl(connect(mapStateToProps, mapDispatchToProps)(CostumeTab))
);
