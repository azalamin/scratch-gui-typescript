import omit from 'lodash.omit';
import React from 'react';
import { connect } from 'react-redux';
import { setFontsLoaded } from '../reducers/fonts-loaded';

// This list is from scratch-render-fonts:
// https://github.com/LLK/scratch-render-fonts/blob/master/src/index.js#L4
const FONTS = [
  'Sans Serif',
  'Serif',
  'Handwriting',
  'Marker',
  'Curly',
  'Pixel',
  'Scratch',
];
/* Higher Order Component to provide behavior for loading fonts.
 * @param {React.Component} WrappedComponent component to receive fontsLoaded prop
 * @returns {React.Component} component with font loading behavior
 */
const FontLoaderHOC = function (WrappedComponent: any) {
  class FontLoaderComponent extends React.Component<PropsInterface> {
    componentDidMount() {
      if (this.props.fontsLoaded) return;

      const getFontPromises = () => {
        const fontPromises = [];
        // Browsers that support the font loader interface have an iterable document.fonts.values()
        // Firefox has a mocked out object that doesn't actually implement iterable, which is why
        // the deep safety check is necessary.
        if (
          document.fonts &&
          typeof document.fonts.values === 'function' &&
          typeof document.fonts.values()[Symbol.iterator] === 'function'
        ) {
          for (const fontFace of document.fonts.values()) {
            // Only load fonts from this list. If we load all fonts on the document, we may block on
            // loading fonts from things like chrome extensions.
            if (FONTS.indexOf(fontFace.family) !== -1) {
              fontPromises.push(fontFace.loaded);
              fontFace.load();
            }
          }
        }
        return fontPromises;
      };
      // Font promises must be gathered after the document is loaded, because on Mac Chrome, the promise
      // objects get replaced and the old ones never resolve.
      if (document.readyState === 'complete') {
        Promise.all(getFontPromises()).then(() => {
          this.props.onSetFontsLoaded();
        });
      } else {
        document.onreadystatechange = () => {
          if (document.readyState !== 'complete') return;
          document.onreadystatechange = null;
          Promise.all(getFontPromises()).then(() => {
            this.props.onSetFontsLoaded();
          });
        };
      }
    }
    render() {
      const componentProps = omit(this.props, ['onSetFontsLoaded']);
      return <WrappedComponent {...componentProps} />;
    }
  }

  interface PropsInterface {
    fontsLoaded: boolean;
    onSetFontsLoaded: any;
  }

  // FontLoaderComponent.propTypes = {
  //     fontsLoaded: PropTypes.bool.isRequired,
  //     onSetFontsLoaded: PropTypes.func.isRequired
  // };
  const mapStateToProps = (state: any) => ({
    fontsLoaded: state.scratchGui.fontsLoaded,
  });
  const mapDispatchToProps = (dispatch: any) => ({
    onSetFontsLoaded: () => dispatch(setFontsLoaded()),
  });
  return connect(mapStateToProps, mapDispatchToProps)(FontLoaderComponent);
};

export { FontLoaderHOC as default };
