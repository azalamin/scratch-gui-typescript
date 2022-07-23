import { useEffect, useRef, useState } from 'react';
import { defineMessages, injectIntl, IntlShape } from 'react-intl';

import fileUploadIcon from '../components/action-menu/icon--file-upload.svg';
import searchIcon from '../components/action-menu/icon--search.svg';
import surpriseIcon from '../components/action-menu/icon--surprise.svg';
import AssetPanel from '../components/asset-panel/asset-panel.jsx';
import addSoundFromLibraryIcon from '../components/asset-panel/icon--add-sound-lib.svg';
import addSoundFromRecordingIcon from '../components/asset-panel/icon--add-sound-record.svg';
import soundIconRtl from '../components/asset-panel/icon--sound-rtl.svg';
import soundIcon from '../components/asset-panel/icon--sound.svg';

import RecordModal from './record-modal.js';
import SoundEditor from './sound-editor.js';
import SoundLibrary from './sound-library.js';

import downloadBlob from '../lib/download-blob';
import DragConstants from '../lib/drag-constants';
import errorBoundaryHOC from '../lib/error-boundary-hoc.jsx';
import { handleFileUpload, soundUpload } from '../lib/file-uploader.js';
import soundLibraryContent from '../lib/libraries/sounds.json';

import { connect } from 'react-redux';

import {
  closeSoundLibrary,
  openSoundLibrary,
  openSoundRecorder,
} from '../reducers/modals';

import { activateTab, COSTUMES_TAB_INDEX } from '../reducers/editor-tab';

import { closeAlertWithId, showStandardAlert } from '../reducers/alerts';
import { setRestore } from '../reducers/restore-deletion';

const SoundTab = (props: PropsInterface) => {
  let fileInput: any = useRef();
  const [selectedSoundIndex, setSelectedSoundIndex] = useState<any>(0);
  const [editingTargetState, setEditingTargetState] = useState<any>(null);

  useEffect(() => {
    const target =
      props.editingTarget && props.sprites[props.editingTarget]
        ? props.sprites[props.editingTarget]
        : props.stage;
    if (!target || !target.sounds) {
      return;
    }

    // If switching editing targets, reset the sound index
    if (editingTargetState !== props.editingTarget) {
      setSelectedSoundIndex(0);
      setEditingTargetState(props.editingTarget);
    } else if (selectedSoundIndex > target.sounds.length - 1) {
      setSelectedSoundIndex(Math.max(target.sounds.length - 1, 0));
    }
  }, [
    editingTargetState,
    props.editingTarget,
    props.sprites,
    props.stage,
    selectedSoundIndex,
  ]);

  const handleSelectSound = (soundIndex: any) => {
    setSelectedSoundIndex(soundIndex);
  };

  const handleDeleteSound = (soundIndex: any) => {
    console.log(soundIndex);
    const restoreFun = props.vm.deleteSound(soundIndex);
    if (soundIndex >= selectedSoundIndex) {
      setSelectedSoundIndex(Math.max(0, soundIndex - 1));
    }
    props.dispatchUpdateRestore({ restoreFun, deletedItem: 'Sound' });
  };

  const handleExportSound = (soundIndex: any) => {
    const item = props.vm.editingTarget.sprite.sounds[soundIndex];
    const blob = new Blob([item.asset.data], {
      type: item.asset.assetType.contentType,
    });
    downloadBlob(`${item.name}.${item.asset.dataFormat}`, blob);
  };

  const handleDuplicateSound = (soundIndex: any) => {
    props.vm.duplicateSound(soundIndex).then(() => {
      setSelectedSoundIndex(soundIndex + 1);
    });
  };

  const handleNewSound = () => {
    if (props.vm.editingTarget) {
      return null;
    }
    const sprite = props.vm.editingTarget.sprite;
    const sounds = sprite.sounds ? sprite.sounds : [];
    setSelectedSoundIndex(Math.max(sounds.length - 1, 0));
  };

  const handleSurpriseSound = () => {
    const soundItem =
      soundLibraryContent[
        Math.floor(Math.random() * soundLibraryContent.length)
      ];
    const vmSound = {
      format: soundItem.dataFormat,
      md5: soundItem.md5ext,
      rate: soundItem.rate,
      sampleCount: soundItem.sampleCount,
      name: soundItem.name,
    };
    props.vm.addSound(vmSound).then(() => {
      handleNewSound();
    });
  };

  const handleFileUploadClick = () => {
    fileInput.click();
  };

  const handleSoundUpload = (e: any) => {
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
        soundUpload(
          buffer,
          fileType,
          storage,
          (newSound: any) => {
            newSound.name = fileName;
            props.vm.addSound(newSound, targetId).then(() => {
              handleNewSound();
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

  const handleDrop = (dropInfo: any) => {
    if (dropInfo.dragType === DragConstants.SOUND) {
      const sprite = props.vm.editingTarget.sprite;
      const activeSound = sprite.sounds[selectedSoundIndex];

      props.vm.reorderSound(
        props.vm.editingTarget.id,
        dropInfo.index,
        dropInfo.newIndex
      );

      selectedSoundIndex(sprite.sounds.indexOf(activeSound));
    } else if (dropInfo.dragType === DragConstants.BACKPACK_COSTUME) {
      props.onActivateCostumesTab();
      props.vm.addCostume(dropInfo.payload.body, {
        name: dropInfo.payload.name,
      });
    } else if (dropInfo.dragType === DragConstants.BACKPACK_SOUND) {
      props.vm
        .addSound({
          md5: dropInfo.payload.body,
          name: dropInfo.payload.name,
        })
        .then(handleNewSound);
    }
  };

  const setFileInput = (input: any) => {
    fileInput = input;
  };

  const {
    intl,
    isRtl,
    vm,
    onNewSoundFromLibraryClick,
    onNewSoundFromRecordingClick,
  } = props;

  if (!vm.editingTarget) {
    return null;
  }

  const sprite = vm.editingTarget.sprite;

  const sounds = sprite.sounds
    ? sprite.sounds.map((sound: any) => ({
        url: isRtl ? soundIconRtl : soundIcon,
        name: sound.name,
        details: (sound.sampleCount / sound.rate).toFixed(2),
        dragPayload: sound,
      }))
    : [];

  const messages = defineMessages({
    fileUploadSound: {
      defaultMessage: 'Upload Sound',
      description: 'Button to upload sound from file in the editor tab',
      id: 'gui.soundTab.fileUploadSound',
    },
    surpriseSound: {
      defaultMessage: 'Surprise',
      description: 'Button to get a random sound in the editor tab',
      id: 'gui.soundTab.surpriseSound',
    },
    recordSound: {
      defaultMessage: 'Record',
      description: 'Button to record a sound in the editor tab',
      id: 'gui.soundTab.recordSound',
    },
    addSound: {
      defaultMessage: 'Choose a Sound',
      description: 'Button to add a sound in the editor tab',
      id: 'gui.soundTab.addSoundFromLibrary',
    },
  });

  return (
    <AssetPanel
      buttons={[
        {
          title: intl.formatMessage(messages.addSound),
          img: addSoundFromLibraryIcon,
          onClick: onNewSoundFromLibraryClick,
        },
        {
          title: intl.formatMessage(messages.fileUploadSound),
          img: fileUploadIcon,
          onClick: handleFileUploadClick,
          fileAccept: '.wav, .mp3',
          fileChange: handleSoundUpload,
          fileInput: setFileInput,
          fileMultiple: true,
        },
        {
          title: intl.formatMessage(messages.surpriseSound),
          img: surpriseIcon,
          onClick: handleSurpriseSound,
        },
        {
          title: intl.formatMessage(messages.recordSound),
          img: addSoundFromRecordingIcon,
          onClick: onNewSoundFromRecordingClick,
        },
        {
          title: intl.formatMessage(messages.addSound),
          img: searchIcon,
          onClick: onNewSoundFromLibraryClick,
        },
      ]}
      dragType={DragConstants.SOUND}
      isRtl={isRtl}
      items={sounds}
      selectedItemIndex={selectedSoundIndex}
      onDeleteClick={handleDeleteSound}
      onDrop={handleDrop}
      onDuplicateClick={handleDuplicateSound}
      onExportClick={handleExportSound}
      onItemClick={handleSelectSound}
    >
      {sprite.sounds && sprite.sounds[selectedSoundIndex] ? (
        <SoundEditor soundIndex={selectedSoundIndex} />
      ) : null}
      {props.soundRecorderVisible ? (
        <RecordModal onNewSound={handleNewSound} />
      ) : null}
      {props.soundLibraryVisible ? (
        <SoundLibrary
          vm={props.vm}
          onNewSound={handleNewSound}
          onRequestClose={props.onRequestCloseSoundLibrary}
        />
      ) : null}
    </AssetPanel>
  );
};

interface PropsInterface {
  dispatchUpdateRestore: any;
  editingTarget: string;
  intl: IntlShape;
  isRtl: boolean;
  onActivateCostumesTab: any;
  onCloseImporting: any;
  onNewSoundFromLibraryClick: any;
  onNewSoundFromRecordingClick: any;
  onRequestCloseSoundLibrary: any;
  onShowImporting: any;
  soundLibraryVisible: boolean;
  soundRecorderVisible: boolean;
  sprites: any;
  stage: any;
  vm: any;
}

// TODO
// SoundTab.propTypes = {
//   dispatchUpdateRestore: PropTypes.func,
//   editingTarget: PropTypes.string,
//   intl: intlShape,
//   isRtl: PropTypes.bool,
//   onActivateCostumesTab: PropTypes.func.isRequired,
//   onCloseImporting: PropTypes.func.isRequired,
//   onNewSoundFromLibraryClick: PropTypes.func.isRequired,
//   onNewSoundFromRecordingClick: PropTypes.func.isRequired,
//   onRequestCloseSoundLibrary: PropTypes.func.isRequired,
//   onShowImporting: PropTypes.func.isRequired,
//   soundLibraryVisible: PropTypes.bool,
//   soundRecorderVisible: PropTypes.bool,
//   sprites: PropTypes.shape({
//     id: PropTypes.shape({
//       sounds: PropTypes.arrayOf(
//         PropTypes.shape({
//           name: PropTypes.string.isRequired,
//         })
//       ),
//     }),
//   }),
//   stage: PropTypes.shape({
//     sounds: PropTypes.arrayOf(
//       PropTypes.shape({
//         name: PropTypes.string.isRequired,
//       })
//     ),
//   }),
//   vm: PropTypes.instanceOf(VM).isRequired,
// };

const mapStateToProps = (state: any) => ({
  editingTarget: state.scratchGui.targets.editingTarget,
  isRtl: state.locales.isRtl,
  sprites: state.scratchGui.targets.sprites,
  stage: state.scratchGui.targets.stage,
  soundLibraryVisible: state.scratchGui.modals.soundLibrary,
  soundRecorderVisible: state.scratchGui.modals.soundRecorder,
});

const mapDispatchToProps = (dispatch: any) => ({
  onActivateCostumesTab: () => dispatch(activateTab(COSTUMES_TAB_INDEX)),
  onNewSoundFromLibraryClick: (e: any) => {
    e.preventDefault();
    dispatch(openSoundLibrary());
  },
  onNewSoundFromRecordingClick: () => {
    dispatch(openSoundRecorder());
  },
  onRequestCloseSoundLibrary: () => {
    dispatch(closeSoundLibrary());
  },
  dispatchUpdateRestore: (restoreState: any) => {
    dispatch(setRestore(restoreState));
  },
  onCloseImporting: () => dispatch(closeAlertWithId('importingAsset')),
  onShowImporting: () => dispatch(showStandardAlert('importingAsset')),
});

export default errorBoundaryHOC('Sound Tab')(
  injectIntl(connect(mapStateToProps, mapDispatchToProps)(SoundTab))
);
