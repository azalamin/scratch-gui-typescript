import { createStore, applyMiddleware, Store, Dispatch } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import rootReducer from './reducers';

const initialState = {};

const middleware = [thunk];

interface Action {
	type: string;
	payload: any;
}

const store: Store<
	{
		alert: any[];
		register: any;
	},
	any
> & {
	dispatch: Dispatch<Action>;
} = createStore(
	rootReducer,
	initialState,
	composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
export type RootState = ReturnType<typeof store.getState>;
