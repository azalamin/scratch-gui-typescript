import { FC } from 'react';
import { connect } from 'react-redux';

import { closeAlert, filterPopupAlerts } from '../reducers/alerts';

import AlertsComponent from '../components/alerts/alerts';

const Alerts: FC<PropsInterface> = ({
  alertsList,
  className,
  onCloseAlert,
}) => (
  <AlertsComponent
    // only display standard and extension alerts here
    alertsList={filterPopupAlerts(alertsList)}
    className={className}
    onCloseAlert={onCloseAlert}
  />
);

interface PropsInterface {
  alertsList: [{}];
  className: string;
  onCloseAlert: any;
}

const mapStateToProps = (state: any) => ({
  alertsList: state.scratchGui.alerts.alertsList,
});

const mapDispatchToProps = (dispatch: any) => ({
  onCloseAlert: (index: any) => dispatch(closeAlert(index)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Alerts);
