import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

import Blocks from '../containers/blocks';
import Controls from '../containers/controls';
import GUI from '../containers/gui';
import AppStateHOC from '../lib/app-state-hoc';
import HashParserHOC from '../lib/hash-parser-hoc';

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
