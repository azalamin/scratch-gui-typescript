import { useEffect } from 'react';
import { defineMessages, injectIntl, IntlShape } from 'react-intl';
import AudioEngine from 'scratch-audio';

import LibraryComponent from '../components/library/library';

import soundIconRtl from '../components/library-item/lib-icon--sound-rtl.svg';
import soundIcon from '../components/library-item/lib-icon--sound.svg';

import soundTags from '../lib/libraries/sound-tags';
import soundLibraryContent from '../lib/libraries/sounds.json';

import { connect } from 'react-redux';

const messages = defineMessages({
	libraryTitle: {
		defaultMessage: 'Choose a Sound',
		description: 'Heading for the sound library',
		id: 'gui.soundLibrary.chooseASound',
	},
});

const SoundLibrary = (props: PropsInterface) => {
	/**
	 * AudioEngine that will decode and play sounds for us.
	 * @type {AudioEngine}
	 */
	let audioEngine: any = null;
	/**
	 * A promise for the sound queued to play as soon as it loads and
	 * decodes.
	 * @type {Promise<SoundPlayer>}
	 */
	let playingSoundPromise: any = null;

	/**
	 * function to call when the sound ends
	 */
	let handleStop: any = null;

	useEffect(() => {
		audioEngine = new AudioEngine();
		playingSoundPromise = null;

		return () => {
			stopPlayingSound();
		};
	}, []);

	const onStop = () => {
		if (playingSoundPromise !== null) {
			playingSoundPromise.then(
				(soundPlayer: any) => soundPlayer && soundPlayer.removeListener('stop', onStop)
			);
			if (handleStop) handleStop();
		}
	};
	const setStopHandler = (func: any) => {
		handleStop = func;
	};
	const stopPlayingSound = () => {
		// Playback is queued, playing, or has played recently and finished
		// normally.
		if (playingSoundPromise !== null) {
			// Forcing sound to stop, so stop listening for sound ending:
			playingSoundPromise.then(
				(soundPlayer: any) => soundPlayer && soundPlayer.removeListener('stop', onStop)
			);
			// Queued playback began playing before this method.
			if (playingSoundPromise.isPlaying) {
				// Fetch the player from the promise and stop playback soon.
				playingSoundPromise.then((soundPlayer: any) => {
					soundPlayer.stop();
				});
			} else {
				// Fetch the player from the promise and stop immediately. Since
				// the sound is not playing yet, this callback will be called
				// immediately after the sound starts playback. Stopping it
				// immediately will have the effect of no sound being played.
				playingSoundPromise.then((soundPlayer: any) => {
					if (soundPlayer) soundPlayer.stopImmediately();
				});
			}
			// No further work should be performed on this promise and its
			// soundPlayer.
			playingSoundPromise = null;
		}
	};
	const handleItemMouseEnter = (soundItem: any) => {
		const md5ext = soundItem._md5;
		const idParts = md5ext.split('.');
		const md5 = idParts[0];
		const vm = props.vm;

		// In case enter is called twice without a corresponding leave
		// inbetween, stop the last playback before queueing a new sound.
		stopPlayingSound();

		// Save the promise so code to stop the sound may queue the stop
		// instruction after the play instruction.
		playingSoundPromise = vm.runtime.storage
			.load(vm.runtime.storage.AssetType.Sound, md5)
			.then((soundAsset: any) => {
				if (soundAsset) {
					const sound = {
						md5: md5ext,
						name: soundItem.name,
						format: soundItem.format,
						data: soundAsset.data,
					};
					return audioEngine.decodeSoundPlayer(sound).then((soundPlayer: any) => {
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
	};
	const handleItemMouseLeave = () => {
		stopPlayingSound();
	};
	const handleItemSelected = (soundItem: any) => {
		const vmSound = {
			format: soundItem.format,
			md5: soundItem._md5,
			rate: soundItem.rate,
			sampleCount: soundItem.sampleCount,
			name: soundItem.name,
		};
		props.vm.addSound(vmSound).then(() => {
			props.onNewSound();
		});
	};

	const soundLibraryThumbnailData = soundLibraryContent.map((sound: any) => {
		const { md5ext, ...otherData } = sound;
		return {
			_md5: md5ext,
			rawURL: props.isRtl ? soundIconRtl : soundIcon,
			...otherData,
		};
	});

	return (
		<LibraryComponent
			showPlayButton
			data={soundLibraryThumbnailData}
			id='soundLibrary'
			setStopHandler={setStopHandler}
			tags={soundTags}
			title={props.intl.formatMessage(messages.libraryTitle, '', '', '', '')}
			onItemMouseEnter={handleItemMouseEnter}
			onItemMouseLeave={handleItemMouseLeave}
			onItemSelected={handleItemSelected}
			onRequestClose={props.onRequestClose}
		/>
	);
};

interface PropsInterface {
	intl: IntlShape;
	isRtl: boolean;
	onNewSound: any;
	onRequestClose: any;
	vm: any;
}

// TODO
// SoundLibrary.propTypes = {
//     intl: intlShape.isRequired,
//     isRtl: PropTypes.bool,
//     onNewSound: PropTypes.func.isRequired,
//     onRequestClose: PropTypes.func,
//     vm: PropTypes.instanceOf(VM).isRequired
// };

const mapStateToProps = (state: any) => ({
	isRtl: state.locales.isRtl,
});

const mapDispatchToProps = () => ({});

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(SoundLibrary));
