import makeToolboxXML from '../lib/make-toolbox-xml';
const UPDATE_TOOLBOX = 'scratch-gui/toolbox/UPDATE_TOOLBOX';

const initialState: any = {
  toolboxXML: makeToolboxXML(true),
};

const reducer = function (state: any, action: any) {
  if (typeof state === 'undefined') state = initialState;
  switch (action.type) {
    case UPDATE_TOOLBOX:
      return Object.assign({}, state, {
        toolboxXML: action.toolboxXML,
      });
    default:
      return state;
  }
};

const updateToolbox = function (toolboxXML: any) {
  return {
    type: UPDATE_TOOLBOX,
    toolboxXML: toolboxXML,
  };
};

export {
  reducer as default,
  initialState as toolboxInitialState,
  updateToolbox,
};
