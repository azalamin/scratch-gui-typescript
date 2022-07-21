import PropTypes from 'prop-types';
import React from 'react';
import VM from 'scratch-vm';
import PaintEditor from 'scratch-paint';
import {inlineSvgFonts} from 'scratch-svg-renderer';

import {connect} from 'react-redux';


const PaintEditorWrapper = (props) => {

    const handleUpdateName = (name) => {
         props.vm.renameCostume( props.selectedCostumeIndex, name);
    }

    const handleUpdateImage = (isVector, image, rotationCenterX, rotationCenterY) => {
        if (isVector) {
             props.vm.updateSvg(
                 props.selectedCostumeIndex,
                image,
                rotationCenterX,
                rotationCenterY);
        } else {
             props.vm.updateBitmap(
                 props.selectedCostumeIndex,
                image,
                rotationCenterX,
                rotationCenterY,
                2 /* bitmapResolution */);
        }
    };

    if (! props.imageId) return null;
    const {
            selectedCostumeIndex,
            vm,
            ...componentProps
    } = props;


    return (
        <PaintEditor
            {...componentProps}
            image={vm.getCostume(selectedCostumeIndex)}
            onUpdateImage={ handleUpdateImage}
            onUpdateName={ handleUpdateName}
            fontInlineFn={inlineSvgFonts}
        />
    );
};


PaintEditorWrapper.propTypes = {
    imageFormat: PropTypes.string.isRequired,
    imageId: PropTypes.string.isRequired,
    name: PropTypes.string,
    rotationCenterX: PropTypes.number,
    rotationCenterY: PropTypes.number,
    rtl: PropTypes.bool,
    selectedCostumeIndex: PropTypes.number.isRequired,
    vm: PropTypes.instanceOf(VM)
};

const mapStateToProps = (state, {selectedCostumeIndex}) => {
    const targetId = state.scratchGui.vm.editingTarget.id;
    const sprite = state.scratchGui.vm.editingTarget.sprite;
    // Make sure the costume index doesn't go out of range.
    const index = selectedCostumeIndex < sprite.costumes.length ?
        selectedCostumeIndex : sprite.costumes.length - 1;
    const costume = state.scratchGui.vm.editingTarget.sprite.costumes[index];
    return {
        name: costume && costume.name,
        rotationCenterX: costume && costume.rotationCenterX,
        rotationCenterY: costume && costume.rotationCenterY,
        imageFormat: costume && costume.dataFormat,
        imageId: targetId && `${targetId}${costume.skinId}`,
        rtl: state.locales.isRtl,
        selectedCostumeIndex: index,
        vm: state.scratchGui.vm,
        zoomLevelId: targetId
    };
};

export default React.memo(connect(
    mapStateToProps
)(PaintEditorWrapper));
