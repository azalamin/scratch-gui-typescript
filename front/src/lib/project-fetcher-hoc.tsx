import bindAll from 'lodash.bindall';
import React from 'react';
import { injectIntl, IntlShape } from 'react-intl';
import { connect } from 'react-redux';

import { activateTab, BLOCKS_TAB_INDEX } from '../reducers/editor-tab';
import { setProjectUnchanged } from '../reducers/project-changed';
import {
  getIsCreatingNew,
  getIsFetchingWithId,
  getIsLoading,
  getIsShowingProject,
  onFetchedProjectData,
  projectError,
  setProjectId,
} from '../reducers/project-state';

import log from './log';
import storage from './storage';

/* Higher Order Component to provide behavior for loading projects by id. If
 * there's no id, the default project is loaded.
 * @param {React.Component} WrappedComponent component to receive projectData prop
 * @returns {React.Component} component with project loading behavior
 */
const ProjectFetcherHOC = function (WrappedComponent: any) {
  class ProjectFetcherComponent extends React.Component<PropsInterface> {
    static defaultProps: { assetHost: any; projectHost: any };
    constructor(props: PropsInterface) {
      super(props);
      bindAll(this, ['fetchProject']);
      storage.setProjectHost(props.projectHost);
      storage.setProjectToken(props.projectToken);
      storage.setAssetHost(props.assetHost);
      storage.setTranslatorFunction(props.intl.formatMessage);
      // props.projectId might be unset, in which case we use our default;
      // or it may be set by an even higher HOC, and passed to us.
      // Either way, we now know what the initial projectId should be, so
      // set it in the redux store.
      if (
        props.projectId !== '' &&
        props.projectId !== null &&
        typeof props.projectId !== 'undefined'
      ) {
        this.props.setProjectId(props.projectId.toString());
      }
    }
    componentDidUpdate(prevProps: PropsInterface) {
      if (prevProps.projectHost !== this.props.projectHost) {
        storage.setProjectHost(this.props.projectHost);
      }
      if (prevProps.projectToken !== this.props.projectToken) {
        storage.setProjectToken(this.props.projectToken);
      }
      if (prevProps.assetHost !== this.props.assetHost) {
        storage.setAssetHost(this.props.assetHost);
      }
      if (this.props.isFetchingWithId && !prevProps.isFetchingWithId) {
        this.fetchProject(this.props.reduxProjectId, this.props.loadingState);
      }
      if (this.props.isShowingProject && !prevProps.isShowingProject) {
        this.props.onProjectUnchanged();
      }
      if (
        this.props.isShowingProject &&
        (prevProps.isLoadingProject || prevProps.isCreatingNew)
      ) {
        this.props.onActivateTab(BLOCKS_TAB_INDEX);
      }
    }

    fetchProject(projectId: any, loadingState: any) {
      return storage
        .load(storage.AssetType.Project, projectId, storage.DataFormat.JSON)
        .then((projectAsset: any) => {
          // console.log(projectAsset)
          if (projectAsset) {
            this.props.onFetchedProjectData(projectAsset.data, loadingState);
          } else {
            // Treat failure to load as an error
            // Throw to be caught by catch later on
            throw new Error('Could not find project');
          }
        })
        .catch((err: any) => {
          this.props.onError(err);
          log.error(err);
        });
    }

    render() {
      const {
        /* eslint-disable no-unused-vars */
        assetHost,
        intl,
        isLoadingProject: isLoadingProjectProp,
        loadingState,
        onActivateTab,
        onError: onErrorProp,
        onFetchedProjectData: onFetchedProjectDataProp,
        onProjectUnchanged,
        projectHost,
        projectId,
        reduxProjectId,
        setProjectId: setProjectIdProp,
        /* eslint-enable no-unused-vars */
        isFetchingWithId: isFetchingWithIdProp,
        ...componentProps
      } = this.props;
      return (
        <WrappedComponent
          fetchingProject={isFetchingWithIdProp}
          {...componentProps}
        />
      );
    }
  }

  interface PropsInterface {
    assetHost: string;
    canSave: boolean;
    intl: IntlShape;
    isCreatingNew: boolean;
    isFetchingWithId: boolean;
    isLoadingProject: boolean;
    isShowingProject: boolean;
    loadingState: any;
    onActivateTab: any;
    onError: any;
    onFetchedProjectData: any;
    onProjectUnchanged: any;
    projectHost: string;
    projectToken: string;
    projectId: string | number;
    reduxProjectId: string | number;
    setProjectId: any;
  }

  //   ProjectFetcherComponent.propTypes = {
  //     assetHost: PropTypes.string,
  //     canSave: PropTypes.bool,
  //     intl: intlShape.isRequired,
  //     isCreatingNew: PropTypes.bool,
  //     isFetchingWithId: PropTypes.bool,
  //     isLoadingProject: PropTypes.bool,
  //     isShowingProject: PropTypes.bool,
  //     loadingState: PropTypes.oneOf(LoadingStates),
  //     onActivateTab: PropTypes.func,
  //     onError: PropTypes.func,
  //     onFetchedProjectData: PropTypes.func,
  //     onProjectUnchanged: PropTypes.func,
  //     projectHost: PropTypes.string,
  //     projectToken: PropTypes.string,
  //     projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  //     reduxProjectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  //     setProjectId: PropTypes.func,
  //   };

  ProjectFetcherComponent.defaultProps = {
    assetHost: 'https://assets.scratch.mit.edu',
    projectHost: 'https://projects.scratch.mit.edu',
  };

  const mapStateToProps = (state: any) => ({
    isCreatingNew: getIsCreatingNew(state.scratchGui.projectState.loadingState),
    isFetchingWithId: getIsFetchingWithId(
      state.scratchGui.projectState.loadingState
    ),
    isLoadingProject: getIsLoading(state.scratchGui.projectState.loadingState),
    isShowingProject: getIsShowingProject(
      state.scratchGui.projectState.loadingState
    ),
    loadingState: state.scratchGui.projectState.loadingState,
    reduxProjectId: state.scratchGui.projectState.projectId,
  });
  const mapDispatchToProps = (dispatch: any) => ({
    onActivateTab: (tab: any) => dispatch(activateTab(tab)),
    onError: (error: any) => dispatch(projectError(error)),
    onFetchedProjectData: (projectData: any, loadingState: any) =>
      dispatch(onFetchedProjectData(projectData, loadingState)),
    setProjectId: (projectId: any) => dispatch(setProjectId(projectId)),
    onProjectUnchanged: () => dispatch(setProjectUnchanged()),
  });
  // Allow incoming props to override redux-provided props. Used to mock in tests.
  const mergeProps = (stateProps: any, dispatchProps: any, ownProps: any) =>
    Object.assign({}, stateProps, dispatchProps, ownProps);
  return injectIntl(
    connect(
      mapStateToProps,
      mapDispatchToProps,
      mergeProps
    )(ProjectFetcherComponent)
  );
};

export { ProjectFetcherHOC as default };
