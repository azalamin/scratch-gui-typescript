import bindAll from 'lodash.bindall';
import React from 'react';
import PropTypes from 'prop-types';
import {injectIntl, intlShape} from 'react-intl';

import {connect} from 'react-redux';
import {moveMonitorRect} from '../reducers/monitor-layout';

import errorBoundaryHOC from '../lib/error-boundary-hoc.jsx';
import OpcodeLabels from '../lib/opcode-labels';

import MonitorListComponent from '../components/monitor-list/monitor-list.jsx';

const MonitorList = (props) => {
    OpcodeLabels.setTranslatorFunction(props.intl.formatMessage);

    const handleMonitorChange = (id, x, y) => { // eslint-disable-line no-unused-vars
        props.moveMonitorRect(id, x, y);
    }

    return (
        <MonitorListComponent
            onMonitorChange={handleMonitorChange}
            {...props}
        />
    );
};

MonitorList.propTypes = {
    intl: intlShape.isRequired,
    moveMonitorRect: PropTypes.func.isRequired
};
const mapStateToProps = state => ({
    monitors: state.scratchGui.monitors
});
const mapDispatchToProps = dispatch => ({
    moveMonitorRect: (id, x, y) => dispatch(moveMonitorRect(id, x, y))
});

export default errorBoundaryHOC('Monitors')(
    injectIntl(connect(
        mapStateToProps,
        mapDispatchToProps
    )(MonitorList))
);
