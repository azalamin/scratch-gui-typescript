export {};

declare global {
  interface Window {
    Sentry: any;
    Wistia: any;
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
    webkitAudioContext: any;
    webkitOfflineAudioContext: any;
    GA_ID: any;
    ga: any;
  }

  interface Document {
    fonts: any;
  }
}
