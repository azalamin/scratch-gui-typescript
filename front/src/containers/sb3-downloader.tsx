import { connect } from 'react-redux';
import downloadBlob from '../lib/download-blob';
import { projectTitleInitialState } from '../reducers/project-title';
/**
 * Project saver component passes a downloadProject function to its child.
 * It expects this child to be a function with the signature
 *     function (downloadProject, props) {}
 * The component can then be used to attach project saving functionality
 * to any other component:
 *
 * <SB3Downloader>{(downloadProject, props) => (
 *     <MyCoolComponent
 *         onClick={downloadProject}
 *         {...props}
 *     />
 * )}</SB3Downloader>
 */

const SB3Downloader = (props: PropsInterface) => {
  const downloadProject = () => {
    props.saveProjectSb3().then((content: any) => {
      if (props.onSaveFinished) {
        props.onSaveFinished();
      }
      downloadBlob(props.projectFilename, content);
    });
  };
  const { children } = props;

  return children(props.className, downloadProject);
};

const getProjectFilename = (curTitle: any, defaultTitle: any) => {
  let filenameTitle = curTitle;
  if (!filenameTitle || filenameTitle.length === 0) {
    filenameTitle = defaultTitle;
  }
  return `${filenameTitle.substring(0, 100)}.sb3`;
};

interface PropsInterface {
  children: any;
  className: string;
  onSaveFinished?: any;
  projectFilename?: string;
  saveProjectSb3?: any;
}

// TODO
// SB3Downloader.propTypes = {
//   children: PropTypes.func,
//   className: PropTypes.string,
//   onSaveFinished: PropTypes.func,
//   projectFilename: PropTypes.string,
//   saveProjectSb3: PropTypes.func,
// };

SB3Downloader.defaultProps = {
  className: '',
};

const mapStateToProps = (state: any) => ({
  saveProjectSb3: state.scratchGui.vm.saveProjectSb3.bind(state.scratchGui.vm),
  projectFilename: getProjectFilename(
    state.scratchGui.projectTitle,
    projectTitleInitialState
  ),
});

export default connect(
  mapStateToProps,
  () => ({}) // omit dispatch prop
)(SB3Downloader);
