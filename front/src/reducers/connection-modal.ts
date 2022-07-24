const SET_ID = 'scratch-gui/connection-modal/setId';

const initialState: any = {
  extensionId: null,
};

const reducer = function (state: any, action: any) {
  if (typeof state === 'undefined') state = initialState;
  switch (action.type) {
    case SET_ID:
      return Object.assign({}, state, {
        extensionId: action.extensionId,
      });
    default:
      return state;
  }
};

const setConnectionModalExtensionId = function (extensionId: any) {
  return {
    type: SET_ID,
    extensionId: extensionId,
  };
};

export {
  reducer as default,
  initialState as connectionModalInitialState,
  setConnectionModalExtensionId,
};
