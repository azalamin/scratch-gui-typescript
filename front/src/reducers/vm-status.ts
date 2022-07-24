const SET_RUNNING_STATE = 'scratch-gui/vm-status/SET_RUNNING_STATE';
const SET_TURBO_STATE = 'scratch-gui/vm-status/SET_TURBO_STATE';
const SET_STARTED_STATE = 'scratch-gui/vm-status/SET_STARTED_STATE';

const initialState: any = {
  running: false,
  started: false,
  turbo: false,
};

const reducer = function (state: any, action: any) {
  if (typeof state === 'undefined') state = initialState;
  switch (action.type) {
    case SET_STARTED_STATE:
      return Object.assign({}, state, {
        started: action.started,
      });
    case SET_RUNNING_STATE:
      return Object.assign({}, state, {
        running: action.running,
      });
    case SET_TURBO_STATE:
      return Object.assign({}, state, {
        turbo: action.turbo,
      });
    default:
      return state;
  }
};

const setStartedState = function (started: any) {
  return {
    type: SET_STARTED_STATE,
    started: started,
  };
};

const setRunningState = function (running: any) {
  return {
    type: SET_RUNNING_STATE,
    running: running,
  };
};

const setTurboState = function (turbo: any) {
  return {
    type: SET_TURBO_STATE,
    turbo: turbo,
  };
};

export {
  reducer as default,
  initialState as vmStatusInitialState,
  setRunningState,
  setStartedState,
  setTurboState,
};
