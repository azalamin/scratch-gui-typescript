import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import bindAll from 'lodash.bindall';

import PlayButtonComponent from '../components/play-button/play-button.jsx';

const PlayButton = (props) => {
    const [touchStarted, setTouchStarted] = useState(false);
    let buttonRef = useRef();

    const getDerivedStateFromProps = (props, touchStarted) => {
        // if touchStarted is true and it's not playing, the sound must have ended.
        // reset the touchStarted state to allow the sound to be replayed
        if (touchStarted && !props.isPlaying) {
            return setTouchStarted(false);
        }
        return null; // nothing changed
    } 

    useEffect(() => {
       // Touch start
        buttonRef.addEventListener('touchstart', handleTouchStart);

        return () => {
            // this.buttonRef.removeEventListener('touchstart', this.handleTouchStart);
        }
    }, [handleTouchStart]);

    const handleClick = (e) => {
        //  stop the click from propagating out of the button
        e.stopPropagation();
    }
    const handleMouseDown = (e) => {
        // prevent default (focus) on mouseDown
        e.preventDefault();
        if (props.isPlaying) {
            // stop sound and reset touch state
            props.onStop();
            if (touchStarted) setTouchStarted(false);
        } else {
            props.onPlay();
            if (touchStarted) {
                // started on touch, but now clicked mouse
                setTouchStarted(false);
            }
        }
    }
    const handleTouchStart = (e) => {
        if (props.isPlaying) {
            // If playing, stop sound, and reset touch state
            e.preventDefault();
            setTouchStarted(false);
            props.onStop();
        } else {
            // otherwise start playing, and set touch state
            e.preventDefault();
            setTouchStarted(true);
            props.onPlay();
        }
    }
    const handleMouseEnter = (e) => {
        // start the sound if it's not already playing
        e.preventDefault();
        if (!props.isPlaying) {
           props.onPlay();
        }
    }
    const handleMouseLeave = () => {
        // stop the sound unless it was started by touch
        if (props.isPlaying && !touchStarted) {
            props.onStop();
        }
    }
    const setButtonRef = (ref) => {
        buttonRef = ref;
    }

     const {
            className,
            isPlaying,
            onPlay, // eslint-disable-line no-unused-vars
            onStop // eslint-disable-line no-unused-vars
        } = props;
    

    return (
        <PlayButtonComponent
            className={className}
            isPlaying={isPlaying}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            setButtonRef={setButtonRef}
        />
    );
};

PlayButton.propTypes = {
    className: PropTypes.string,
    isPlaying: PropTypes.bool.isRequired,
    onPlay: PropTypes.func.isRequired,
    onStop: PropTypes.func.isRequired
};

export default PlayButton;
