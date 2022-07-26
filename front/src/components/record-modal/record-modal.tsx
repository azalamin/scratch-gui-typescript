import { defineMessages, FormattedMessage, injectIntl, IntlShape } from 'react-intl';
import Modal from '../../containers/modal';
import PlaybackStep from '../../containers/playback-step';
import RecordingStep from '../../containers/recording-step';
import Box from '../box/box';
import styles from './recordModal.module.css';

const messages = defineMessages({
	title: {
		defaultMessage: 'Record Sound',
		description: 'Recording modal title',
		id: 'gui.recordModal.title',
	},
});

const RecordModal = (props: PropsInterface) => {
	function callFormatMessage(id: FormattedMessage.MessageDescriptor) {
		return props.intl.formatMessage({ id: id }, '', '', '', '');
	}
	return (
		<Modal
			className={styles.modalContent}
			contentLabel={callFormatMessage(messages.title)?.message}
			onRequestClose={props.onCancel}
		>
			<Box className={styles.body}>
				{props.samples ? (
					<PlaybackStep
						encoding={props.encoding}
						levels={props.levels}
						playhead={props.playhead}
						playing={props.playing}
						sampleRate={props.sampleRate}
						samples={props.samples}
						trimEnd={props.trimEnd}
						trimStart={props.trimStart}
						onBack={props.onBack}
						onPlay={props.onPlay}
						onSetPlayhead={props.onSetPlayhead}
						onSetTrimEnd={props.onSetTrimEnd}
						onSetTrimStart={props.onSetTrimStart}
						onStopPlaying={props.onStopPlaying}
						onSubmit={props.onSubmit}
					/>
				) : (
					<RecordingStep
						recording={props.recording}
						onRecord={props.onRecord}
						onStopRecording={props.onStopRecording}
					/>
				)}
			</Box>
		</Modal>
	);
};

interface PropsInterface {
	encoding: boolean;
	intl: IntlShape;
	levels: any;
	onBack: any;
	onCancel: any;
	onPlay: any;
	onRecord: any;
	onSetPlayhead: any;
	onSetTrimEnd: any;
	onSetTrimStart: any;
	onStopPlaying: any;
	onStopRecording: any;
	onSubmit: any;
	playhead: number;
	playing: boolean;
	recording: boolean;
	sampleRate: number;
	samples: any;
	trimEnd: number;
	trimStart: number;
}

// TODO
// RecordModal.propTypes = {
//     encoding: PropTypes.bool.isRequired,
//     intl: intlShape.isRequired,
//     levels: PropTypes.arrayOf(PropTypes.number),
//     onBack: PropTypes.func.isRequired,
//     onCancel: PropTypes.func.isRequired,
//     onPlay: PropTypes.func.isRequired,
//     onRecord: PropTypes.func.isRequired,
//     onSetPlayhead: PropTypes.func.isRequired,
//     onSetTrimEnd: PropTypes.func.isRequired,
//     onSetTrimStart: PropTypes.func.isRequired,
//     onStopPlaying: PropTypes.func.isRequired,
//     onStopRecording: PropTypes.func.isRequired,
//     onSubmit: PropTypes.func.isRequired,
//     playhead: PropTypes.number,
//     playing: PropTypes.bool,
//     recording: PropTypes.bool,
//     sampleRate: PropTypes.number,
//     samples: PropTypes.instanceOf(Float32Array),
//     trimEnd: PropTypes.number.isRequired,
//     trimStart: PropTypes.number.isRequired
// };

export default injectIntl(RecordModal);
