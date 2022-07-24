const UPDATE = 'scratch-gui/mic-indicator/UPDATE';

const initialState: any = false;

const reducer = function (state: any, action: any) {
  if (typeof state === 'undefined') state = initialState;
  switch (action.type) {
    case UPDATE:
      return action.visible;
    default:
      return state;
  }
};

const updateMicIndicator = function (visible: any) {
  return {
    type: UPDATE,
    visible: visible,
  };
};

export {
  reducer as default,
  initialState as micIndicatorInitialState,
  updateMicIndicator,
};
