import { injectIntl, IntlShape } from 'react-intl';

import { connect } from 'react-redux';
import { moveMonitorRect } from '../reducers/monitor-layout';

import errorBoundaryHOC from '../lib/error-boundary-hoc.jsx';
import OpcodeLabels from '../lib/opcode-labels';

import MonitorListComponent from '../components/monitor-list/monitor-list.jsx';

const MonitorList = (props: PropsInterface) => {
  OpcodeLabels.setTranslatorFunction(props.intl.formatMessage);

  const handleMonitorChange = (id: any, x: any, y: any) => {
    // eslint-disable-line no-unused-vars
    props.moveMonitorRect(id, x, y);
  };

  return (
    <MonitorListComponent onMonitorChange={handleMonitorChange} {...props} />
  );
};

interface PropsInterface {
  intl: IntlShape;
  moveMonitorRect: any;
}

// TODO
// MonitorList.propTypes = {
//     intl: intlShape.isRequired,
//     moveMonitorRect: PropTypes.func.isRequired
// };

const mapStateToProps = (state: any) => ({
  monitors: state.scratchGui.monitors,
});
const mapDispatchToProps = (dispatch: any) => ({
  moveMonitorRect: (id: any, x: any, y: any) =>
    dispatch(moveMonitorRect(id, x, y)),
});

export default errorBoundaryHOC('Monitors')(
  injectIntl(connect(mapStateToProps, mapDispatchToProps)(MonitorList))
);
