import React from 'react';
import { connect } from 'react-redux';
import BrowserModalComponent from '../components/browser-modal/browser-modal.jsx';
import CrashMessageComponent from '../components/crash-message/crash-message.jsx';
import log from '../lib/log.js';
import { recommendedBrowser } from '../lib/supported-browser';

class ErrorBoundary extends React.Component<PropsInterface, StateInterface> {
  constructor(props: PropsInterface) {
    super(props);
    this.state = {
      hasError: false,
      errorId: null,
    };
  }

  componentDidCatch(error: any, info: any) {
    // Error object may be undefined (IE?)
    error = error || {
      stack: 'Unknown stack',
      message: 'Unknown error',
    };

    // Log errors to analytics, leaving out browsers that are not in our recommended set
    if (recommendedBrowser() && window.Sentry) {
      window.Sentry.withScope((scope: any) => {
        Object.keys(info).forEach(key => {
          scope.setExtra(key, info[key]);
        });
        scope.setExtra('action', this.props.action);
        window.Sentry.captureException(error);
      });
    }

    // Display fallback UI
    this.setState({
      hasError: true,
      errorId: window.Sentry ? window.Sentry.lastEventId() : null,
    });

    // Log error locally for debugging as well.
    log.error(
      `Unhandled Error: ${error.stack}\nComponent stack: ${info.componentStack}`
    );
  }

  handleBack() {
    window.history.back();
  }

  handleReload() {
    window.location.replace(window.location.origin + window.location.pathname);
  }

  render() {
    if (this.state.hasError) {
      if (recommendedBrowser()) {
        return (
          <CrashMessageComponent
            eventId={this.state.errorId}
            onReload={this.handleReload}
          />
        );
      }
      return (
        <BrowserModalComponent
          error
          isRtl={this.props.isRtl}
          onBack={this.handleBack}
        />
      );
    }
    return this.props.children;
  }
}

// const ErrorBoundary = (props) => {
//     const [hasError, setHasError] = useState(false);
//     const [errorId, setErrorId] = useState(null);

//     useEffect(() => {
//         try {
//             // Log errors to analytics, leaving out browsers that are not in our recommended set
//             if (recommendedBrowser() && window.Sentry) {
//                 window.Sentry.withScope(scope => {
//                     scope.setExtra('action', this.props.action);
//                     window.Sentry.captureException(error);
//                 });
//             }

//             // Display fallback UI
//             setHasError(true);
//             setErrorId(window.Sentry ? window.Sentry.lastEventId() : null);

//         } catch (error) {
//             error = error || {
//                 stack: 'Unknown stack',
//                 message: 'Unknown error'
//             };
//             // Log error locally for debugging as well.
//             log.error(`Unhandled Error: ${error.stack}`);
//         }
//     }, [window.Sentry]);

//     const handleBack = () => {
//         window.history.back();
//     }

//     const handleReload = () => {
//         window.location.replace(window.location.origin + window.location.pathname);
//     }

//    if (hasError) {
//          if (recommendedBrowser()) {
//              return (
//                  <CrashMessageComponent
//                      eventId={errorId}
//                      onReload={handleReload}
//                  />
//              );
//          }
//          return (<BrowserModalComponent
//              error
//              isRtl={props.isRtl}
//              onBack={handleBack}
//          />);
//         }
//     return props.children;
// };

interface PropsInterface {
  action: string; // Used for defining tracking action
  children: JSX.Element;
  isRtl: boolean;
}

interface StateInterface {
  hasError: boolean;
  errorId: any;
}

// TODO
// ErrorBoundary.propTypes = {
//   action: PropTypes.string.isRequired, // Used for defining tracking action
//   children: PropTypes.node,
//   isRtl: PropTypes.bool,
// };

const mapStateToProps = (state: any) => ({
  isRtl: state.locales.isRtl,
});

// no-op function to prevent dispatch prop being passed to component
const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ErrorBoundary);
