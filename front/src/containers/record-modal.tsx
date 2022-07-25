import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { encodeAndAddSoundToVM } from '../lib/audio/audio-util';

import RecordModalComponent from '../components/record-modal/record-modal';

import { closeSoundRecorder } from '../reducers/modals';

const RecordModal = (props: PropsInterface) => {
  const [states, setStates] = useState<any>({
    samples: null,
    encoding: false,
    levels: null,
    playhead: null,
    playing: false,
    recording: false,
    sampleRate: null,
    trimStart: 0,
    trimEnd: 1,
  });

  const handleRecord = () => {
    setStates({ ...states, recording: true });
  };
  const handleStopRecording = (
    samples: any,
    sampleRate: any,
    levels: any,
    trimStart: any,
    trimEnd: any
  ) => {
    if (samples.length > 0) {
      setStates({
        ...states,
        samples,
        sampleRate,
        levels,
        trimStart,
        trimEnd,
        recording: false,
      });
    }
  };
  const handlePlay = () => {
    setStates({ ...states, playing: true });
  };
  const handleStopPlaying = () => {
    setStates({ ...states, playing: false, playhead: null });
  };
  const handleBack = () => {
    setStates({ ...states, playing: false, samples: null });
  };
  const handleSetTrimEnd = (trimEnd: any) => {
    setStates({ ...states, trimEnd });
  };
  const handleSetTrimStart = (trimStart: any) => {
    setStates({ ...states, trimStart });
  };
  const handleSetPlayhead = (playhead: any) => {
    setStates({ ...states, playhead });
  };
  let clippedSamples: any;
  const handleSubmit = () => {
    const sampleCount = states.samples.length;
    const startIndex = Math.floor(states.trimStart * sampleCount);
    const endIndex = Math.floor(states.trimEnd * sampleCount);
    clippedSamples = states.samples.slice(startIndex, endIndex);
    setStates({ ...states, encoding: true });
  };

  useEffect(() => {
    if (states.encoding)
      encodeAndAddSoundToVM(
        props.vm,
        clippedSamples,
        states.sampleRate,
        'recording1',
        () => {
          props.onClose();
          props.onNewSound();
        }
      );
  }, [clippedSamples, props, states.encoding, states.sampleRate]);

  const handleCancel = () => {
    props.onClose();
  };

  return (
    <RecordModalComponent
      encoding={states.encoding}
      levels={states.levels}
      playhead={states.playhead}
      playing={states.playing}
      recording={states.recording}
      sampleRate={states.sampleRate}
      samples={states.samples}
      trimEnd={states.trimEnd}
      trimStart={states.trimStart}
      onBack={handleBack}
      onCancel={handleCancel}
      onPlay={handlePlay}
      onRecord={handleRecord}
      onSetPlayhead={handleSetPlayhead}
      onSetTrimEnd={handleSetTrimEnd}
      onSetTrimStart={handleSetTrimStart}
      onStopPlaying={handleStopPlaying}
      onStopRecording={handleStopRecording}
      onSubmit={handleSubmit}
    />
  );
};

interface PropsInterface {
  onClose: any;
  onNewSound: any;
  vm: any;
}

// TODO
// RecordModal.propTypes = {
//     onClose: PropTypes.func,
//     onNewSound: PropTypes.func,
//     vm: PropTypes.instanceOf(VM)
// };

const mapStateToProps = (state: any) => ({
  vm: state.scratchGui.vm,
});

const mapDispatchToProps = (dispatch: any) => ({
  onClose: () => {
    dispatch(closeSoundRecorder());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(RecordModal);
