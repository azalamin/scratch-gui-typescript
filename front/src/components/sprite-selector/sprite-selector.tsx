import { defineMessages, FormattedMessage, injectIntl, IntlShape } from 'react-intl';

import { isRtl } from 'scratch-l10n';
import SpriteInfo from '../../containers/sprite-info';
import ActionMenu from '../action-menu/action-menu';
import Box from '../box/box';
import SpriteList from './sprite-list';

import styles from './spriteSelector.module.css';

import fileUploadIcon from '../action-menu/icon--file-upload.svg';
import paintIcon from '../action-menu/icon--paint.svg';
import searchIcon from '../action-menu/icon--search.svg';
import spriteIcon from '../action-menu/icon--sprite.svg';
import surpriseIcon from '../action-menu/icon--surprise.svg';

const messages = defineMessages({
	addSpriteFromLibrary: {
		id: 'gui.spriteSelector.addSpriteFromLibrary',
		description: 'Button to add a sprite in the target pane from library',
		defaultMessage: 'Choose a Sprite',
	},
	addSpriteFromPaint: {
		id: 'gui.spriteSelector.addSpriteFromPaint',
		description: 'Button to add a sprite in the target pane from paint',
		defaultMessage: 'Paint',
	},
	addSpriteFromSurprise: {
		id: 'gui.spriteSelector.addSpriteFromSurprise',
		description: 'Button to add a random sprite in the target pane',
		defaultMessage: 'Surprise',
	},
	addSpriteFromFile: {
		id: 'gui.spriteSelector.addSpriteFromFile',
		description: 'Button to add a sprite in the target pane from file',
		defaultMessage: 'Upload Sprite',
	},
});

const SpriteSelectorComponent = function (props: PropsInterface) {
	const {
		editingTarget,
		hoveredTarget,
		intl,
		onChangeSpriteDirection,
		onChangeSpriteName,
		onChangeSpriteRotationStyle,
		onChangeSpriteSize,
		onChangeSpriteVisibility,
		onChangeSpriteX,
		onChangeSpriteY,
		onDrop,
		onDeleteSprite,
		onDuplicateSprite,
		onExportSprite,
		onFileUploadClick,
		onNewSpriteClick,
		onPaintSpriteClick,
		onSelectSprite,
		onSpriteUpload,
		onSurpriseSpriteClick,
		raised,
		selectedId,
		spriteFileInput,
		sprites,
		stageSize,
		...componentProps
	} = props;

	function callFormatMessage(id: FormattedMessage.MessageDescriptor) {
		return intl.formatMessage({ id: id }, '', '', '', '');
	}

	let selectedSprite: any = sprites[selectedId];
	let spriteInfoDisabled = false;
	if (typeof selectedSprite === 'undefined') {
		selectedSprite = {};
		spriteInfoDisabled = true;
	}
	return (
		<Box className={styles.spriteSelector} {...componentProps}>
			<SpriteInfo
				direction={selectedSprite.direction}
				disabled={spriteInfoDisabled}
				name={selectedSprite.name}
				rotationStyle={selectedSprite.rotationStyle}
				size={selectedSprite.size}
				stageSize={stageSize}
				visible={selectedSprite.visible}
				x={selectedSprite.x}
				y={selectedSprite.y}
				onChangeDirection={onChangeSpriteDirection}
				onChangeName={onChangeSpriteName}
				onChangeRotationStyle={onChangeSpriteRotationStyle}
				onChangeSize={onChangeSpriteSize}
				onChangeVisibility={onChangeSpriteVisibility}
				onChangeX={onChangeSpriteX}
				onChangeY={onChangeSpriteY}
			/>

			<SpriteList
				editingTarget={editingTarget}
				hoveredTarget={hoveredTarget}
				items={Object.keys(sprites).map(id => sprites[id])}
				raised={raised}
				selectedId={selectedId}
				onDeleteSprite={onDeleteSprite}
				onDrop={onDrop}
				onDuplicateSprite={onDuplicateSprite}
				onExportSprite={onExportSprite}
				onSelectSprite={onSelectSprite}
			/>
			<ActionMenu
				className={styles.addButton}
				img={spriteIcon}
				moreButtons={[
					{
						title: callFormatMessage(messages.addSpriteFromFile)?.message,
						img: fileUploadIcon,
						onClick: onFileUploadClick,
						fileAccept: '.svg, .png, .bmp, .jpg, .jpeg, .sprite2, .sprite3, .gif',
						fileChange: onSpriteUpload,
						fileInput: spriteFileInput,
						fileMultiple: true,
					},
					{
						title: callFormatMessage(messages.addSpriteFromSurprise),
						img: surpriseIcon,
						onClick: onSurpriseSpriteClick, // TODO need real function for this
					},
					{
						title: callFormatMessage(messages.addSpriteFromPaint),
						img: paintIcon,
						onClick: onPaintSpriteClick, // TODO need real function for this
					},
					{
						title: callFormatMessage(messages.addSpriteFromLibrary),
						img: searchIcon,
						onClick: onNewSpriteClick,
					},
				]}
				title={callFormatMessage(messages.addSpriteFromLibrary)?.message}
				tooltipPlace={isRtl(intl.locale) ? 'right' : 'left'}
				onClick={onNewSpriteClick}
			/>
		</Box>
	);
};

interface PropsInterface {
	editingTarget: string;
	hoveredTarget: any;
	intl: IntlShape;
	onChangeSpriteDirection: any;
	onChangeSpriteName: any;
	onChangeSpriteRotationStyle: any;
	onChangeSpriteSize: any;
	onChangeSpriteVisibility: any;
	onChangeSpriteX: any;
	onChangeSpriteY: any;
	onDeleteSprite: any;
	onDrop: any;
	onDuplicateSprite: any;
	onExportSprite: any;
	onFileUploadClick: any;
	onNewSpriteClick: any;
	onPaintSpriteClick: any;
	onSelectSprite: any;
	onSpriteUpload: any;
	onSurpriseSpriteClick: any;
	raised: any;
	selectedId: string;
	spriteFileInput: any;
	sprites: any;
	stageSize: any;
}

// SpriteSelectorComponent.propTypes = {
//   editingTarget: PropTypes.string,
//   hoveredTarget: PropTypes.shape({
//     hoveredSprite: PropTypes.string,
//     receivedBlocks: PropTypes.bool,
//   }),
//   intl: intlShape.isRequired,
//   onChangeSpriteDirection: PropTypes.func,
//   onChangeSpriteName: PropTypes.func,
//   onChangeSpriteRotationStyle: PropTypes.func,
//   onChangeSpriteSize: PropTypes.func,
//   onChangeSpriteVisibility: PropTypes.func,
//   onChangeSpriteX: PropTypes.func,
//   onChangeSpriteY: PropTypes.func,
//   onDeleteSprite: PropTypes.func,
//   onDrop: PropTypes.func,
//   onDuplicateSprite: PropTypes.func,
//   onExportSprite: PropTypes.func,
//   onFileUploadClick: PropTypes.func,
//   onNewSpriteClick: PropTypes.func,
//   onPaintSpriteClick: PropTypes.func,
//   onSelectSprite: PropTypes.func,
//   onSpriteUpload: PropTypes.func,
//   onSurpriseSpriteClick: PropTypes.func,
//   raised: PropTypes.bool,
//   selectedId: PropTypes.string,
//   spriteFileInput: PropTypes.func,
//   sprites: PropTypes.shape({
//     id: PropTypes.shape({
//       costume: PropTypes.shape({
//         url: PropTypes.string,
//         name: PropTypes.string.isRequired,
//         bitmapResolution: PropTypes.number.isRequired,
//         rotationCenterX: PropTypes.number.isRequired,
//         rotationCenterY: PropTypes.number.isRequired,
//       }),
//       name: PropTypes.string.isRequired,
//       order: PropTypes.number.isRequired,
//     }),
//   }),
//   stageSize: PropTypes.oneOf(Object.keys(STAGE_DISPLAY_SIZES)).isRequired,
// };

export default injectIntl(SpriteSelectorComponent);
