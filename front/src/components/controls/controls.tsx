import classNames from 'classnames';
import { defineMessages, FormattedMessage, injectIntl, IntlShape } from 'react-intl';

import GreenFlag from '../green-flag/green-flag';
import StopAll from '../stop-all/stop-all';
import TurboMode from '../turbo-mode/turbo-mode';

import styles from './controls.module.css';

const messages = defineMessages({
	goTitle: {
		id: 'gui.controls.go',
		defaultMessage: 'Go',
		description: 'Green flag button title',
	},
	stopTitle: {
		id: 'gui.controls.stop',
		defaultMessage: 'Stop',
		description: 'Stop button title',
	},
});

const Controls = function (props: PropsInterface) {
	const { active, className, intl, onGreenFlagClick, onStopAllClick, turbo, ...componentProps } =
		props;
	function callFormatMessage(id: FormattedMessage.MessageDescriptor) {
		return intl.formatMessage({ id: id }, '', '', '', '')?.message;
	}
	return (
		<div className={classNames(styles.controlsContainer, className)} {...componentProps}>
			<GreenFlag
				active={active}
				title={callFormatMessage(messages.goTitle)}
				onClick={onGreenFlagClick}
			/>
			<StopAll
				active={active}
				title={callFormatMessage(messages.stopTitle)}
				onClick={onStopAllClick}
			/>
			{turbo ? <TurboMode /> : null}
		</div>
	);
};

interface PropsInterface {
	active: boolean;
	className?: string;
	intl: IntlShape;
	onGreenFlagClick: any;
	onStopAllClick: any;
	turbo: boolean;
}

// TODO
// Controls.propTypes = {
//     active: PropTypes.bool,
//     className: PropTypes.string,
//     intl: intlShape.isRequired,
//     onGreenFlagClick: PropTypes.func.isRequired,
//     onStopAllClick: PropTypes.func.isRequired,
//     turbo: PropTypes.bool
// };

Controls.defaultProps = {
	active: false,
	turbo: false,
};

export default injectIntl(Controls);
