import classNames from 'classnames';

import backIcon from '../../lib/assets/icon--back.svg';
import styles from './closeButton.module.css';
import closeIconOrange from './icon--close-orange.svg';
import closeIcon from './icon--close.svg';

let closeIcons: any = {};

const CloseButton = (props: PropsInterface) => (
	<div
		aria-label='Close'
		className={classNames(styles.closeButton, props.className, {
			[styles.small]: props.size === CloseButton.SIZE_SMALL,
			[styles.large]: props.size === CloseButton.SIZE_LARGE,
			[styles.orange]: props.color === CloseButton.COLOR_ORANGE,
		})}
		role='button'
		tabIndex={0}
		onClick={props.onClick}
	>
		{props.buttonType === 'back' ? (
			<img className={styles.backIcon} src={backIcon} alt='' />
		) : (
			<img
				className={classNames(styles.closeIcon, {
					[styles[props.color]]: props.color !== CloseButton.COLOR_NEUTRAL,
				})}
				src={props.color && closeIcons[props.color] ? closeIcons[props.color] : closeIcon}
				alt=''
			/>
		)}
	</div>
);

CloseButton.SIZE_SMALL = 'small';
CloseButton.SIZE_LARGE = 'large';

CloseButton.COLOR_NEUTRAL = 'neutral';
CloseButton.COLOR_GREEN = 'green';
CloseButton.COLOR_ORANGE = 'orange';
closeIcons = {
	[CloseButton.COLOR_NEUTRAL]: closeIcon,
	[CloseButton.COLOR_GREEN]: closeIcon, // TODO: temporary, need green icon
	[CloseButton.COLOR_ORANGE]: closeIconOrange,
};

interface PropsInterface {
	buttonType?: any;
	className?: string;
	color?: any;
	onClick?: any;
	size?: any;
}

// TODO
// CloseButton.propTypes = {
//     buttonType: PropTypes.oneOf(['back', 'close']),
//     className: PropTypes.string,
//     color: PropTypes.string,
//     onClick: PropTypes.func.isRequired,
//     size: PropTypes.oneOf([CloseButton.SIZE_SMALL, CloseButton.SIZE_LARGE])
// };

CloseButton.defaultProps = {
	color: CloseButton.COLOR_NEUTRAL,
	size: CloseButton.SIZE_LARGE,
	buttonType: 'close',
};

export default CloseButton;
