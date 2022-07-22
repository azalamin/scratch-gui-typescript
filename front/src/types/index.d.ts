export {};

declare global {
  interface Window {
    Sentry: any;
  }
  interface IntrinsicAttributes extends React.Attributes {}
}
