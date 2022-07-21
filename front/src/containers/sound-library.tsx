import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import VM from 'scratch-vm';
import AudioEngine from 'scratch-audio';

import LibraryComponent from '../components/library/library.jsx';

import soundIcon from '../components/library-item/lib-icon--sound.svg';
import soundIconRtl from '../components/library-item/lib-icon--sound-rtl.svg';

import soundLibraryContent from '../lib/libraries/sounds.json';
import soundTags from '../lib/libraries/sound-tags';

import {connect} from 'react-redux';

const messages = defineMessages({
    libraryTitle: {
        defaultMessage: 'Choose a Sound',
        description: 'Heading for the sound library',
        id: 'gui.soundLibrary.chooseASound'
    }
});

const SoundLibrary = (props) => {
    /**
         * AudioEngine that will decode and play sounds for us.
         * @type {AudioEngine}
         */
        let audioEngine = null;
        /**
         * A promise for the sound queued to play as soon as it loads and
         * decodes.
         * @type {Promise<SoundPlayer>}
         */
        let playingSoundPromise = null;

        /**
         * function to call when the sound ends
         */
        let handleStop = null;

    useEffect(() => {
        audioEngine = new AudioEngine();
        playingSoundPromise = null;
    
      return () => {
        stopPlayingSound();
      }
    }, []);
    
    const onStop = () => {
        if (playingSoundPromise !== null) {
            playingSoundPromise.then(soundPlayer =>
                soundPlayer && soundPlayer.removeListener('stop', onStop));
            if (handleStop) handleStop();
        }

    }
    const setStopHandler = (func) => {
        handleStop = func;
    }
    const stopPlayingSound = () => {
        // Playback is queued, playing, or has played recently and finished
        // normally.
        if (playingSoundPromise !== null) {
            // Forcing sound to stop, so stop listening for sound ending:
            playingSoundPromise.then(soundPlayer =>
                soundPlayer && soundPlayer.removeListener('stop', onStop));
            // Queued playback began playing before this method.
            if (playingSoundPromise.isPlaying) {
                // Fetch the player from the promise and stop playback soon.
                playingSoundPromise.then(soundPlayer => {
                    soundPlayer.stop();
                });
            } else {
                // Fetch the player from the promise and stop immediately. Since
                // the sound is not playing yet, this callback will be called
                // immediately after the sound starts playback. Stopping it
                // immediately will have the effect of no sound being played.
                playingSoundPromise.then(soundPlayer => {
                    if (soundPlayer) soundPlayer.stopImmediately();
                });
            }
            // No further work should be performed on this promise and its
            // soundPlayer.
            playingSoundPromise = null;
        }
    }
    const handleItemMouseEnter = (soundItem) => {
        const md5ext = soundItem._md5;
        const idParts = md5ext.split('.');
        const md5 = idParts[0];
        const vm = props.vm;

        // In case enter is called twice without a corresponding leave
        // inbetween, stop the last playback before queueing a new sound.
        stopPlayingSound();

        // Save the promise so code to stop the sound may queue the stop
        // instruction after the play instruction.
       playingSoundPromise = vm.runtime.storage.load(vm.runtime.storage.AssetType.Sound, md5)
            .then(soundAsset => {
                if (soundAsset) {
                    const sound = {
                        md5: md5ext,
                        name: soundItem.name,
                        format: soundItem.format,
                        data: soundAsset.data
                    };
                    return audioEngine.decodeSoundPlayer(sound)
                        .then(soundPlayer => {
                            soundPlayer.connect(audioEngine);
                            // Play the sound. Playing the sound will always come before a
                            // paired stop if the sound must stop early.
                            soundPlayer.play();
                            soundPlayer.addListener('stop', onStop);
                            // Set that the sound is playing. This affects the type of stop
                            // instruction given if the sound must stop early.
                            if (playingSoundPromise !== null) {
                                playingSoundPromise.isPlaying = true;
                            }
                            return soundPlayer;
                        });
                }
            });
    }
    const handleItemMouseLeave = () => {
        stopPlayingSound();
    }
    const handleItemSelected = (soundItem) => {
        const vmSound = {
            format: soundItem.format,
            md5: soundItem._md5,
            rate: soundItem.rate,
            sampleCount: soundItem.sampleCount,
            name: soundItem.name
        };
        props.vm.addSound(vmSound).then(() => {
            props.onNewSound();
        });
    }

    const soundLibraryThumbnailData = soundLibraryContent.map(sound => {
        const {
            md5ext,
            ...otherData
        } = sound;
        return {
            _md5: md5ext,
            rawURL: props.isRtl ? soundIconRtl : soundIcon,
            ...otherData
        };
    });


    return (
       <LibraryComponent
            showPlayButton
            data={soundLibraryThumbnailData}
            id="soundLibrary"
            setStopHandler={setStopHandler}
            tags={soundTags}
            title={props.intl.formatMessage(messages.libraryTitle)}
            onItemMouseEnter={handleItemMouseEnter}
            onItemMouseLeave={handleItemMouseLeave}
            onItemSelected={handleItemSelected}
            onRequestClose={props.onRequestClose}
        />
    );
};

SoundLibrary.propTypes = {
    intl: intlShape.isRequired,
    isRtl: PropTypes.bool,
    onNewSound: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func,
    vm: PropTypes.instanceOf(VM).isRequired
};

const mapStateToProps = state => ({
    isRtl: state.locales.isRtl
});

const mapDispatchToProps = () => ({});

export default injectIntl(connect(
    mapStateToProps,
    mapDispatchToProps
)(SoundLibrary));
