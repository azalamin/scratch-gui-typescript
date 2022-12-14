import { defineMessages, FormattedMessage, injectIntl, IntlShape } from 'react-intl';
import Box from '../box/box';
import Meter from '../meter/meter';
import Waveform from '../waveform/waveform';

import stopIcon from './icon--stop-recording.svg';
import styles from './recordModal.module.css';

const messages = defineMessages({
	beginRecord: {
		defaultMessage: 'Begin recording by clicking the button below',
		description: 'Message for recording sound modal',
		id: 'gui.recordingStep.beginRecord',
	},
	permission: {
		defaultMessage: '{arrow}We need your permission to use your microphone',
		description: 'Permission required notice in recording sound modal. Do not translate {arrow}',
		id: 'gui.recordingStep.permission',
	},
	stop: {
		defaultMessage: 'Stop recording',
		description: 'Stop recording button label',
		id: 'gui.recordingStep.stop',
	},
	record: {
		defaultMessage: 'Record',
		description: 'Record button label',
		id: 'gui.recordingStep.record',
	},
});

const RecordingStep = (props: PropsInterface) => {
	function callFormatMessage(id: FormattedMessage.MessageDescriptor) {
		return props.intl.formatMessage({ id: id }, '', '', '', '');
	}
	return (
		<Box>
			<Box className={styles.visualizationContainer}>
				<Box className={styles.meterContainer}>
					<Meter height={172} level={props.level} width={20} />
				</Box>
				<Box className={styles.waveformContainer}>
					{props.levels ? (
						<Waveform data={props.levels} height={150} level={0} width={440} />
					) : (
						<span className={styles.helpText}>
							{props.listening
								? callFormatMessage(messages.beginRecord)
								: callFormatMessage(messages.permission)}{' '}
						</span>
					)}
				</Box>
			</Box>
			<Box className={styles.mainButtonRow}>
				<button
					className={styles.mainButton}
					disabled={!props.listening}
					onClick={props.recording ? props.onStopRecording : props.onRecord}
				>
					{props.recording ? (
						<img draggable={false} src={stopIcon} alt='' />
					) : (
						<svg className={styles.recordButton} height='52' width='52'>
							<circle className={styles.recordButtonCircle} cx='26' cy='26' r='25' />
							<circle
								className={styles.recordButtonCircleOutline}
								cx='26'
								cy='26'
								r={27 + props.level * 5}
							/>
						</svg>
					)}
					<div className={styles.helpText}>
						<span className={styles.recordingText}>
							{props.recording
								? callFormatMessage(messages.stop)?.message
								: callFormatMessage(messages.record)?.message}
						</span>
					</div>
				</button>
			</Box>
		</Box>
	);
};
//props.isRtl ? '?????? \u00A0' : '?????? \u00A0',
interface PropsInterface {
	intl: IntlShape;
	isRtl?: boolean;
	level: number;
	levels: any;
	listening: boolean;
	onRecord: any;
	onStopRecording: any;
	recording: boolean;
}
// RecordingStep.propTypes = {
//     intl: intlShape.isRequired,
//     isRtl: PropTypes.bool,
//     level: PropTypes.number,
//     levels: PropTypes.arrayOf(PropTypes.number),
//     listening: PropTypes.bool,
//     onRecord: PropTypes.func.isRequired,
//     onStopRecording: PropTypes.func.isRequired,
//     recording: PropTypes.bool
// };

export default injectIntl(RecordingStep);
