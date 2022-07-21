import WebGlModalComponent from '../components/webgl-modal/webgl-modal.jsx';

const WebGlModal = (props: PropsInterface) => {
  const handleCancel = () => {
    window.history.back();
  };
  return <WebGlModalComponent isRtl={props.isRtl} onBack={handleCancel} />;
};

interface PropsInterface {
  isRtl: boolean;
}

export default WebGlModal;
