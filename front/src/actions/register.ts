//Authentication request is done here, please refer to auth.js in reducer for handler logic

import axios from 'axios';
import { Dispatch } from 'react';
import {
	REGISTER_SUCCESS,
	REGISTER_FAIL,
	LOGIN_SUCCESS,
	LOGIN_FAIL,
	LOGOUT,
	USER_LOADED,
	LOAD_FAIL,
	VERIFICATION_SUCCESS,
	VERIFICATION_FAIL,
	ALERT_TYPE,
} from '../utils/consts';
import setAuthToken from '../utils/setAuthToken';
import { setAlert } from './alert';

interface Action {
	type?: string;
	payload?: any;
}

export const register =
	(registerData: object) => async (dispatch: Dispatch<any>) => {
		try {
			const res = await axios.post(
				'/api/auth/register',
				{ ...registerData },
				{
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);
			dispatch({
				type: REGISTER_SUCCESS,
				payload: res.data,
			});
			dispatch(loadUser());
		} catch (err: any) {
			console.log(err);
			if (!err.response.data.errors) {
				dispatch(setAlert('Server Not Running', ALERT_TYPE.DANGER));
			} else {
				dispatch(setAlert(err.response.data.errors.message, ALERT_TYPE.DANGER));
			}
			dispatch({
				type: REGISTER_FAIL,
			});
		}
	};

interface LoginProps {
	email: string;
	password: string;
}

export const login =
	({ email, password }: LoginProps) =>
	async (dispatch: Dispatch<any>) => {
		try {
			const res = await axios.post(
				'/api/auth/login',
				{ email, password },
				{
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);
			dispatch({
				type: LOGIN_SUCCESS,
				payload: res.data,
			});
			dispatch(loadUser());
		} catch (err: any) {
			if (!err.response.data.errors) {
				dispatch(setAlert('Server Not Running', ALERT_TYPE.DANGER));
			} else {
				console.log(err.response.data.errors);
				dispatch(setAlert(err.response.data.errors.message, ALERT_TYPE.DANGER));
			}
			dispatch({
				type: LOGIN_FAIL,
			});
		}
	};

export const forgot = (email: string) => async (dispatch: Dispatch<any>) => {
	const params = { email };
	try {
		await axios.post('/api/auth/forgot', params, {
			headers: {
				'content-type': 'application/json',
			},
		});
		dispatch(setAlert('Check Email to verify!', ALERT_TYPE.SUCCESS));
	} catch (err: any) {
		if (!err.response.data.errors) {
			dispatch(setAlert('Server Not Running', ALERT_TYPE.DANGER));
		} else {
			dispatch(setAlert(err.response.data.errors.message, ALERT_TYPE.DANGER));
		}
	}
};

export const loadUser = () => async (dispatch: Dispatch<any>) => {
	if (localStorage.token) {
		setAuthToken(localStorage.token);
	}
	try {
		const res = await axios.get('/api/auth/');
		dispatch({
			type: USER_LOADED,
			payload: res.data,
		});
	} catch (err: any) {
		if (!err.response.data.errors) {
			dispatch(setAlert('Server Not Running', ALERT_TYPE.DANGER));
		} else {
			if (err.response.status === 401) return;
			dispatch(setAlert(err.response.data.errors.message, ALERT_TYPE.DANGER));
		}
		dispatch({
			type: LOAD_FAIL,
		});
	}
};

export const verify = (id: string) => async (dispatch: Dispatch<Action>) => {
	try {
		const res = await axios.get(`/api/auth/confirm/${id}`);
		dispatch({
			type: VERIFICATION_SUCCESS,
			payload: res.data,
		});
	} catch (err) {
		dispatch({
			type: VERIFICATION_FAIL,
			payload: null,
		});
	}
};

export const logout = () => (dispatch: Dispatch<Action>) => {
	dispatch({ type: LOGOUT, payload: null });
};
