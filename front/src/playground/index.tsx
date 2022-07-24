// Polyfills
import 'core-js/fn/array/includes';
import 'core-js/fn/promise/finally';
import 'es6-object-assign/auto';
import 'intl'; // For Safari 9

import ReactDOM from 'react-dom';

import BrowserModalComponent from '../components/browser-modal/browser-modal.js';
import analytics from '../lib/analytics';
import AppStateHOC from '../lib/app-state-hoc.js';
import supportedBrowser from '../lib/supported-browser';

import styles from './index.module.css';

// Register "base" page view
analytics.pageview('/');

const appTarget: any = document.createElement('div');
appTarget.className = styles.app;
document.body.appendChild(appTarget);

if (supportedBrowser()) {
  // require needed here to avoid importing unsupported browser-crashing code
  // at the top level
  require('./render-gui.jsx').default(appTarget);
} else {
  BrowserModalComponent.setAppElement(appTarget);
  const WrappedBrowserModalComponent: any = AppStateHOC(
    BrowserModalComponent,
    true /* localesOnly */
  );
  const handleBack: any = () => {};
  // eslint-disable-next-line react/jsx-no-bind
  ReactDOM.render(
    <WrappedBrowserModalComponent onBack={handleBack} />,
    appTarget
  );
}
