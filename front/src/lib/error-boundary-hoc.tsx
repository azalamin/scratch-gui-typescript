import React from 'react';
import ErrorBoundary from '../containers/error-boundary';

/*
 * Higher Order Component to provide error boundary for wrapped component.
 * A curried function, call like errorHOC(<tracking label>)(<Component>).
 * @param {string} action - Label for GA tracking of errors.
 * @returns {function} a function that accepts a component to wrap.
 */
const ErrorBoundaryHOC = function (action: any) {
  /**
   * The function to be called with a React component to wrap it.
   * @param {React.Component} WrappedComponent - Component to wrap with an error boundary.
   * @returns {React.Component} the component wrapped with an error boundary.
   */
  return function (WrappedComponent: any): any {
    const ErrorBoundaryWrapper = (props: any) => (
      <ErrorBoundary action={action}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
    return ErrorBoundaryWrapper;
  };
};

export default ErrorBoundaryHOC;
