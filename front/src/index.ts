import { setAppElement } from 'react-modal';
import { ScratchPaintReducer } from 'scratch-paint';
import GUI from './containers/gui';
import AppStateHOC from './lib/app-state-hoc';
import totallyNormalStrings from './lib/l10n';
import GuiReducer, {
  guiInitialState,
  guiMiddleware,
  initEmbedded,
  initFullScreen,
  initPlayer,
} from './reducers/gui';
import LocalesReducer, {
  initLocale,
  localesInitialState,
} from './reducers/locales';
import { setFullScreen, setPlayer } from './reducers/mode';
import { remixProject } from './reducers/project-state';

const guiReducers = {
  locales: LocalesReducer,
  scratchGui: GuiReducer,
  scratchPaint: ScratchPaintReducer,
};

export {
  GUI as default,
  AppStateHOC,
  setAppElement,
  guiReducers,
  guiInitialState,
  guiMiddleware,
  initEmbedded,
  initPlayer,
  initFullScreen,
  initLocale,
  localesInitialState,
  remixProject,
  setFullScreen,
  setPlayer,
  totallyNormalStrings,
};
