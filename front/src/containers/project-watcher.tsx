import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import {connect} from 'react-redux';

import {
    getIsShowingWithId
} from '../reducers/project-state';

/**
 * Watches for project to finish updating before taking some action.
 *
 * To use ProjectWatcher, pass it a callback function using the onDoneUpdating prop.
 * ProjectWatcher passes a waitForUpdate function to its children, which they can call
 * to set ProjectWatcher to request that it call the onDoneUpdating callback when
 * project is no longer updating.
 */

const ProjectWatcher = () => {
    const [waiting, setWaiting] = useState(false);
    useEffect(() => {
      fulfill();
    }, [waiting, props.isShowingWithId]);

    const fulfill = () => {
         props.onDoneUpdating();
         setWaiting(false)
    }
    const waitForUpdate = (isUpdating) => {
        if (isUpdating) {
             setWaiting(true)
        } else { // fulfill immediately
             fulfill();
        }
    }

    return  props.children(
             waitForUpdate
        );
};

ProjectWatcher.propTypes = {
    children: PropTypes.func,
    isShowingWithId: PropTypes.bool,
    onDoneUpdating: PropTypes.func
};

ProjectWatcher.defaultProps = {
    onDoneUpdating: () => {}
};

const mapStateToProps = state => {
    const loadingState = state.scratchGui.projectState.loadingState;
    return {
        isShowingWithId: getIsShowingWithId(loadingState)
    };
};

const mapDispatchToProps = () => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ProjectWatcher);
