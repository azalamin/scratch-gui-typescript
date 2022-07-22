import { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { getIsShowingWithId } from '../reducers/project-state';

/**
 * Watches for project to finish updating before taking some action.
 *
 * To use ProjectWatcher, pass it a callback function using the onDoneUpdating prop.
 * ProjectWatcher passes a waitForUpdate function to its children, which they can call
 * to set ProjectWatcher to request that it call the onDoneUpdating callback when
 * project is no longer updating.
 */

const ProjectWatcher = (props: PropsInterface) => {
  const [waiting, setWaiting] = useState<any>(false);

  const fulfill = useCallback(() => {
    props.onDoneUpdating();
    setWaiting(false);
  }, [props]);

  const waitForUpdate = (isUpdating: any) => {
    if (isUpdating) {
      setWaiting(true);
    } else {
      // fulfill immediately
      fulfill();
    }
  };

  useEffect(() => {
    fulfill();
  }, [fulfill, waiting]);

  return props.children(waitForUpdate);
};

interface PropsInterface {
  children: any;
  isShowingWithId: boolean;
  onDoneUpdating: any;
}

// TODO
// ProjectWatcher.propTypes = {
//   children: PropTypes.func,
//   isShowingWithId: PropTypes.bool,
//   onDoneUpdating: PropTypes.func,
// };

ProjectWatcher.defaultProps = {
  onDoneUpdating: () => {},
};

const mapStateToProps = (state: any) => {
  const loadingState = state.scratchGui.projectState.loadingState;
  return {
    isShowingWithId: getIsShowingWithId(loadingState),
  };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ProjectWatcher);
