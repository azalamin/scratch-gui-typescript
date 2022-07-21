import { connect } from 'react-redux';

const MenuBarHOC = function (WrappedComponent: any) {
  const MenuBarContainer = (prop: PropsInterface) => {
    const confirmReadyToReplaceProject = (message: any) => {
      let readyToReplaceProject = true;
      if (prop.projectChanged && !prop.canCreateNew) {
        readyToReplaceProject = prop.confirmWithMessage(message);
      }
      return readyToReplaceProject;
    };
    const shouldSaveBeforeTransition = () => {
      return prop.canSave && prop.projectChanged;
    };

    const {
      /* eslint-disable no-unused-vars */
      projectChanged,
      /* eslint-enable no-unused-vars */
      ...props
    } = prop;

    return (
      <WrappedComponent
        confirmReadyToReplaceProject={confirmReadyToReplaceProject}
        shouldSaveBeforeTransition={shouldSaveBeforeTransition}
        {...props}
      />
    );
  };

  interface PropsInterface {
    canCreateNew: boolean;
    canSave: boolean;
    confirmWithMessage: any;
    projectChanged: boolean;
  }

  MenuBarContainer.defaultProps = {
    // default to using standard js confirm
    confirmWithMessage: (message: any) => confirm(message), // eslint-disable-line no-alert
  };

  const mapStateToProps = (state: any) => ({
    projectChanged: state.scratchGui.projectChanged,
  });
  const mapDispatchToProps = () => ({});
  // Allow incoming props to override redux-provided props. Used to mock in tests.
  const mergeProps = (stateProps: any, dispatchProps: any, ownProps: any) =>
    Object.assign({}, stateProps, dispatchProps, ownProps);
  return connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
  )(MenuBarContainer);
};

export default MenuBarHOC;
