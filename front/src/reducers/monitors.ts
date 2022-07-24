import { OrderedMap } from 'immutable';
const UPDATE_MONITORS = 'scratch-gui/monitors/UPDATE_MONITORS';

const initialState = OrderedMap();

const reducer = function (state: any, action: any) {
  if (typeof state === 'undefined') state = initialState;
  switch (action.type) {
    case UPDATE_MONITORS:
      return action.monitors;
    default:
      return state;
  }
};

const updateMonitors = function (monitors: any) {
  return {
    type: UPDATE_MONITORS,
    monitors: monitors,
    meta: {
      throttle: 30,
    },
  };
};

export {
  reducer as default,
  initialState as monitorsInitialState,
  updateMonitors,
};
