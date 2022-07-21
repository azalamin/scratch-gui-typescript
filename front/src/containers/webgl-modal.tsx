import React from 'react';
import PropTypes from 'prop-types';

import WebGlModalComponent from '../components/webgl-modal/webgl-modal.jsx';

const WebGlModal = (props) => {
    const handleCancel = () => {
        window.history.back();
    }
    return (
        <WebGlModalComponent
            isRtl={props.isRtl}
            onBack={handleCancel}
        />
    );
};

WebGlModal.propTypes = {
    isRtl: PropTypes.bool
};

export default WebGlModal;
