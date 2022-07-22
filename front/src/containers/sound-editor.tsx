import { useEffect, useState } from 'react';
import WavEncoder from 'wav-encoder';

import { connect } from 'react-redux';

import SoundEditorComponent from '../components/sound-editor/sound-editor.jsx';
import AudioBufferPlayer from '../lib/audio/audio-buffer-player.js';
import AudioEffects from '../lib/audio/audio-effects.js';
import {
  computeChunkedRMS,
  downsampleIfNeeded,
  dropEveryOtherSample,
  encodeAndAddSoundToVM,
} from '../lib/audio/audio-util.js';
import log from '../lib/log.js';

const UNDO_STACK_SIZE = 99;
const MAX_RMS = 1.2;

let audioBufferPlayer: any;

const SoundEditor = ({
  samples,
  sampleRate,
  soundId,
  isFullScreen,
  vm,
  soundIndex,
  name: propsName,
}: PropsInterface) => {
  const [states, setStates] = useState<any>({
    copyBuffer: null,
    chunkLevels: computeChunkedRMS(samples),
    playhead: null, // null is not playing, [0 -> 1] is playing percent
    trimStart: null,
    trimEnd: null,
  });
  const [newSoundId, setNewSoundId] = useState<any>(null);

  let redoStack: any = [];
  let undoStack: any = [];
  let ref: any = null;

  useEffect(() => {
    audioBufferPlayer = new AudioBufferPlayer(samples, sampleRate);
    document.addEventListener('keydown', handleKeyPress);

    if (newSoundId !== soundId) {
      // A different sound has been selected
      // eslint-disable-next-line react-hooks/exhaustive-deps
      redoStack = [];
      // eslint-disable-next-line react-hooks/exhaustive-deps
      undoStack = [];
      resetState(samples, sampleRate);
      setStates({
        ...states,
        trimStart: null,
        trimEnd: null,
      });
      setNewSoundId(soundId);
    }

    return () => {
      audioBufferPlayer.stop();
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [soundId, newSoundId]);

  const handleKeyPress = (event: any) => {
    if (event.target instanceof HTMLInputElement) {
      // Ignore keyboard shortcuts if a text input field is focused
      return;
    }
    if (isFullScreen) {
      // Ignore keyboard shortcuts if the stage is fullscreen mode
      return;
    }
    if (event.key === ' ') {
      event.preventDefault();
      if (states.playhead) {
        handleStopPlaying();
      } else {
        handlePlay();
      }
    }
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      if (event.shiftKey) {
        handleDeleteInverse();
      } else {
        handleDelete();
      }
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      handleUpdateTrim(null, null);
    }
    if (event.metaKey || event.ctrlKey) {
      if (event.shiftKey && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (redoStack.length > 0) {
          handleRedo();
        }
      } else if (event.key === 'z') {
        if (undoStack.length > 0) {
          event.preventDefault();
          handleUndo();
        }
      } else if (event.key === 'c') {
        event.preventDefault();
        handleCopy();
      } else if (event.key === 'v') {
        event.preventDefault();
        handlePaste();
      } else if (event.key === 'a') {
        event.preventDefault();
        handleUpdateTrim(0, 1);
      }
    }
  };
  const resetState = (newSamples: any, newSampleRate: any) => {
    audioBufferPlayer.stop();
    audioBufferPlayer = new AudioBufferPlayer(newSamples, newSampleRate);
    setStates({
      ...states,
      chunkLevels: computeChunkedRMS(newSamples),
      playhead: null,
    });
  };
  const submitNewSamples = (samples: any, sampleRate: any, skipUndo: any) => {
    return downsampleIfNeeded({ samples, sampleRate }, resampleBufferToRate)
      .then(({ samples: newSamples, sampleRate: newSampleRate }: any) =>
        WavEncoder.encode({
          sampleRate: newSampleRate,
          channelData: [newSamples],
        }).then((wavBuffer: any) => {
          if (!skipUndo) {
            redoStack = [];
            if (undoStack.length >= UNDO_STACK_SIZE) {
              undoStack.shift(); // Drop the first element off the array
            }
            undoStack.push(getUndoItem());
          }
          resetState(newSamples, newSampleRate);
          vm.updateSoundBuffer(
            soundIndex,
            audioBufferPlayer.buffer,
            new Uint8Array(wavBuffer)
          );
          return true; // Edit was successful
        })
      )
      .catch((e: any) => {
        // Encoding failed, or the sound was too large to save so edit is rejected
        log.error(
          `Encountered error while trying to encode sound update: ${e.message}`
        );
        return false; // Edit was not applied
      });
  };
  const handlePlay = () => {
    audioBufferPlayer.stop();
    audioBufferPlayer.play(
      states.trimStart || 0,
      states.trimEnd || 1,
      handleUpdatePlayhead,
      handleStoppedPlaying
    );
  };
  const handleStopPlaying = () => {
    audioBufferPlayer.stop();
    handleStoppedPlaying();
  };
  const handleStoppedPlaying = () => {
    setStates({ ...states, playhead: null });
  };
  const handleUpdatePlayhead = (playhead: any) => {
    setStates({ ...states, playhead });
  };
  const handleChangeName = (name: any) => {
    vm.renameSound(soundIndex, name);
  };
  const handleDelete = () => {
    const { samples: simplesD, sampleRate: sampleRateD } = copyCurrentBuffer();
    const sampleCount = simplesD.length;
    const startIndex = Math.floor(states.trimStart * sampleCount);
    const endIndex = Math.floor(states.trimEnd * sampleCount);
    const firstPart = simplesD.slice(0, startIndex);
    const secondPart = simplesD.slice(endIndex, sampleCount);
    const newLength = firstPart.length + secondPart.length;
    let newSamples;
    if (newLength === 0) {
      newSamples = new Float32Array(1);
    } else {
      newSamples = new Float32Array(newLength);
      newSamples.set(firstPart, 0);
      newSamples.set(secondPart, firstPart.length);
    }
    submitNewSamples(newSamples, sampleRateD, null).then(() => {
      setStates({
        ...states,
        trimStart: null,
        trimEnd: null,
      });
    });
  };
  const handleDeleteInverse = () => {
    // Delete everything outside of the trimmers
    const { samples: simplesDI, sampleRate: sampleRateDI } =
      copyCurrentBuffer();
    const sampleCount = simplesDI.length;
    const startIndex = Math.floor(states.trimStart * sampleCount);
    const endIndex = Math.floor(states.trimEnd * sampleCount);
    let clippedSamples = simplesDI.slice(startIndex, endIndex);
    if (clippedSamples.length === 0) {
      clippedSamples = new Float32Array(1);
    }
    submitNewSamples(clippedSamples, sampleRateDI, null).then(
      (success: any) => {
        if (success) {
          setStates({
            ...states,
            trimStart: null,
            trimEnd: null,
          });
        }
      }
    );
  };
  const handleUpdateTrim = (trimStartUpdate: any, trimEndUpdate: any) => {
    setStates({
      ...states,
      trimStart: trimStartUpdate,
      trimEnd: trimEndUpdate,
    });
    handleStopPlaying();
  };
  const effectFactory = (name: any) => {
    return () => handleEffect(name);
  };
  const copyCurrentBuffer = () => {
    // Cannot reliably use props.samples because it gets detached by Firefox
    return {
      samples: audioBufferPlayer.buffer.getChannelData(0),
      sampleRate: audioBufferPlayer.buffer.sampleRate,
    };
  };
  const handleEffect = (name: any) => {
    const trimStartEffect = states.trimStart === null ? 0.0 : states.trimStart;
    const trimEndEffect = states.trimEnd === null ? 1.0 : states.trimEnd;

    // Offline audio context needs at least 2 samples
    if (audioBufferPlayer.buffer.length < 2) {
      return;
    }

    const effects = new AudioEffects(
      audioBufferPlayer.buffer,
      name,
      trimStartEffect,
      trimEndEffect
    );
    effects.process(
      (renderedBuffer: any, adjustedTrimStart: any, adjustedTrimEnd: any) => {
        const samplesEffect = renderedBuffer.getChannelData(0);
        const sampleRateEffect = renderedBuffer.sampleRate;
        submitNewSamples(samplesEffect, sampleRateEffect, null).then(
          (success: any) => {
            if (success) {
              if (states.trimStart === null) {
                handlePlay();
              } else {
                setStates({
                  ...states,
                  trimStart: adjustedTrimStart,
                  trimEnd: adjustedTrimEnd,
                });
              }
            }
          }
        );
      }
    );
  };
  const tooLoud = () => {
    const numChunks = states.chunkLevels.length;
    const startIndex =
      states.trimStart === null ? 0 : Math.floor(states.trimStart * numChunks);
    const endIndex =
      states.trimEnd === null
        ? numChunks - 1
        : Math.ceil(states.trimEnd * numChunks);
    const trimChunks = states.chunkLevels.slice(startIndex, endIndex);
    return Math.max(...trimChunks) > MAX_RMS;
  };
  const getUndoItem = () => {
    return {
      ...copyCurrentBuffer(),
      trimStart: states.trimStart,
      trimEnd: states.trimEnd,
    };
  };
  const handleUndo = () => {
    redoStack.push(getUndoItem());
    const {
      samples: samplesUndo,
      sampleRate: sampleRateUndo,
      trimStart: trimStartUndo,
      trimEnd: trimEndUndo,
    } = undoStack.pop();
    if (samplesUndo) {
      return submitNewSamples(samplesUndo, sampleRateUndo, true).then(
        (success: any) => {
          if (success) {
            setStates({
              ...states,
              trimStart: trimStartUndo,
              trimEnd: trimEndUndo,
            });
          }
        }
      );
    }
  };
  const handleRedo = () => {
    const {
      samples: samplesRedo,
      sampleRate: sampleRateRedo,
      trimStart: trimStartRedo,
      trimEnd: trimEndRedo,
    } = redoStack.pop();
    if (samplesRedo) {
      undoStack.push(getUndoItem());
      return submitNewSamples(samplesRedo, sampleRateRedo, true).then(
        (success: any) => {
          if (success) {
            setStates({
              ...states,
              trimStart: trimStartRedo,
              trimEnd: trimEndRedo,
            });
          }
        }
      );
    }
  };
  const handleCopy = () => {
    copy();
  };
  const copy: any = (callback: any) => {
    const trimStartCopy = states.trimStart === null ? 0.0 : states.trimStart;
    const trimEndCopy = states.trimEnd === null ? 1.0 : states.trimEnd;

    const newCopyBuffer = copyCurrentBuffer();
    const trimStartSamples = trimStartCopy * newCopyBuffer.samples.length;
    const trimEndSamples = trimEndCopy * newCopyBuffer.samples.length;
    newCopyBuffer.samples = newCopyBuffer.samples.slice(
      trimStartSamples,
      trimEndSamples
    );

    setStates({
      ...states,
      copyBuffer: newCopyBuffer,
    });
  };
  const handleCopyToNew = () => {
    copy(() => {
      encodeAndAddSoundToVM(
        vm,
        states.copyBuffer.samples,
        states.copyBuffer.sampleRate,
        propsName
      );
    });
  };
  const resampleBufferToRate = (buffer: any, newRate: any) => {
    return new Promise((resolve, reject) => {
      const sampleRateRatio = newRate / buffer.sampleRate;
      const newLength = sampleRateRatio * buffer.samples.length;
      let offlineContext: any;
      // Try to use either OfflineAudioContext or webkitOfflineAudioContext to resample
      // The constructors will throw if trying to resample at an unsupported rate
      // (e.g. Safari/webkitOAC does not support lower than 44khz).
      try {
        if (window.OfflineAudioContext) {
          offlineContext = new window.OfflineAudioContext(
            1,
            newLength,
            newRate
          );
        }
        // else if (window.webkitOfflineAudioContext) {
        //   offlineContext = new window.webkitOfflineAudioContext(
        //     1,
        //     newLength,
        //     newRate
        //   );
        // }
      } catch {
        // If no OAC available and downsampling by 2, downsample by dropping every other sample.
        if (newRate === buffer.sampleRate / 2) {
          return resolve(dropEveryOtherSample(buffer));
        }
        return reject(new Error('Could not resample'));
      }
      const source = offlineContext.createBufferSource();
      const audioBuffer = offlineContext.createBuffer(
        1,
        buffer.samples.length,
        buffer.sampleRate
      );
      audioBuffer.getChannelData(0).set(buffer.samples);
      source.buffer = audioBuffer;
      source.connect(offlineContext.destination);
      source.start();
      offlineContext.startRendering();
      offlineContext.oncomplete = ({ renderedBuffer }: any) => {
        resolve({
          samples: renderedBuffer.getChannelData(0),
          sampleRate: newRate,
        });
      };
    });
  };
  const paste = () => {
    // If there's no selection, paste at the end of the sound
    const { samples: samplesPaste } = copyCurrentBuffer();
    if (states.trimStart === null) {
      const newLength = samples.length + states.copyBuffer.samples.length;
      const newSamples = new Float32Array(newLength);
      newSamples.set(samplesPaste, 0);
      newSamples.set(states.copyBuffer.samples, samplesPaste.length);
      submitNewSamples(newSamples, sampleRate, false).then((success: any) => {
        if (success) {
          handlePlay();
        }
      });
    } else {
      // else replace the selection with the pasted sound
      const trimStartSamples = states.trimStart * samplesPaste.length;
      const trimEndSamples = states.trimEnd * samplesPaste.length;
      const firstPart = samplesPaste.slice(0, trimStartSamples);
      const lastPart = samplesPaste.slice(trimEndSamples);
      const newLength =
        firstPart.length + states.copyBuffer.samples.length + lastPart.length;
      const newSamples = new Float32Array(newLength);
      newSamples.set(firstPart, 0);
      newSamples.set(states.copyBuffer.samples, firstPart.length);
      newSamples.set(
        lastPart,
        firstPart.length + states.copyBuffer.samples.length
      );

      const trimStartSeconds = trimStartSamples / sampleRate;
      const trimEndSeconds =
        trimStartSeconds +
        states.copyBuffer.samples.length / states.copyBuffer.sampleRate;
      const newDurationSeconds =
        newSamples.length / states.copyBuffer.sampleRate;
      const adjustedTrimStart = trimStartSeconds / newDurationSeconds;
      const adjustedTrimEnd = trimEndSeconds / newDurationSeconds;
      submitNewSamples(newSamples, sampleRate, false).then((success: any) => {
        if (success) {
          setStates({
            ...states,
            trimStart: adjustedTrimStart,
            trimEnd: adjustedTrimEnd,
          });
        }
      });
    }
  };
  const handlePaste = () => {
    if (!states.copyBuffer) return;
    if (states.copyBuffer.sampleRate === sampleRate) {
      paste();
    } else {
      resampleBufferToRate(states.copyBuffer, sampleRate).then(buffer => {
        setStates({
          ...states,
          copyBuffer: buffer,
        });
      });
    }
  };
  const setRef = (element: any) => {
    ref = element;
  };
  const handleContainerClick = (e: any) => {
    // If the click is on the sound editor's div (and not any other element), delesect
    if (e.target === ref && states.trimStart !== null) {
      handleUpdateTrim(null, null);
    }
  };

  const { effectTypes } = AudioEffects;
  return (
    <SoundEditorComponent
      canPaste={states.copyBuffer !== null}
      canRedo={redoStack.length > 0}
      canUndo={undoStack.length > 0}
      chunkLevels={states.chunkLevels}
      name={propsName}
      playhead={states.playhead}
      setRef={setRef}
      tooLoud={tooLoud()}
      trimEnd={states.trimEnd}
      trimStart={states.trimStart}
      onChangeName={handleChangeName}
      onContainerClick={handleContainerClick}
      onCopy={handleCopy}
      onCopyToNew={handleCopyToNew}
      onDelete={handleDelete}
      onEcho={effectFactory(effectTypes.ECHO)}
      onFadeIn={effectFactory(effectTypes.FADEIN)}
      onFadeOut={effectFactory(effectTypes.FADEOUT)}
      onFaster={effectFactory(effectTypes.FASTER)}
      onLouder={effectFactory(effectTypes.LOUDER)}
      onMute={effectFactory(effectTypes.MUTE)}
      onPaste={handlePaste}
      onPlay={handlePlay}
      onRedo={handleRedo}
      onReverse={effectFactory(effectTypes.REVERSE)}
      onRobot={effectFactory(effectTypes.ROBOT)}
      onSetTrim={handleUpdateTrim}
      onSlower={effectFactory(effectTypes.SLOWER)}
      onSofter={effectFactory(effectTypes.SOFTER)}
      onStop={handleStopPlaying}
      onUndo={handleUndo}
    />
  );
};

interface PropsInterface {
  isFullScreen: boolean;
  name: string;
  sampleRate: number;
  samples: any;
  soundId: string;
  soundIndex: number;
  vm: any;
}

// TODO
// SoundEditor.propTypes = {
//   isFullScreen: PropTypes.bool,
//   name: PropTypes.string.isRequired,
//   sampleRate: PropTypes.number,
//   samples: PropTypes.instanceOf(Float32Array),
//   soundId: PropTypes.string,
//   soundIndex: PropTypes.number,
//   vm: PropTypes.instanceOf(VM).isRequired,
// };

const mapStateToProps = (state, { soundIndex }) => {
  const sprite = state.scratchGui.vm.editingTarget.sprite;
  // Make sure the sound index doesn't go out of range.
  const index =
    soundIndex < sprite.sounds.length ? soundIndex : sprite.sounds.length - 1;
  const sound = state.scratchGui.vm.editingTarget.sprite.sounds[index];
  const audioBuffer = state.scratchGui.vm.getSoundBuffer(index);
  return {
    soundId: sound.soundId,
    sampleRate: audioBuffer.sampleRate,
    samples: audioBuffer.getChannelData(0),
    isFullScreen: state.scratchGui.mode.isFullScreen,
    name: sound.name,
    vm: state.scratchGui.vm,
  };
};

export default connect(mapStateToProps)(SoundEditor);
