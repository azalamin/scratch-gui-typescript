import { connect } from 'react-redux';
import AlertComponent from '../components/alerts/alert';
import { setConnectionModalExtensionId } from '../reducers/connection-modal';
import { openConnectionModal } from '../reducers/modals';
import { manualUpdateProject } from '../reducers/project-state';
import SB3Downloader from './sb3-downloader';

const Alert = (props: PropsInterface) => {
  const handleOnCloseAlert = () => {
    props.onCloseAlert(props.index);
  };
  const handleOnReconnect = () => {
    props.onOpenConnectionModal(props.extensionId);
    handleOnCloseAlert();
  };
  const {
    closeButton,
    content,
    extensionName,
    index, // eslint-disable-line no-unused-vars
    level,
    iconSpinner,
    iconURL,
    message,
    onSaveNow,
    showDownload,
    showReconnect,
    showSaveNow,
  } = props;
  return (
    <SB3Downloader>
      {(_: any, downloadProject: any) => (
        <AlertComponent
          closeButton={closeButton}
          key={index}
          content={content}
          extensionName={extensionName}
          iconSpinner={iconSpinner}
          iconURL={iconURL}
          level={level}
          showDownload={showDownload}
          showReconnect={showReconnect}
          showSaveNow={showSaveNow}
          onCloseAlert={handleOnCloseAlert}
          onDownload={downloadProject}
          onReconnect={handleOnReconnect}
          onSaveNow={onSaveNow}
          message={message}
        />
      )}
    </SB3Downloader>
  );
};

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch: any) => ({
  onOpenConnectionModal: (id: string) => {
    dispatch(setConnectionModalExtensionId(id));
    dispatch(openConnectionModal());
  },
  onSaveNow: () => {
    dispatch(manualUpdateProject());
  },
});

interface PropsInterface {
  closeButton?: boolean;
  content?: any;
  extensionId?: string;
  extensionName?: string;
  iconSpinner?: boolean;
  iconURL?: string;
  index?: number;
  level?: string;
  message?: any;
  onCloseAlert?: any;
  onOpenConnectionModal?: any;
  onSaveNow?: any;
  showDownload?: boolean;
  showReconnect?: boolean;
  showSaveNow?: boolean;
  onSaveFinished?: any;
}

export default connect(mapStateToProps, mapDispatchToProps)(Alert);
