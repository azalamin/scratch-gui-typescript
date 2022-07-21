import axios from "axios";
import bindAll from "lodash.bindall";
import PropTypes from "prop-types";
import React from "react";
import { defineMessages, injectIntl, intlShape } from "react-intl";

import decksLibraryContent from "../lib/libraries/decks/index.jsx";
import tutorialTags from "../lib/libraries/tutorial-tags";

import analytics from "../lib/analytics";
import { notScratchDesktop } from "../lib/isScratchDesktop";

import LibraryComponent from "../components/library/library.jsx";

import { connect } from "react-redux";

import { closeTipsLibrary, openLoadingProject } from "../reducers/modals";

import { activateDeck } from "../reducers/cards";
import {
    getIsShowingWithPath,
    LoadingState,
    onFetchedProjectData,
    onLoadedProject,
} from "../reducers/project-state.js";

const messages = defineMessages({
    tipsLibraryTitle: {
        defaultMessage: "Choose a Tutorial",
        description: "Heading for the help/tutorials library",
        id: "gui.tipsLibrary.tutorials",
    },
});

const TipsLibrary = (props) => {

    const handleItemSelect = (item) => {
        analytics.event({
            category: "library",
            action: "Select How-to",
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

        if (
            item.requiredProjectId &&
            item.requiredProjectId !== props.projectId
        ) {
            const urlParams = `/projects/${item.requiredProjectId}/editor?tutorial=${item.urlId}`;
            return window.open(window.location.origin + urlParams, "_blank");
        }

        props.onActivateDeck(item.id);

        axios
            .get(item.path, { responseType: "arraybuffer" })
            .then((res) => {
                if (res) {
                    props.onProjectNewData(
                        res.data,
                        LoadingState.FETCHING_WITH_PATH
                    );
                    let loadingSuccess = false;
                    props.vm
                        .loadProject(res.data)
                        .then(() => {
                            loadingSuccess = true;
                        })
                        .catch((error) => {
                            console.log(error);
                            alert(
                                props.intl.formatMessage(
                                    messages.loadError
                                )
                            ); // eslint-disable-line no-alert
                        })
                        .then(() => {
                            props.onLoadingFinished(
                                props.loadingState,
                                loadingSuccess,
                                true
                            );
                        });
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const decksLibraryThumbnailData = Object.keys(decksLibraryContent)
            .filter((id) => {
                if (notScratchDesktop()) return true; // Do not filter anything in online editor
                const deck = decksLibraryContent[id];
                // Scratch Desktop doesn't want tutorials with `requiredProjectId`
                if (deck.hasOwnProperty("requiredProjectId")) return false;
                // Scratch Desktop should not load tutorials that are _only_ videos
                if (deck.steps.filter((s) => s.title).length === 0)
                    return false;
                // Allow any other tutorials
                return true;
            })

            .map((id) => ({
                rawURL: decksLibraryContent[id].img,
                id: id,
                name: decksLibraryContent[id].name,
                path: decksLibraryContent[id].path,
                featured: true,
                tags: decksLibraryContent[id].tags,
                urlId: decksLibraryContent[id].urlId,
                requiredProjectId: decksLibraryContent[id].requiredProjectId,
                hidden: decksLibraryContent[id].hidden || false,
            }));

        if (!props.visible) return null;

    return (
        <LibraryComponent
            filterable
            data={decksLibraryThumbnailData}
            id="tipsLibrary"
            tags={tutorialTags}
            title={props.intl.formatMessage(messages.tipsLibraryTitle)}
            visible={props.visible}
            onItemSelected={handleItemSelect}
            onRequestClose={props.onRequestClose}
        />
    );
};


TipsLibrary.propTypes = {
    intl: intlShape.isRequired,
    onActivateDeck: PropTypes.func.isRequired,
    onLoadingFinished: PropTypes.func,
    isShowingWitPath: PropTypes.bool,
    onRequestClose: PropTypes.func,
    onLoadingStarted: PropTypes.func,
    projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    visible: PropTypes.bool,
    vm: PropTypes.shape({
        loadProject: PropTypes.func,
    }),
};

const mapStateToProps = (state) => {
    const loadingState = state.scratchGui.projectState.loadingState;
    return {
        visible: state.scratchGui.modals.tipsLibrary,
        projectId: state.scratchGui.projectState.projectId,
        isShowingWitPath: getIsShowingWithPath(loadingState),
        loadingState: loadingState,
        vm: state.scratchGui.vm,
    };
};

const mapDispatchToProps = (dispatch) => ({
    onActivateDeck: (id) => dispatch(activateDeck(id)),
    onProjectNewData: (data, loadingState) =>
        dispatch(onFetchedProjectData(data, loadingState)),
    onLoadingFinished: (loadingState, canSave, success) => {
        dispatch(onLoadedProject(loadingState, canSave, success));
    },
    onLoadingStarted: () => dispatch(openLoadingProject()),
    onRequestClose: () => dispatch(closeTipsLibrary()),
});

export default injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(TipsLibrary)
);
