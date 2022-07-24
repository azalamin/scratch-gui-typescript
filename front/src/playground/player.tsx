import classNames from 'classnames';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { compose } from 'redux';

import Box from '../components/box/box.js';
import GUI from '../containers/gui.js';
import AppStateHOC from '../lib/app-state-hoc.js';
import HashParserHOC from '../lib/hash-parser-hoc.js';

import { setPlayer } from '../reducers/mode';
import styles from './player.module.css';

if (process.env.NODE_ENV === 'production' && typeof window === 'object') {
  // Warn before navigating away
  window.onbeforeunload = () => true;
}

const Player = ({ isPlayerOnly, onSeeInside, projectId }: PropsInterface) => (
  <Box className={classNames(isPlayerOnly ? styles.stageOnly : styles.editor)}>
    {isPlayerOnly && <button onClick={onSeeInside}>{'See inside'}</button>}
    <GUI
      canEditTitle
      enableCommunity
      isPlayerOnly={isPlayerOnly}
      projectId={projectId}
    />
  </Box>
);

interface PropsInterface {
  isPlayerOnly: boolean;
  onSeeInside: any;
  projectId: string;
}

// TODO
// Player.propTypes = {
//     isPlayerOnly: PropTypes.bool,
//     onSeeInside: PropTypes.func,
//     projectId: PropTypes.string
// };

const mapStateToProps = (state: any) => ({
  isPlayerOnly: state.scratchGui.mode.isPlayerOnly,
});

const mapDispatchToProps = (dispatch: any) => ({
  onSeeInside: () => dispatch(setPlayer(false)),
});

const ConnectedPlayer = connect(mapStateToProps, mapDispatchToProps)(Player);

// note that redux's 'compose' function is just being used as a general utility to make
// the hierarchy of HOC constructor calls clearer here; it has nothing to do with redux's
// ability to compose reducers.
const WrappedPlayer: any = compose(AppStateHOC, HashParserHOC)(ConnectedPlayer);

const appTarget = document.createElement('div');
document.body.appendChild(appTarget);

ReactDOM.render(<WrappedPlayer isPlayerOnly />, appTarget);
