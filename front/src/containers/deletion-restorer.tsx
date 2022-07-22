import { connect } from 'react-redux';
import { setRestore } from '../reducers/restore-deletion';

/**
 * DeletionRestorer component passes a restoreDeletion function to its child.
 * It expects this child to be a function with the signature
 *     function (restoreDeletion, props) {}
 * The component can then be used to attach deletion restoring functionality
 * to any other component:
 *
 * <DeletionRestorer>{(restoreDeletion, props) => (
 *     <MyCoolComponent
 *         onClick={restoreDeletion}
 *         {...props}
 *     />
 * )}</DeletionRestorer>
 */

const DeletionRestorer = (prop: PropsInterface) => {
  const restoreDeletion = () => {
    if (typeof prop.restore === 'function') {
      prop.restore();
      prop.dispatchUpdateRestore({ restoreFun: null, deletedItem: '' });
    }
  };
  const { children, dispatchUpdateRestore, ...props } = prop;
  const restorable = typeof prop.restore === 'function';
  return prop.children(restoreDeletion, {
    ...props,
    restorable,
  });
};

interface PropsInterface {
  children: any;
  deletedItem: string;
  dispatchUpdateRestore: any;
  restore: any;
}

const mapStateToProps = (state: any) => ({
  deletedItem: state.scratchGui.restoreDeletion.deletedItem,
  restore: state.scratchGui.restoreDeletion.restoreFun,
});
const mapDispatchToProps = (dispatch: any) => ({
  dispatchUpdateRestore: (updatedState: any) => {
    dispatch(setRestore(updatedState));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(DeletionRestorer);
