import { defineMessages, injectIntl, IntlShape } from 'react-intl';

import spriteTags from '../lib/libraries/sprite-tags';
import spriteLibraryContent from '../lib/libraries/sprites.json';
import randomizeSpritePosition from '../lib/randomize-sprite-position';

import LibraryComponent from '../components/library/library.jsx';

const messages = defineMessages({
  libraryTitle: {
    defaultMessage: 'Choose a Sprite',
    description: 'Heading for the sprite library',
    id: 'gui.spriteLibrary.chooseASprite',
  },
});

const SpriteLibrary = (props: PropsInterface) => {
  const handleItemSelect = (item: any) => {
    // Randomize position of library sprite
    randomizeSpritePosition(item);
    props.vm.addSprite(JSON.stringify(item)).then(() => {
      props.onActivateBlocksTab();
    });
  };
  return (
    <LibraryComponent
      data={spriteLibraryContent}
      id='spriteLibrary'
      tags={spriteTags}
      title={props.intl.formatMessage(messages.libraryTitle)}
      onItemSelected={handleItemSelect}
      onRequestClose={props.onRequestClose}
    />
  );
};

interface PropsInterface {
  intl: IntlShape;
  onActivateBlocksTab: any;
  onRequestClose: any;
  vm: any;
}

// TODO
// SpriteLibrary.propTypes = {
//     intl: intlShape.isRequired,
//     onActivateBlocksTab: PropTypes.func.isRequired,
//     onRequestClose: PropTypes.func,
//     vm: PropTypes.instanceOf(VM).isRequired
// };

export default injectIntl(SpriteLibrary);
