import PropTypes from 'prop-types';
import React from 'react';

import TagButtonComponent from '../components/tag-button/tag-button.jsx';

const TagButton = (props) => {
    const handleClick = () => {
        props.onClick(props.tag);
    }

    return (
        <TagButtonComponent
            {...props}
            onClick={handleClick}
        />
    );
};

TagButton.propTypes = {
    ...TagButtonComponent.propTypes,
    onClick: PropTypes.func
};

export default TagButton;
