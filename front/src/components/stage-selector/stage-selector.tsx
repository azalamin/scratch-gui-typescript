import classNames from 'classnames';
import { defineMessages, FormattedMessage, injectIntl, IntlShape } from 'react-intl';

import { isRtl } from 'scratch-l10n';
import ActionMenu from '../action-menu/action-menu';
import Box from '../box/box';
import styles from './stageSelector.module.css';

import backdropIcon from '../action-menu/icon--backdrop.svg';
import fileUploadIcon from '../action-menu/icon--file-upload.svg';
import paintIcon from '../action-menu/icon--paint.svg';
import searchIcon from '../action-menu/icon--search.svg';
import surpriseIcon from '../action-menu/icon--surprise.svg';

const messages = defineMessages({
	addBackdropFromLibrary: {
		id: 'gui.spriteSelector.addBackdropFromLibrary',
		description: 'Button to add a stage in the target pane from library',
		defaultMessage: 'Choose a Backdrop',
	},
	addBackdropFromPaint: {
		id: 'gui.stageSelector.addBackdropFromPaint',
		description: 'Button to add a stage in the target pane from paint',
		defaultMessage: 'Paint',
	},
	addBackdropFromSurprise: {
		id: 'gui.stageSelector.addBackdropFromSurprise',
		description: 'Button to add a random stage in the target pane',
		defaultMessage: 'Surprise',
	},
	addBackdropFromFile: {
		id: 'gui.stageSelector.addBackdropFromFile',
		description: 'Button to add a stage in the target pane from file',
		defaultMessage: 'Upload Backdrop',
	},
});

function callFormatMessage(props: PropsInterface, id: FormattedMessage.MessageDescriptor) {
	return props.intl.formatMessage({ id: id }, '', '', '', '');
}

const StageSelector = (props: PropsInterface) => {
	const {
		backdropCount,
		containerRef,
		dragOver,
		fileInputRef,
		intl,
		selected,
		raised,
		receivedBlocks,
		url,
		onBackdropFileUploadClick,
		onBackdropFileUpload,
		onClick,
		onMouseEnter,
		onMouseLeave,
		onNewBackdropClick,
		onSurpriseBackdropClick,
		onEmptyBackdropClick,
		...componentProps
	} = props;
	return (
		<Box
			className={classNames(styles.stageSelector, {
				[styles.isSelected]: selected,
				[styles.raised]: raised || dragOver,
				[styles.receivedBlocks]: receivedBlocks,
			})}
			componentRef={containerRef}
			onClick={onClick}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			{...componentProps}
		>
			<div className={styles.header}>
				<div className={styles.headerTitle}>
					<FormattedMessage
						defaultMessage='Stage'
						description='Label for the stage in the stage selector'
						id='gui.stageSelector.stage'
					/>
				</div>
			</div>
			{url ? <img className={styles.costumeCanvas} src={url} alt='' /> : null}
			<div className={styles.label}>
				<FormattedMessage
					defaultMessage='Backdrops'
					description='Label for the backdrops in the stage selector'
					id='gui.stageSelector.backdrops'
				/>
			</div>
			<div className={styles.count}>{backdropCount}</div>
			<ActionMenu
				className={styles.addButton}
				img={backdropIcon}
				moreButtons={[
					{
						title: callFormatMessage(props, messages.addBackdropFromFile),
						img: fileUploadIcon,
						onClick: onBackdropFileUploadClick,
						fileAccept: '.svg, .png, .bmp, .jpg, .jpeg, .gif',
						fileChange: onBackdropFileUpload,
						fileInput: fileInputRef,
						fileMultiple: true,
					},
					{
						title: callFormatMessage(props, messages.addBackdropFromSurprise),
						img: surpriseIcon,
						onClick: onSurpriseBackdropClick,
					},
					{
						title: callFormatMessage(props, messages.addBackdropFromPaint),
						img: paintIcon,
						onClick: onEmptyBackdropClick,
					},
					{
						title: callFormatMessage(props, messages.addBackdropFromLibrary),
						img: searchIcon,
						onClick: onNewBackdropClick,
					},
				]}
				title={callFormatMessage(props, messages.addBackdropFromLibrary)}
				tooltipPlace={isRtl(intl.locale) ? 'right' : 'left'}
				onClick={onNewBackdropClick}
			/>
		</Box>
	);
};

interface PropsInterface {
	backdropCount: number;
	containerRef: any;
	dragOver: boolean;
	fileInputRef: any;
	intl: IntlShape;
	onBackdropFileUpload: any;
	onBackdropFileUploadClick: any;
	onClick: any;
	onEmptyBackdropClick: any;
	onMouseEnter: any;
	onMouseLeave: any;
	onNewBackdropClick: any;
	onSurpriseBackdropClick: any;
	raised: boolean;
	receivedBlocks: boolean;
	selected: boolean;
	url: string;
}

// StageSelector.propTypes = {
//   backdropCount: PropTypes.number.isRequired,
//   containerRef: PropTypes.func,
//   dragOver: PropTypes.bool,
//   fileInputRef: PropTypes.func,
//   intl: intlShape.isRequired,
//   onBackdropFileUpload: PropTypes.func,
//   onBackdropFileUploadClick: PropTypes.func,
//   onClick: PropTypes.func,
//   onEmptyBackdropClick: PropTypes.func,
//   onMouseEnter: PropTypes.func,
//   onMouseLeave: PropTypes.func,
//   onNewBackdropClick: PropTypes.func,
//   onSurpriseBackdropClick: PropTypes.func,
//   raised: PropTypes.bool.isRequired,
//   receivedBlocks: PropTypes.bool.isRequired,
//   selected: PropTypes.bool.isRequired,
//   url: PropTypes.string,
// };

export default injectIntl(StageSelector);
