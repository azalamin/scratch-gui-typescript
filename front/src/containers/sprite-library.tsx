import PropTypes from 'prop-types';
import React from 'react';
import {injectIntl, intlShape, defineMessages} from 'react-intl';
import VM from 'scratch-vm';

import spriteLibraryContent from '../lib/libraries/sprites.json';
import randomizeSpritePosition from '../lib/randomize-sprite-position';
import spriteTags from '../lib/libraries/sprite-tags';

import LibraryComponent from '../components/library/library.jsx';

const messages = defineMessages({
    libraryTitle: {
        defaultMessage: 'Choose a Sprite',
        description: 'Heading for the sprite library',
        id: 'gui.spriteLibrary.chooseASprite'
    }
});

const SpriteLibrary = (props) => {
    const handleItemSelect = (item) => {
        // Randomize position of library sprite
        randomizeSpritePosition(item);
        props.vm.addSprite(JSON.stringify(item)).then(() => {
            props.onActivateBlocksTab();
        });
    }
    return (
        <LibraryComponent
            data={spriteLibraryContent}
            id="spriteLibrary"
            tags={spriteTags}
            title={props.intl.formatMessage(messages.libraryTitle)}
            onItemSelected={handleItemSelect}
            onRequestClose={props.onRequestClose}
        />
    );
};

SpriteLibrary.propTypes = {
    intl: intlShape.isRequired,
    onActivateBlocksTab: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func,
    vm: PropTypes.instanceOf(VM).isRequired
};

export default injectIntl(SpriteLibrary);
