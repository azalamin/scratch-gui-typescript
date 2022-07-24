import { useEffect } from 'react';
import PlaybackStepComponent from '../components/record-modal/playback-step.jsx';
import AudioBufferPlayer from '../lib/audio/audio-buffer-player.js';

const PlaybackStep = (props: PropsInterface) => {
  let audioBufferPlayer: any;
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    audioBufferPlayer = new AudioBufferPlayer(props.samples, props.sampleRate);
    return () => {
      audioBufferPlayer.stop();
    };
  }, [props.samples, props.sampleRate, audioBufferPlayer]);

  const handlePlay = () => {
    audioBufferPlayer = new AudioBufferPlayer(props.samples, props.sampleRate);
    audioBufferPlayer.play(
      props.trimStart,
      props.trimEnd,
      props.onSetPlayhead,
      props.onStopPlaying
    );
    props.onPlay();
  };

  const handleStopPlaying = () => {
    audioBufferPlayer.stop();
    props.onStopPlaying();
  };

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

interface PropsInterface {
  sampleRate: number;
  samples: any;
  trimStart: any;
  trimEnd: any;
  onSetPlayhead: any;
  onStopPlaying: any;
  onPlay: any;
  encoding?: any;
  levels?: any;
  playhead?: any;
  playing?: any;
  onBack?: any;
  onSetTrimEnd?: any;
  onSetTrimStart?: any;
  onSubmit?: any;
  // ...PlaybackStepComponent.propTypes
}

// TODO
// PlaybackStep.propTypes = {
//     sampleRate: PropTypes.number.isRequired,
//     samples: PropTypes.instanceOf(Float32Array).isRequired,
//     ...PlaybackStepComponent.propTypes
// };

export default PlaybackStep;
