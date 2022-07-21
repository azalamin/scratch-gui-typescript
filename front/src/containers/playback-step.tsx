import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import PlaybackStepComponent from '../components/record-modal/playback-step.jsx';
import AudioBufferPlayer from '../lib/audio/audio-buffer-player.js';

const PlaybackStep = (props) => {
    let audioBufferPlayer
    useEffect(() => {
         audioBufferPlayer = new AudioBufferPlayer( props.samples,  props.sampleRate);
        return () => {
            audioBufferPlayer.stop();
        }
    }, [props.samples,  props.sampleRate, audioBufferPlayer]);
    
    const handlePlay = () => {
        audioBufferPlayer = new AudioBufferPlayer( props.samples,  props.sampleRate);
         audioBufferPlayer.play(
             props.trimStart,
             props.trimEnd,
             props.onSetPlayhead,
             props.onStopPlaying
        );
        props.onPlay();
    }

    const handleStopPlaying = () => {
         audioBufferPlayer.stop();
         props.onStopPlaying();
    }

    const {
            sampleRate, // eslint-disable-line no-unused-vars
            onPlay, // eslint-disable-line no-unused-vars
            onStopPlaying, // eslint-disable-line no-unused-vars
            onSetPlayhead, // eslint-disable-line no-unused-vars
            ...componentProps
        } = props;
    
    return (
            <PlaybackStepComponent
                onPlay={handlePlay}
                onStopPlaying={handleStopPlaying}
                {...componentProps}
            />
        );
};



PlaybackStep.propTypes = {
    sampleRate: PropTypes.number.isRequired,
    samples: PropTypes.instanceOf(Float32Array).isRequired,
    ...PlaybackStepComponent.propTypes
};

export default PlaybackStep;
