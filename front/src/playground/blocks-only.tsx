import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

import Blocks from '../containers/blocks.js';
import Controls from '../containers/controls.js';
import GUI from '../containers/gui.js';
import AppStateHOC from '../lib/app-state-hoc.js';
import HashParserHOC from '../lib/hash-parser-hoc.jsx';

import styles from './blocksOnly.module.css';

const mapStateToProps = (state: any) => ({ vm: state.scratchGui.vm });

const VMBlocks: any = connect(mapStateToProps)(Blocks);
const VMControls: any = connect(mapStateToProps)(Controls);

const BlocksOnly = (props: any) => (
  <GUI {...props}>
    <VMBlocks
      grow={1}
      options={{
        media: `static/blocks-media/`,
      }}
    />
    <VMControls className={styles.controls} />
  </GUI>
);

const App = AppStateHOC(HashParserHOC(BlocksOnly));

const appTarget = document.createElement('div');
document.body.appendChild(appTarget);

ReactDOM.render(<App />, appTarget);
