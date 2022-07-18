import { Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Alert from '@mui/material/Alert';
import { REMOVE_ALERT } from '../../utils/consts';
import { RootState } from '../../store';
import { AlertPayload } from '../../reducers/alert';

const Alerts = () => {
	const alerts = useSelector<RootState, AlertPayload[]>(state => state.alert);
	const dispatch = useDispatch();

	return (
		<div>
			<Fragment>
				{alerts &&
					alerts.length > 0 &&
					alerts.map(alert => (
						<Alert
							className='fade error-alert slide-in-top'
							onClose={() =>
								dispatch({
									type: REMOVE_ALERT,
									payload: alert.alertId,
								})
							}
							severity={alert.alertType ?? 'info'}
							key={alert.alertId}
							style={{ zIndex: 99 }}
						>
							{alert.msg}
						</Alert>
					))}
			</Fragment>
		</div>
	);
};

export default Alerts;
