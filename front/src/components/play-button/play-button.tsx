import classNames from 'classnames';

import { defineMessages, injectIntl, IntlShape } from 'react-intl';

import styles from './playButton.module.css';

import playIcon from './icon--play.svg';
import stopIcon from './icon--stop.svg';

const messages = defineMessages({
	play: {
		id: 'gui.playButton.play',
		description: 'Title of the button to start playing the sound',
		defaultMessage: 'Play',
	},
	stop: {
		id: 'gui.playButton.stop',
		description: 'Title of the button to stop the sound',
		defaultMessage: 'Stop',
	},
});

const PlayButtonComponent = ({
	className,
	intl,
	isPlaying,
	onClick,
	onMouseDown,
	onMouseEnter,
	onMouseLeave,
	setButtonRef,
	...props
}: PropsInterface) => {
	const label = isPlaying
		? intl.formatMessage(messages.stop, '', '', '', '')?.message
		: intl.formatMessage(messages.play, '', '', '', '')?.message;

	return (
		<div
			aria-label={label}
			className={classNames(styles.playButton, className, {
				[styles.playing]: isPlaying,
			})}
			onClick={onClick}
			onMouseDown={onMouseDown}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			ref={setButtonRef}
			{...props}
		>
			<img
				className={styles.playIcon}
				draggable={false}
				src={isPlaying ? stopIcon : playIcon}
				alt=''
			/>
		</div>
	);
};

interface PropsInterface {
	className: any;
	intl: IntlShape;
	isPlaying: boolean;
	onClick: any;
	onMouseDown: any;
	onMouseEnter: any;
	onMouseLeave: any;
	setButtonRef: any;
}

// TODO
// PlayButtonComponent.propTypes = {
//     className: PropTypes.string,
//     intl: intlShape,
//     isPlaying: PropTypes.bool.isRequired,
//     onClick: PropTypes.func.isRequired,
//     onMouseDown: PropTypes.func.isRequired,
//     onMouseEnter: PropTypes.func.isRequired,
//     onMouseLeave: PropTypes.func.isRequired,
//     setButtonRef: PropTypes.func.isRequired
// };

export default injectIntl(PlayButtonComponent);
