import axios from 'axios';
import { defineMessages, injectIntl, IntlShape } from 'react-intl';

import decksLibraryContent from '../lib/libraries/decks/index';
import tutorialTags from '../lib/libraries/tutorial-tags';

import analytics from '../lib/analytics';
import { notScratchDesktop } from '../lib/isScratchDesktop';

import LibraryComponent from '../components/library/library';

import { connect } from 'react-redux';

import { closeTipsLibrary, openLoadingProject } from '../reducers/modals';

import { activateDeck } from '../reducers/cards';
import {
  getIsShowingWithPath,
  LoadingState,
  onFetchedProjectData,
  onLoadedProject,
} from '../reducers/project-state';

const messages: any = defineMessages({
  tipsLibraryTitle: {
    defaultMessage: 'Choose a Tutorial',
    description: 'Heading for the help/tutorials library',
    id: 'gui.tipsLibrary.tutorials',
  },
});

const TipsLibrary = (props: PropsInterface) => {
  const handleItemSelect = (item: any) => {
    analytics.event({
      category: 'library',
      action: 'Select How-to',
      label: item.id,
    });

    /*
            Support tutorials that require specific starter projects.
            If a tutorial declares "requiredProjectId", check that the URL contains
            it. If it is not, open a new page with this tutorial and project id.

            TODO remove this at first opportunity. If this is still here after HOC2018,
                 blame Eric R. Andrew is also on record saying "this is temporary".
            UPDATE well now Paul is wrapped into this as well. Sigh...
                eventually we will find a solution that doesn't involve loading a whole project
        */

    if (item.requiredProjectId && item.requiredProjectId !== props.projectId) {
      const urlParams = `/projects/${item.requiredProjectId}/editor?tutorial=${item.urlId}`;
      return window.open(window.location.origin + urlParams, '_blank');
    }

    props.onActivateDeck(item.id);

    axios
      .get(item.path, { responseType: 'arraybuffer' })
      .then(res => {
        if (res) {
          props.onProjectNewData(res.data, LoadingState.FETCHING_WITH_PATH);
          let loadingSuccess = false;
          props.vm
            .loadProject(res.data)
            .then(() => {
              loadingSuccess = true;
            })
            .catch((error: any) => {
              console.log(error);
              alert(
                props.intl.formatMessage(messages.loadError, '', '', '', '')
              ); // eslint-disable-line no-alert
            })
            .then(() => {
              props.onLoadingFinished(props.loadingState, loadingSuccess, true);
            });
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  const decksLibraryThumbnailData = Object.keys(decksLibraryContent)
    .filter(id => {
      if (notScratchDesktop()) return true; // Do not filter anything in online editor
      const deck = (decksLibraryContent as any)[id];
      // Scratch Desktop doesn't want tutorials with `requiredProjectId`
      if (deck.hasOwnProperty('requiredProjectId')) return false;
      // Scratch Desktop should not load tutorials that are _only_ videos
      if (deck.steps.filter((s: any) => s.title).length === 0) return false;
      // Allow any other tutorials
      return true;
    })

    .map(id => ({
      rawURL: (decksLibraryContent as any)[id].img,
      id: id,
      name: (decksLibraryContent as any).name,
      path: (decksLibraryContent as any)[id].path,
      featured: true,
      tags: (decksLibraryContent as any)[id].tags,
      urlId: (decksLibraryContent as any)[id].urlId,
      requiredProjectId: (decksLibraryContent as any)[id].requiredProjectId,
      hidden: (decksLibraryContent as any)[id].hidden || false,
    }));

  if (!props.visible) return null;

  return (
    <LibraryComponent
      filterable
      data={decksLibraryThumbnailData}
      id='tipsLibrary'
      tags={tutorialTags}
      title={props.intl.formatMessage(
        messages.tipsLibraryTitle,
        '',
        '',
        '',
        ''
      )}
      visible={props.visible}
      onItemSelected={handleItemSelect}
      onRequestClose={props.onRequestClose}
    />
  );
};

interface PropsInterface {
  intl: IntlShape;
  onActivateDeck: any;
  onLoadingFinished: any;
  isShowingWitPath: boolean;
  onRequestClose: any;
  onProjectNewData: any;
  onLoadingStarted: any;
  projectId: string | number;
  visible: boolean;
  loadingState: any;
  vm: any;
}

// TODO
// TipsLibrary.propTypes = {
//     intl: intlShape.isRequired,
//     onActivateDeck: PropTypes.func.isRequired,
//     onLoadingFinished: PropTypes.func,
//     isShowingWitPath: PropTypes.bool,
//     onRequestClose: PropTypes.func,
//     onLoadingStarted: PropTypes.func,
//     projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
//     visible: PropTypes.bool,
//     vm: PropTypes.shape({
//         loadProject: PropTypes.func,
//     }),
// };

const mapStateToProps = (state: any) => {
  const loadingState = state.scratchGui.projectState.loadingState;
  return {
    visible: state.scratchGui.modals.tipsLibrary,
    projectId: state.scratchGui.projectState.projectId,
    isShowingWitPath: getIsShowingWithPath(loadingState),
    loadingState: loadingState,
    vm: state.scratchGui.vm,
  };
};

const mapDispatchToProps = (dispatch: any) => ({
  onActivateDeck: (id: any) => dispatch(activateDeck(id)),
  onProjectNewData: (data: any, loadingState: any) =>
    dispatch(onFetchedProjectData(data, loadingState)),
  onLoadingFinished: (loadingState: any, canSave: any, success: any) => {
    dispatch(onLoadedProject(loadingState, canSave, success));
  },
  onLoadingStarted: () => dispatch(openLoadingProject()),
  onRequestClose: () => dispatch(closeTipsLibrary()),
});

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(TipsLibrary)
);
