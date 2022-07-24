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
    navigator: any;
  }

  interface Document {
    fonts: any;
    documentElement: any;
  }
  interface Navigator {
    userLanguage: any;
    msSaveOrOpenBlob: any;
  }
  interface HTMLElement {
    webkitRequestFullScreen: any;
    mozRequestFullScreen: any;
  }
}
