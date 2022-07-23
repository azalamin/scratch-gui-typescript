import classNames from 'classnames';
import { defineMessages, injectIntl, IntlShape } from 'react-intl';
import { connect } from 'react-redux';
import { setProjectTitle } from '../../reducers/project-title';

import BufferedInputHOC from '../forms/buffered-input-hoc.js';
import Input from '../forms/input.js';
import styles from './projectTitleInput.module.css';
const BufferedInput = BufferedInputHOC(Input);

const messages = defineMessages({
  projectTitlePlaceholder: {
    id: 'gui.gui.projectTitlePlaceholder',
    description: 'Placeholder for project title when blank',
    defaultMessage: 'Project title here',
  },
});

const ProjectTitleInput = ({
  className,
  intl,
  onSubmit,
  projectTitle,
}: PropsInterface) => (
  <BufferedInput
    className={classNames(styles.titleField, className)}
    maxLength='100'
    placeholder={intl.formatMessage(messages.projectTitlePlaceholder)}
    tabIndex='0'
    type='text'
    value={projectTitle}
    onSubmit={onSubmit}
  />
);

interface PropsInterface {
  className: string;
  intl: IntlShape;
  onSubmit: any;
  projectTitle: string;
}

// TODO
// ProjectTitleInput.propTypes = {
//   className: PropTypes.string,
//   intl: intlShape.isRequired,
//   onSubmit: PropTypes.func,
//   projectTitle: PropTypes.string,
// };

const mapStateToProps = (state: any) => ({
  projectTitle: state.scratchGui.projectTitle,
});

const mapDispatchToProps = (dispatch: any) => ({
  onSubmit: (title: any) => dispatch(setProjectTitle(title)),
});

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(ProjectTitleInput)
);
