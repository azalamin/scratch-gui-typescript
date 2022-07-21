import PropTypes from 'prop-types';
import React from 'react';

import SpriteInfoComponent from '../components/sprite-info/sprite-info.jsx';

const SpriteInfo = (props) => {
    const handleClickVisible = (e) => {
        e.preventDefault();
         props.onChangeVisibility(true);
    }
    const handleClickNotVisible = (e) => {
        e.preventDefault();
         props.onChangeVisibility(false);
    }
    const handlePressVisible = (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
             props.onChangeVisibility(true);
        }
    }
    const handlePressNotVisible = (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
             props.onChangeVisibility(false);
        }
    }
    return (
        <SpriteInfoComponent
            {... props}
            onClickNotVisible={ handleClickNotVisible}
            onClickVisible={ handleClickVisible}
            onPressNotVisible={ handlePressNotVisible}
            onPressVisible={ handlePressVisible}
        />
    );
};

SpriteInfo.propTypes = {
    ...SpriteInfoComponent.propTypes,
    onChangeDirection: PropTypes.func,
    onChangeName: PropTypes.func,
    onChangeSize: PropTypes.func,
    onChangeVisibility: PropTypes.func,
    onChangeX: PropTypes.func,
    onChangeY: PropTypes.func,
    x: PropTypes.number,
    y: PropTypes.number
};

export default SpriteInfo;
