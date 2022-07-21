import omit from 'lodash.omit';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import ThrottledPropertyHOC from '../lib/throttled-property-hoc.jsx';

import VM from 'scratch-vm';
import storage from '../lib/storage';
import getCostumeUrl from '../lib/get-costume-url';

import WatermarkComponent from '../components/watermark/watermark.jsx';

const Watermark = (props) => {
    const getCostumeData = () => {
        if (!props.asset) return null;

        return getCostumeUrl(props.asset);
    }

    const componentProps = omit(props, ['asset', 'vm']);
    return (
        <WatermarkComponent
            costumeURL={getCostumeData()}
            {...componentProps}
        />
    );
};

Watermark.propTypes = {
    asset: PropTypes.instanceOf(storage.Asset),
    vm: PropTypes.instanceOf(VM).isRequired
};

const mapStateToProps = state => {
    const targets = state.scratchGui.targets;
    const currentTargetId = targets.editingTarget;

    let asset;
    if (currentTargetId) {
        if (targets.stage.id === currentTargetId) {
            asset = targets.stage.costume.asset;
        } else if (targets.sprites.hasOwnProperty(currentTargetId)) {
            const currentSprite = targets.sprites[currentTargetId];
            asset = currentSprite.costume.asset;
        }
    }

    return {
        vm: state.scratchGui.vm,
        asset: asset
    };
};

const ConnectedComponent = connect(
    mapStateToProps
)(
    ThrottledPropertyHOC('asset', 500)(Watermark)
);

export default ConnectedComponent;
