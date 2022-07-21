import { connect } from 'react-redux';

/**
 * Turbo Mode component passes toggleTurboMode function to its child.
 * It also includes `turboMode` in the props passed to the children.
 * It expects this child to be a function with the signature
 *     function (toggleTurboMode, {turboMode, ...props}) {}
 * The component can then be used to attach turbo mode setting functionality
 * to any other component:
 *
 * <TurboMode>{(toggleTurboMode, props) => (
 *     <MyCoolComponent
 *         turboEnabled={props.turboMode}
 *         onClick={toggleTurboMode}
 *         {...props}
 *     />
 * )}</TurboMode>
 */

const TurboMode = (prop: PropsInterface) => {
  const toggleTurboMode = () => {
    prop.vm.setTurboMode(!prop.turboMode);
  };
  const {
    /* eslint-disable no-unused-vars */
    children,
    vm,
    /* eslint-enable no-unused-vars */
    ...props
  } = prop;
  return prop.children(toggleTurboMode, props);
};

interface PropsInterface {
  children: any;
  turboMode: boolean;
  vm: any;
}

// TODO
// TurboMode.propTypes = {
//     children: PropTypes.func,
//     turboMode: PropTypes.bool,
//     vm: PropTypes.shape({
//         setTurboMode: PropTypes.func
//     })
// };

const mapStateToProps = (state: any) => ({
  vm: state.scratchGui.vm,
  turboMode: state.scratchGui.vmStatus.turbo,
});

export default connect(
  mapStateToProps,
  () => ({}) // omit dispatch prop
)(TurboMode);
