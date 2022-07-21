import { defineMessages, injectIntl } from 'react-intl';

import extensionLibraryContent from '../lib/libraries/extensions/index.jsx';

import extensionIcon from '../components/action-menu/icon--sprite.svg';
import LibraryComponent from '../components/library/library.jsx';

const messages = defineMessages({
  extensionTitle: {
    defaultMessage: 'Choose an Extension',
    description: 'Heading for the extension library',
    id: 'gui.extensionLibrary.chooseAnExtension',
  },
  extensionUrl: {
    defaultMessage: 'Enter the URL of the extension',
    description: 'Prompt for unoffical extension url',
    id: 'gui.extensionLibrary.extensionUrl',
  },
});

const ExtensionLibrary = (props: PropsInterface) => {
  extensionLibraryContent.forEach((extension: any) => {
    if (extension.translationMap) {
      Object.assign(
        props.intl.messages,
        extension.translationMap[props.intl.locale]
      );
    }
  });

  const handleItemSelect = (item: any) => {
    const id = item.extensionId;
    let url = item.extensionURL ? item.extensionURL : id;
    if (!item.disabled && !id) {
      // eslint-disable-next-line no-alert
      url = prompt(props.intl.formatMessage(messages.extensionUrl));
    }
    if (id && !item.disabled) {
      if (props.vm.extensionManager.isExtensionLoaded(url)) {
        props.onCategorySelected(id);
      } else {
        props.vm.extensionManager.loadExtensionURL(url).then(() => {
          props.onCategorySelected(id);
        });
      }
    }
  };

  const extensionLibraryThumbnailData = extensionLibraryContent.map(
    (extension: any) => ({
      rawURL: extension.iconURL || extensionIcon,
      ...extension,
    })
  );

  return (
    <LibraryComponent
      data={extensionLibraryThumbnailData}
      filterable={false}
      id='extensionLibrary'
      title={props.intl.formatMessage(messages.extensionTitle)}
      visible={props.visible}
      onItemSelected={handleItemSelect}
      onRequestClose={props.onRequestClose}
    />
  );
};

interface PropsInterface {
  intl: any; // todo
  onCategorySelected: any;
  onRequestClose: any;
  visible: boolean;
  vm: any; // eslint-disable-line react/no-unused-prop-types
}

export default injectIntl(ExtensionLibrary);
