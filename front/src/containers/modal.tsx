import { useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import ModalComponent from '../components/modal/modal.js';

// class Modal extends React.Component {
//     constructor (props) {
//         super(props);
//         bindAll(this, [
//             'addEventListeners',
//             'removeEventListeners',
//             'handlePopState',
//             'pushHistory'
//         ]);
//         this.addEventListeners();
//     }
//     componentDidMount () {
//         console.log(this.id);
//         // Add a history event only if it's not currently for our modal. This
//         // avoids polluting the history with many entries. We only need one.
//         this.pushHistory(this.id, (history.state === null || history.state !== this.id));
//     }
//     componentWillUnmount () {
//         this.removeEventListeners();
//     }
//     addEventListeners () {
//         window.addEventListener('popstate', this.handlePopState);
//     }
//     removeEventListeners () {
//         window.removeEventListener('popstate', this.handlePopState);
//     }
//     handlePopState () {
//         // Whenever someone navigates, we want to be closed
//         this.props.onRequestClose();
//     }
//     get id () {
//         return `modal-${this.props.id}`;
//     }
//     pushHistory (state, push) {
//         if (push) return history.pushState(state, this.id);
//         history.replaceState(state, this.id);
//     }
//     render () {
//         return <ModalComponent {...this.props} />;
//     }
// }

const id: any = 244309;
const Modal = (props: PropsInterface) => {
  const handlePopState: any = useCallback(() => {
    props.onRequestClose();
  }, [props]);

  const addEventListeners: any = useCallback(() => {
    window.addEventListener('popstate', handlePopState);
  }, [handlePopState]);

  const removeEventListeners: any = useCallback(() => {
    window.removeEventListener('popstate', handlePopState);
  }, [handlePopState]);

  const pushHistory: any = (state: any, push: any) => {
    // eslint-disable-next-line no-restricted-globals
    if (push) return history.pushState(state, id);
    // eslint-disable-next-line no-restricted-globals
    history.replaceState(state, id);
  };

  useEffect(() => {
    addEventListeners();
    // Add a history event only if it's not currently for our modal. This
    // avoids polluting the history with many entries. We only need one.
    // eslint-disable-next-line no-restricted-globals
    pushHistory(id, history.state === null || history.state !== id);

    return () => {
      removeEventListeners();
    };
  }, [addEventListeners, removeEventListeners]);

  return <ModalComponent {...props} />;
};

interface PropsInterface {
  id: string;
  isRtl: boolean;
  onRequestClose: any;
  onRequestOpen: any;
  children: any;
}

// TODO
// Modal.propTypes = {
//     id: PropTypes.string,
//     isRtl: PropTypes.bool,
//     onRequestClose: PropTypes.func,
//     onRequestOpen: PropTypes.func
// };

const mapStateToProps = (state: any) => ({
  isRtl: state.locales.isRtl,
});

export default connect(mapStateToProps)(Modal);
