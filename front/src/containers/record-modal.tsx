import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import VM from 'scratch-vm';
import {connect} from 'react-redux';
import {encodeAndAddSoundToVM} from '../lib/audio/audio-util.js';

import RecordModalComponent from '../components/record-modal/record-modal.jsx';

import {
    closeSoundRecorder
} from '../reducers/modals';


const RecordModal = (props) => {
    const [states, setStates] = useState({
            samples: null,
            encoding: false,
            levels: null,
            playhead: null,
            playing: false,
            recording: false,
            sampleRate: null,
            trimStart: 0,
            trimEnd: 1
    });

    const handleRecord = () => {
         setStates({...states, recording: true});
    }
    const handleStopRecording = (samples, sampleRate, levels, trimStart, trimEnd) => {
        if (samples.length > 0) {
             setStates({...states, samples, sampleRate, levels, trimStart, trimEnd, recording: false});
        }
    }
    const handlePlay = () => {
         setStates({...states, playing: true});
    }
    const handleStopPlaying = () => {
         setStates({...states, playing: false, playhead: null});
    }
    const handleBack = () => {
         setStates({...states, playing: false, samples: null});
    }
    const handleSetTrimEnd = (trimEnd) => {
         setStates({...states, trimEnd});
    }
    const handleSetTrimStart = (trimStart) => {
         setStates({...states, trimStart});
    }
    const handleSetPlayhead = (playhead) => {
         setStates({...states, playhead});
    }
    let clippedSamples
    const handleSubmit = () => {
         const sampleCount =  states.samples.length;
         const startIndex = Math.floor( states.trimStart * sampleCount);
         const endIndex = Math.floor( states.trimEnd * sampleCount);
         clippedSamples =  states.samples.slice(startIndex, endIndex);
         setStates({...states, encoding: true});
    }

    useEffect(() => {
        if(states.encoding)
            encodeAndAddSoundToVM( props.vm, clippedSamples,  states.sampleRate, 'recording1',
                () => {
                     props.onClose();
                     props.onNewSound();
                });
    }, [states.encoding]);

    const handleCancel = () => {
         props.onClose();
    }

    return (
       <RecordModalComponent
            encoding={ states.encoding}
            levels={ states.levels}
            playhead={ states.playhead}
            playing={ states.playing}
            recording={ states.recording}
            sampleRate={ states.sampleRate}
            samples={ states.samples}
            trimEnd={ states.trimEnd}
            trimStart={ states.trimStart}
            onBack={ handleBack}
            onCancel={ handleCancel}
            onPlay={ handlePlay}
            onRecord={ handleRecord}
            onSetPlayhead={ handleSetPlayhead}
            onSetTrimEnd={ handleSetTrimEnd}
            onSetTrimStart={ handleSetTrimStart}
            onStopPlaying={ handleStopPlaying}
            onStopRecording={ handleStopRecording}
            onSubmit={ handleSubmit}
        />
    );
};


RecordModal.propTypes = {
    onClose: PropTypes.func,
    onNewSound: PropTypes.func,
    vm: PropTypes.instanceOf(VM)
};

const mapStateToProps = state => ({
    vm: state.scratchGui.vm
});

const mapDispatchToProps = dispatch => ({
    onClose: () => {
        dispatch(closeSoundRecorder());
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RecordModal);
