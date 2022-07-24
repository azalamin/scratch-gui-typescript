import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

import InlineMessages from '../../containers/inline-messages.js';

import { manualUpdateProject } from '../../reducers/project-state';

import { filterInlineAlerts } from '../../reducers/alerts';

import styles from './saveStatus.module.css';

// Wrapper for inline messages in the nav bar, which are all related to saving.
// Show any inline messages if present, else show the "Save Now" button if the
// project has changed.
// We decided to not use an inline message for "Save Now" because it is a reflection
// of the project state, rather than an event.
const SaveStatus: any = ({
  alertsList,
  projectChanged,
  onClickSave,
}: PropsInterface) =>
  filterInlineAlerts(alertsList).length > 0 ? (
    <InlineMessages />
  ) : (
    projectChanged && (
      <div className={styles.saveNow} onClick={onClickSave}>
        <FormattedMessage
          defaultMessage='Save Now'
          description='Title bar link for saving now'
          id='gui.menuBar.saveNowLink'
        />
      </div>
    )
  );

interface PropsInterface {
  alertsList: any;
  onClickSave: any;
  projectChanged: boolean;
}

// TODO
// SaveStatus.propTypes = {
//     alertsList: PropTypes.arrayOf(PropTypes.object),
//     onClickSave: PropTypes.func,
//     projectChanged: PropTypes.bool
// };

const mapStateToProps = (state: any) => ({
  alertsList: state.scratchGui.alerts.alertsList,
  projectChanged: state.scratchGui.projectChanged,
});

const mapDispatchToProps = (dispatch: any) => ({
  onClickSave: () => dispatch(manualUpdateProject()),
});

export default connect(mapStateToProps, mapDispatchToProps)(SaveStatus);
