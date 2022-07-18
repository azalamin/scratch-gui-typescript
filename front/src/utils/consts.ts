export const SET_ALERT = 'SET_ALERT';
export const REMOVE_ALERT = 'REMOVE_ALERT';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAIL = 'LOGIN_FAIL';
export const USER_LOADED = 'USER_LOADED';
export const LOAD_FAIL = 'LOAD_FAIL';
export const LOGOUT = 'LOGOUT';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const REGISTER_FAIL = 'REGISTER_FAIL';
export const VERIFICATION_SUCCESS = 'VERIFICATION_SUCCESS';
export const VERIFICATION_FAIL = 'VERIFICATION_FAIL';

export const TOKEN_KEY = 'token';
export const ALERT_CLEAR_TIME = 4000;
export enum ALERT_TYPE {
	DANGER = 'error',
	SUCCESS = 'success',
}

export interface Action {
	type: string;
	payload: any;
}
