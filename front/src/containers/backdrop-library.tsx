import { defineMessages, injectIntl, IntlShape } from 'react-intl';

import LibraryComponent from '../components/library/library';
import backdropTags from '../lib/libraries/backdrop-tags';
import backdropLibraryContent from '../lib/libraries/backdrops.json';

const messages = defineMessages({
	libraryTitle: {
		defaultMessage: 'Choose a Backdrop',
		description: 'Heading for the backdrop library',
		id: 'gui.costumeLibrary.chooseABackdrop',
	},
});

const BackdropLibrary = (props: PropsInterface) => {
	const handleItemSelect = (item: any) => {
		const vmBackdrop = {
			name: item.name,
			rotationCenterX: item.rotationCenterX,
			rotationCenterY: item.rotationCenterY,
			bitmapResolution: item.bitmapResolution,
			skinId: null,
		};
		// Do not switch to stage, just add the backdrop
		props.vm.addBackdrop(item.md5ext, vmBackdrop);
	};

	return (
		<LibraryComponent
			data={backdropLibraryContent}
			id='backdropLibrary'
			tags={backdropTags}
			title={props.intl.formatMessage(messages.libraryTitle, '', '', '', '')?.message}
			onItemSelected={handleItemSelect}
			onRequestClose={props.onRequestClose}
		/>
	);
};

interface PropsInterface {
	intl: IntlShape;
	onRequestClose: any;
	vm: any;
}

export default injectIntl(BackdropLibrary);
