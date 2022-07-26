import omit from 'lodash.omit';
import { useCallback, useEffect } from 'react';
import { injectIntl, IntlShape } from 'react-intl';

import { connect } from 'react-redux';
import { fetchCode } from '../lib/backpack-api';
import DragConstants from '../lib/drag-constants';
import DropAreaHOC from '../lib/drop-area-hoc';
import { emptyCostume } from '../lib/empty-assets';
import sharedMessages from '../lib/shared-messages';
import ThrottledPropertyHOC from '../lib/throttled-property-hoc';
import { getEventXY } from '../lib/touch-utils';
import { closeAlertWithId, showStandardAlert } from '../reducers/alerts';
import { activateTab, COSTUMES_TAB_INDEX } from '../reducers/editor-tab';
import { setHoveredSprite } from '../reducers/hovered-target';
import { openBackdropLibrary } from '../reducers/modals';

import StageSelectorComponent from '../components/stage-selector/stage-selector';

import { costumeUpload, handleFileUpload } from '../lib/file-uploader';
import backdropLibraryContent from '../lib/libraries/backdrops.json';

const dragTypes = [
	DragConstants.COSTUME,
	DragConstants.SOUND,
	DragConstants.BACKPACK_COSTUME,
	DragConstants.BACKPACK_SOUND,
	DragConstants.BACKPACK_CODE,
];

const DroppableThrottledStage: any = DropAreaHOC(dragTypes)(
	ThrottledPropertyHOC('url', 500)(StageSelectorComponent)
);

const StageSelector = (props: PropsInterface) => {
	let fileInput: any;
	let ref: any;
	const addBackdropFromLibraryItem = (item: any, shouldActivateTab = true) => {
		const vmBackdrop = {
			name: item.name,
			md5: item.md5ext,
			rotationCenterX: item.rotationCenterX,
			rotationCenterY: item.rotationCenterY,
			bitmapResolution: item.bitmapResolution,
			skinId: null,
		};
		handleNewBackdrop(vmBackdrop, shouldActivateTab);
	};

	const handleClick = () => {
		props.onSelect(props.id);
	};
	const handleNewBackdrop = (backdrops_: any, shouldActivateTab = true) => {
		const backdrops = Array.isArray(backdrops_) ? backdrops_ : [backdrops_];
		return Promise.all(
			backdrops.map(backdrop => props.vm.addBackdrop(backdrop.md5, backdrop))
		).then(() => {
			if (shouldActivateTab) {
				return props.onActivateTab(COSTUMES_TAB_INDEX);
			}
		});
	};
	const handleSurpriseBackdrop = (e: any) => {
		e.stopPropagation(); // Prevent click from falling through to selecting stage.
		// @todo should this not add a backdrop you already have?
		const item = backdropLibraryContent[Math.floor(Math.random() * backdropLibraryContent.length)];
		addBackdropFromLibraryItem(item, false);
	};
	const handleEmptyBackdrop = (e: any) => {
		e.stopPropagation(); // Prevent click from falling through to stage selector, select it manually below
		props.vm.setEditingTarget(props.id);
		handleNewBackdrop(
			emptyCostume(props.intl.formatMessage(sharedMessages.backdrop, '', '', '', ''))
		);
	};
	const handleBackdropUpload = (e: any) => {
		const storage = props.vm.runtime.storage;
		props.onShowImporting();
		handleFileUpload(
			e.target,
			(buffer: any, fileType: any, fileName: any, fileIndex: any, fileCount: any) => {
				costumeUpload(
					buffer,
					fileType,
					storage,
					(vmCostumes: any) => {
						props.vm.setEditingTarget(props.id);
						vmCostumes.forEach((costume: any, i: any) => {
							costume.name = `${fileName}${i ? i + 1 : ''}`;
						});
						handleNewBackdrop(vmCostumes).then(() => {
							if (fileIndex === fileCount - 1) {
								props.onCloseImporting();
							}
						});
					},
					props.onCloseImporting
				);
			},
			props.onCloseImporting
		);
	};
	const handleFileUploadClick = (e: any) => {
		e.stopPropagation(); // Prevent click from selecting the stage, that is handled manually in backdrop upload
		fileInput.click();
	};
	const handleMouseEnter = useCallback(() => {
		props.dispatchSetHoveredSprite(props.id);
	}, [props]);

	const handleTouchEnd = useCallback(
		e => {
			const { x, y } = getEventXY(e);
			const { top, left, bottom, right } = ref.getBoundingClientRect();
			if (x >= left && x <= right && y >= top && y <= bottom) {
				handleMouseEnter();
			}
		},
		[handleMouseEnter, ref]
	);

	const handleMouseLeave = () => {
		props.dispatchSetHoveredSprite(null);
	};
	const handleDrop = (dragInfo: any) => {
		if (dragInfo.dragType === DragConstants.COSTUME) {
			props.vm.shareCostumeToTarget(dragInfo.index, props.id);
		} else if (dragInfo.dragType === DragConstants.SOUND) {
			props.vm.shareSoundToTarget(dragInfo.index, props.id);
		} else if (dragInfo.dragType === DragConstants.BACKPACK_COSTUME) {
			props.vm.addCostume(
				dragInfo.payload.body,
				{
					name: dragInfo.payload.name,
				},
				props.id
			);
		} else if (dragInfo.dragType === DragConstants.BACKPACK_SOUND) {
			props.vm.addSound(
				{
					md5: dragInfo.payload.body,
					name: dragInfo.payload.name,
				},
				props.id
			);
		} else if (dragInfo.dragType === DragConstants.BACKPACK_CODE) {
			fetchCode(dragInfo.payload.bodyUrl).then((blocks: any) => {
				props.vm.shareBlocksToTarget(blocks, props.id);
				props.vm.refreshWorkspace();
			});
		}
	};

	const setFileInput = (input: any) => {
		fileInput = input;
	};

	const setRef = (refs: any) => {
		ref = refs;
	};

	useEffect(() => {
		document.addEventListener('touchend', handleTouchEnd);

		return () => {
			document.removeEventListener('touchend', handleTouchEnd);
		};
	}, [handleTouchEnd]);

	const componentProps = omit(props, [
		'asset',
		'dispatchSetHoveredSprite',
		'id',
		'intl',
		'onActivateTab',
		'onSelect',
		'onShowImporting',
		'onCloseImporting',
	]);

	return (
		<DroppableThrottledStage
			componentRef={setRef}
			fileInputRef={setFileInput}
			onBackdropFileUpload={handleBackdropUpload}
			onBackdropFileUploadClick={handleFileUploadClick}
			onClick={handleClick}
			onDrop={handleDrop}
			onEmptyBackdropClick={handleEmptyBackdrop}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onSurpriseBackdropClick={handleSurpriseBackdrop}
			{...componentProps}
		/>
	);
};

interface PropsInterface {
	id: string;
	intl: IntlShape;
	onCloseImporting: any;
	onSelect: any;
	onShowImporting: any;
	vm: any;
	onActivateTab: any;
	dispatchSetHoveredSprite: any;
	fileInputRef?: any;
	onBackdropFileUpload?: any;
	onBackdropFileUploadClick?: any;
	onClick?: any;
}

// TODO
// StageSelector.propTypes = {
//     ...StageSelectorComponent.propTypes,
//     id: PropTypes.string,
//     intl: intlShape.isRequired,
//     onCloseImporting: PropTypes.func,
//     onSelect: PropTypes.func,
//     onShowImporting: PropTypes.func
// };

const mapStateToProps = (state: any, { asset, id }: any) => ({
	url: asset && asset.encodeDataURI(),
	vm: state.scratchGui.vm,
	receivedBlocks:
		state.scratchGui.hoveredTarget.receivedBlocks && state.scratchGui.hoveredTarget.sprite === id,
	raised: state.scratchGui.blockDrag,
});

const mapDispatchToProps = (dispatch: any) => ({
	onNewBackdropClick: (e: any) => {
		e.stopPropagation();
		dispatch(openBackdropLibrary());
	},
	onActivateTab: (tabIndex: any) => {
		dispatch(activateTab(tabIndex));
	},
	dispatchSetHoveredSprite: (spriteId: any) => {
		dispatch(setHoveredSprite(spriteId));
	},
	onCloseImporting: () => dispatch(closeAlertWithId('importingAsset')),
	onShowImporting: () => dispatch(showStandardAlert('importingAsset')),
});

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(StageSelector));
