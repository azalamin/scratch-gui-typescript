import { defineMessages, injectIntl, IntlShape } from 'react-intl';

import LibraryComponent from '../components/library/library';
import costumeLibraryContent from '../lib/libraries/costumes.json';
import spriteTags from '../lib/libraries/sprite-tags';

const messages = defineMessages({
	libraryTitle: {
		defaultMessage: 'Choose a Costume',
		description: 'Heading for the costume library',
		id: 'gui.costumeLibrary.chooseACostume',
	},
});

const CostumeLibrary = (props: PropsInterface) => {
	const handleItemSelected = (item: any) => {
		const vmCostume = {
			name: item.name,
			rotationCenterX: item.rotationCenterX,
			rotationCenterY: item.rotationCenterY,
			bitmapResolution: item.bitmapResolution,
			skinId: null,
		};
		props.vm.addCostumeFromLibrary(item.md5ext, vmCostume);
	};
	return (
		<LibraryComponent
			data={costumeLibraryContent}
			id='costumeLibrary'
			tags={spriteTags}
			title={props.intl.formatMessage(messages.libraryTitle, '', '', '', '')}
			onItemSelected={handleItemSelected}
			onRequestClose={props.onRequestClose}
		/>
	);
};

interface PropsInterface {
	intl: IntlShape;
	onRequestClose: any;
	vm: any;
}

export default injectIntl(CostumeLibrary);
