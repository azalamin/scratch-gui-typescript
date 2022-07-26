import { defineMessages, FormattedMessage, injectIntl, IntlShape } from 'react-intl';
import AudioTrimmer from '../../containers/audio-trimmer';
import Box from '../box/box';
import Meter from '../meter/meter';
import Waveform from '../waveform/waveform';

import backIcon from './icon--back.svg';
import playIcon from './icon--play.svg';
import stopIcon from './icon--stop-playback.svg';
import styles from './recordModal.module.css';

const messages = defineMessages({
	stopMsg: {
		defaultMessage: 'Stop',
		description: 'Stop/Play button in recording playback',
		id: 'gui.playbackStep.stopMsg',
	},
	playMsg: {
		defaultMessage: 'Play',
		description: 'Stop/Play button in recording playback',
		id: 'gui.playbackStep.playMsg',
	},
	loadingMsg: {
		defaultMessage: 'Loading...',
		description: 'Loading/Save button in recording playback',
		id: 'gui.playbackStep.loadingMsg',
	},
	saveMsg: {
		defaultMessage: 'Save',
		description: 'Loading/Save button in recording playback',
		id: 'gui.playbackStep.saveMsg',
	},
	reRecordMsg: {
		defaultMessage: 'Re-record',
		description: 'Button to re-record sound in recording playback',
		id: 'gui.playbackStep.reRecordMsg',
	},
});

const PlaybackStep = (props: PropsInterface) => {
	function callFormatMessage(id: FormattedMessage.MessageDescriptor) {
		return props.intl.formatMessage({ id: id }, '', '', '', '');
	}
	return (
		<Box>
			<Box className={styles.visualizationContainer}>
				<Box className={styles.meterContainer}>
					<Meter height={172} level={0} width={20} />
				</Box>
				<Box className={styles.waveformContainer}>
					<Waveform data={props.levels} height={150} level={0} width={480} />
					<AudioTrimmer
						playhead={props.playhead}
						trimEnd={props.trimEnd}
						trimStart={props.trimStart}
						onSetTrimEnd={props.onSetTrimEnd}
						onSetTrimStart={props.onSetTrimStart}
					/>
				</Box>
			</Box>
			<Box className={styles.mainButtonRow}>
				<button
					className={styles.mainButton}
					onClick={props.playing ? props.onStopPlaying : props.onPlay}
				>
					<img draggable={false} src={props.playing ? stopIcon : playIcon} alt='' />
					<div className={styles.helpText}>
						<span className={styles.playingText}>
							{props.playing
								? callFormatMessage(messages.stopMsg)?.message
								: callFormatMessage(messages.playMsg)?.message}
						</span>
					</div>
				</button>
			</Box>
			<Box className={styles.buttonRow}>
				<button className={styles.rerecordButton} onClick={props.onBack}>
					<img draggable={false} src={backIcon} alt='' />
					{callFormatMessage(messages.reRecordMsg)?.message}
				</button>
				<button className={styles.okButton} disabled={props.encoding} onClick={props.onSubmit}>
					{props.encoding
						? callFormatMessage(messages.loadingMsg)?.message
						: callFormatMessage(messages.saveMsg)?.message}
				</button>
			</Box>
		</Box>
	);
};

interface PropsInterface {
	encoding?: boolean;
	intl: IntlShape;
	levels?: any;
	onBack?: any;
	onPlay?: any;
	onSetTrimEnd?: any;
	onSetTrimStart?: any;
	onStopPlaying?: any;
	onSubmit?: any;
	playhead?: number;
	playing?: boolean;
	trimEnd?: number;
	trimStart?: number;
}

// TODO
// PlaybackStep.propTypes = {
//     encoding: PropTypes.bool.isRequired,
//     intl: intlShape.isRequired,
//     levels: PropTypes.arrayOf(PropTypes.number).isRequired,
//     onBack: PropTypes.func.isRequired,
//     onPlay: PropTypes.func.isRequired,
//     onSetTrimEnd: PropTypes.func.isRequired,
//     onSetTrimStart: PropTypes.func.isRequired,
//     onStopPlaying: PropTypes.func.isRequired,
//     onSubmit: PropTypes.func.isRequired,
//     playhead: PropTypes.number,
//     playing: PropTypes.bool.isRequired,
//     trimEnd: PropTypes.number.isRequired,
//     trimStart: PropTypes.number.isRequired
// };

export default injectIntl(PlaybackStep);
