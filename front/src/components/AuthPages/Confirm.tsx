import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verify } from '../../actions/register';
import { Loading } from '../elements/Loading';
import '../styles/main.css';
import { Dispatch } from 'redux';
import { RootState } from '../../store';
import { ROUTES } from '../../utils/routing/routes';

const Confirm = () => {
	const { token } = useParams<{ token: string }>();
	const dispatch: Dispatch<any> = useDispatch();

	const isAuthenticated = useSelector<RootState, boolean>(
		state => state.register.isAuthenticated
	);
	const verified = useSelector<RootState, boolean>(
		state => state.register.verified
	);

	useEffect(() => {
		if (token) dispatch(verify(token));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token]);

	if (isAuthenticated === true || verified == null) return <Loading />;

	return (
		<div>
			{verified ? (
				<Navigate to={ROUTES.LOGIN} />
			) : (
				InavlidToken('Invalid Token')
			)}
		</div>
	);
};
const InavlidToken: React.FC<string> = (text: string) => <div>{text}</div>;

export default Confirm;
