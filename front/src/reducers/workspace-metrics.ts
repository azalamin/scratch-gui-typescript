const UPDATE_METRICS = 'scratch-gui/workspace-metrics/UPDATE_METRICS';

const initialState: any = {
  targets: {},
};

const reducer = function (state: any, action: any) {
  if (typeof state === 'undefined') state = initialState;

  switch (action.type) {
    case UPDATE_METRICS:
      return Object.assign({}, state, {
        targets: Object.assign({}, state.targets, {
          [action.targetID]: {
            scrollX: action.scrollX,
            scrollY: action.scrollY,
            scale: action.scale,
          },
        }),
      });
    default:
      return state;
  }
};

const updateMetrics = function (metrics: any) {
  return {
    type: UPDATE_METRICS,
    ...metrics,
  };
};

export {
  reducer as default,
  initialState as workspaceMetricsInitialState,
  updateMetrics,
};
