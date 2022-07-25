import { useEffect } from 'react';
import { injectIntl } from 'react-intl';
import ReactModal from 'react-modal';
import { connect } from 'react-redux';
import { compose } from 'redux';

import ErrorBoundaryHOC from '../lib/error-boundary-hoc';
import {
  activateTab,
  BLOCKS_TAB_INDEX,
  COSTUMES_TAB_INDEX,
  SOUNDS_TAB_INDEX,
} from '../reducers/editor-tab';
import { getIsError, getIsShowingProject } from '../reducers/project-state';

import {
  closeBackdropLibrary,
  closeCostumeLibrary,
  closeTelemetryModal,
  openExtensionLibrary,
} from '../reducers/modals';

import cloudManagerHOC from '../lib/cloud-manager-hoc';
import FontLoaderHOC from '../lib/font-loader-hoc';
import LocalizationHOC from '../lib/localization-hoc';
import ProjectFetcherHOC from '../lib/project-fetcher-hoc';
import ProjectSaverHOC from '../lib/project-saver-hoc';
import QueryParserHOC from '../lib/query-parser-hoc';
import SBFileUploaderHOC from '../lib/sb-file-uploader-hoc';
import storage from '../lib/storage';
import TitledHOC from '../lib/titled-hoc';
import vmListenerHOC from '../lib/vm-listener-hoc';
import vmManagerHOC from '../lib/vm-manager-hoc';

import GUIComponent from '../components/gui/gui';
import { setIsScratchDesktop } from '../lib/isScratchDesktop';

const GUI = (props: PropsInterface) => {
  useEffect(() => {
    setIsScratchDesktop(props.isScratchDesktop);
    props.onStorageInit(storage);
    props.onVmInit(props.vm);

    return () => {};
  }, [props]);

  if (props.isError) {
    throw new Error(
      `Error in Scratch GUI [location=${window.location}]: ${props.error}`
    );
  }

  const {
    /* eslint-disable no-unused-vars */
    assetHost,
    cloudHost,
    error,
    isError,
    isScratchDesktop,
    isShowingProject,
    onProjectLoaded,
    onStorageInit,
    onUpdateProjectId,
    onVmInit,
    projectHost,
    projectId,
    /* eslint-enable no-unused-vars */
    children,
    fetchingProject,
    isLoading,
    loadingStateVisible,
    ...componentProps
  } = props;

  return (
    <GUIComponent
      loading={fetchingProject || isLoading || loadingStateVisible}
      {...componentProps}
    >
      {children}
    </GUIComponent>
  );
};

interface PropsInterface {
  assetHost: string;
  children: JSX.Element;
  cloudHost: string;
  error: object | string;
  fetchingProject: boolean;
  intl: any; // todo
  isError: boolean;
  isLoading: boolean;
  isScratchDesktop: boolean;
  isShowingProject: boolean;
  loadingStateVisible: boolean;
  onProjectLoaded: any;
  onSeeCommunity: any;
  onStorageInit: any;
  onUpdateProjectId: any;
  onVmInit: any;
  projectHost: string;
  projectId: string | number;
  telemetryModalVisible: boolean;
  vm: any;
}

GUI.defaultProps = {
  isScratchDesktop: false,
  onStorageInit: (storageInstance: any) =>
    storageInstance.addOfficialScratchWebStores(),
  onProjectLoaded: () => {},
  onUpdateProjectId: () => {},
  onVmInit: (/* vm */) => {},
};

const mapStateToProps = (state: any) => {
  const loadingState = state.scratchGui.projectState.loadingState;
  return {
    activeTabIndex: state.scratchGui.editorTab.activeTabIndex,
    alertsVisible: state.scratchGui.alerts.visible,
    backdropLibraryVisible: state.scratchGui.modals.backdropLibrary,
    blocksTabVisible:
      state.scratchGui.editorTab.activeTabIndex === BLOCKS_TAB_INDEX,
    cardsVisible: state.scratchGui.cards.visible,
    connectionModalVisible: state.scratchGui.modals.connectionModal,
    costumeLibraryVisible: state.scratchGui.modals.costumeLibrary,
    costumesTabVisible:
      state.scratchGui.editorTab.activeTabIndex === COSTUMES_TAB_INDEX,
    error: state.scratchGui.projectState.error,
    isError: getIsError(loadingState),
    isFullScreen: state.scratchGui.mode.isFullScreen,
    isPlayerOnly: state.scratchGui.mode.isPlayerOnly,
    isRtl: state.locales.isRtl,
    isShowingProject: getIsShowingProject(loadingState),
    loadingStateVisible: state.scratchGui.modals.loadingProject,
    projectId: state.scratchGui.projectState.projectId,
    soundsTabVisible:
      state.scratchGui.editorTab.activeTabIndex === SOUNDS_TAB_INDEX,
    targetIsStage:
      state.scratchGui.targets.stage &&
      state.scratchGui.targets.stage.id ===
        state.scratchGui.targets.editingTarget,
    telemetryModalVisible: state.scratchGui.modals.telemetryModal,
    tipsLibraryVisible: state.scratchGui.modals.tipsLibrary,
    vm: state.scratchGui.vm,
  };
};

const mapDispatchToProps = (dispatch: any) => ({
  onExtensionButtonClick: () => dispatch(openExtensionLibrary()),
  onActivateTab: (tab: any) => dispatch(activateTab(tab)),
  onActivateCostumesTab: () => dispatch(activateTab(COSTUMES_TAB_INDEX)),
  onActivateSoundsTab: () => dispatch(activateTab(SOUNDS_TAB_INDEX)),
  onRequestCloseBackdropLibrary: () => dispatch(closeBackdropLibrary()),
  onRequestCloseCostumeLibrary: () => dispatch(closeCostumeLibrary()),
  onRequestCloseTelemetryModal: () => dispatch(closeTelemetryModal()),
});

const ConnectedGUI = injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(GUI)
);

// note that redux's 'compose' function is just being used as a general utility to make
// the hierarchy of HOC constructor calls clearer here; it has nothing to do with redux's
// ability to compose reducers.
const WrappedGui: any = compose(
  LocalizationHOC,
  ErrorBoundaryHOC('Top Level App'),
  FontLoaderHOC,
  QueryParserHOC,
  ProjectFetcherHOC,
  TitledHOC,
  ProjectSaverHOC,
  vmListenerHOC,
  vmManagerHOC,
  SBFileUploaderHOC,
  cloudManagerHOC
)(ConnectedGUI);

WrappedGui.setAppElement = ReactModal.setAppElement;
export default WrappedGui;
