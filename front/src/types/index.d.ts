export {};

declare global {
  interface Window {
    Sentry: any;
    Wistia: any;
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
    webkitAudioContext: any;
  }

  interface Document {
    fonts: any;
  }
}
