const SET_HOVERED_SPRITE = 'scratch-gui/hovered-target/SET_HOVERED_SPRITE';
const SET_RECEIVED_BLOCKS = 'scratch-gui/hovered-target/SET_RECEIVED_BLOCKS';

const initialState: any = {
  sprite: null,
  receivedBlocks: false,
};

const reducer = function (state: any, action: any) {
  if (typeof state === 'undefined') state = initialState;
  switch (action.type) {
    case SET_HOVERED_SPRITE:
      return {
        sprite: action.spriteId,
        receivedBlocks: false,
      };
    case SET_RECEIVED_BLOCKS:
      return {
        sprite: state.sprite,
        receivedBlocks: action.receivedBlocks,
      };
    default:
      return state;
  }
};

const setHoveredSprite = function (spriteId: any) {
  return {
    type: SET_HOVERED_SPRITE,
    spriteId: spriteId,
    meta: {
      throttle: 30,
    },
  };
};

const setReceivedBlocks = function (receivedBlocks: any) {
  return {
    type: SET_RECEIVED_BLOCKS,
    receivedBlocks: receivedBlocks,
  };
};

export {
  reducer as default,
  initialState as hoveredTargetInitialState,
  setHoveredSprite,
  setReceivedBlocks,
};
