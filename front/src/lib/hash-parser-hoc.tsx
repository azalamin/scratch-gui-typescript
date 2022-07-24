import bindAll from 'lodash.bindall';
import React from 'react';
import { connect } from 'react-redux';

import {
  defaultProjectId,
  getIsFetchingWithoutId,
  setProjectId,
} from '../reducers/project-state';

/* Higher Order Component to get the project id from location.hash
 * @param {React.Component} WrappedComponent: component to render
 * @returns {React.Component} component with hash parsing behavior
 */
const HashParserHOC = function (WrappedComponent: any) {
  class HashParserComponent extends React.Component<PropsInterface> {
    constructor(props: PropsInterface) {
      super(props);
      bindAll(this, ['handleHashChange']);
    }
    componentDidMount() {
      window.addEventListener('hashchange', this.handleHashChange);
      this.handleHashChange();
    }
    componentDidUpdate(prevProps: PropsInterface) {
      // if we are newly fetching a non-hash project...
      if (this.props.isFetchingWithoutId && !prevProps.isFetchingWithoutId) {
        // eslint-disable-next-line no-restricted-globals
        history.pushState(
          'new-project',
          'new-project',
          window.location.pathname + window.location.search
        );
      }
    }
    componentWillUnmount() {
      window.removeEventListener('hashchange', this.handleHashChange);
    }
    handleHashChange() {
      const hashMatch = window.location.hash.match(/#(\d+)/);
      const hashProjectId =
        hashMatch === null ? defaultProjectId : hashMatch[1];
      this.props.setProjectId(hashProjectId.toString());
    }
    render() {
      const {
        /* eslint-disable no-unused-vars */
        isFetchingWithoutId: isFetchingWithoutIdProp,
        reduxProjectId,
        setProjectId: setProjectIdProp,
        /* eslint-enable no-unused-vars */
        ...componentProps
      } = this.props;
      return <WrappedComponent {...componentProps} />;
    }
  }
  interface PropsInterface {
    isFetchingWithoutId: boolean;
    reduxProjectId: string | number;
    setProjectId: any;
  }
  // HashParserComponent.propTypes = {
  //     isFetchingWithoutId: PropTypes.bool,
  //     reduxProjectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  //     setProjectId: PropTypes.func
  // };
  const mapStateToProps = (state: any) => {
    const loadingState = state.scratchGui.projectState.loadingState;
    return {
      isFetchingWithoutId: getIsFetchingWithoutId(loadingState),
      reduxProjectId: state.scratchGui.projectState.projectId,
    };
  };
  const mapDispatchToProps = (dispatch: any) => ({
    setProjectId: (projectId: any) => {
      dispatch(setProjectId(projectId));
    },
  });
  // Allow incoming props to override redux-provided props. Used to mock in tests.
  const mergeProps = (stateProps: any, dispatchProps: any, ownProps: any) =>
    Object.assign({}, stateProps, dispatchProps, ownProps);
  return connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
  )(HashParserComponent);
};

export { HashParserHOC as default };
