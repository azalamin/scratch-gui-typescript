import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import AudioTrimmerComponent from '../components/audio-trimmer/audio-trimmer.jsx';
import DragRecognizer from '../lib/drag-recognizer';

const MIN_LENGTH = 0.01; // Used to stop sounds being trimmed smaller than 1%

// class AudioTrimmer extends React.Component {
//     constructor (props) {
//         super(props);
//         bindAll(this, [
//             'handleTrimStartMouseDown',
//             'handleTrimEndMouseDown',
//             'handleTrimStartMouseMove',
//             'handleTrimEndMouseMove',
//             'storeRef'
//         ]);
//         this.trimStartDragRecognizer = new DragRecognizer({
//             onDrag: this.handleTrimStartMouseMove,
//             touchDragAngle: 90,
//             distanceThreshold: 0
//         });
//         this.trimEndDragRecognizer = new DragRecognizer({
//             onDrag: this.handleTrimEndMouseMove,
//             touchDragAngle: 90,
//             distanceThreshold: 0
//         });

//     }
//     handleTrimStartMouseMove (currentOffset, initialOffset) {
//         const dx = (currentOffset.x - initialOffset.x) / this.containerSize;
//         const newTrim = Math.max(0, Math.min(this.props.trimEnd - MIN_LENGTH, this.initialTrim + dx));
//         this.props.onSetTrimStart(newTrim);
//     }
//     handleTrimEndMouseMove (currentOffset, initialOffset) {
//         const dx = (currentOffset.x - initialOffset.x) / this.containerSize;
//         const newTrim = Math.min(1, Math.max(this.props.trimStart + MIN_LENGTH, this.initialTrim + dx));
//         this.props.onSetTrimEnd(newTrim);
//     }
//     handleTrimStartMouseDown (e) {
//         this.containerSize = this.containerElement.getBoundingClientRect().width;
//         this.trimStartDragRecognizer.start(e);
//         this.initialTrim = this.props.trimStart;
//         e.stopPropagation();
//         e.preventDefault();
//     }
//     handleTrimEndMouseDown (e) {
//         this.containerSize = this.containerElement.getBoundingClientRect().width;
//         this.trimEndDragRecognizer.start(e);
//         this.initialTrim = this.props.trimEnd;
//         e.stopPropagation();
//         e.preventDefault();
//     }
//     storeRef (el) {
//         this.containerElement = el;
//     }
//     render () {
//         return (
//             <AudioTrimmerComponent
//                 containerRef={this.storeRef}
//                 playhead={this.props.playhead}
//                 trimEnd={this.props.trimEnd}
//                 trimStart={this.props.trimStart}
//                 onTrimEndMouseDown={this.handleTrimEndMouseDown}
//                 onTrimStartMouseDown={this.handleTrimStartMouseDown}
//             />
//         );
//     }
// }

const AudioTrimmer = (props: PropsInterface) => {
  let containerElement = useRef();
  let containerSize: any;

  const trimStartDragRecognizer = new DragRecognizer({
    onDrag: handleTrimStartMouseMove,
    touchDragAngle: 90,
    distanceThreshold: 0,
  });

  const trimEndDragRecognizer = new DragRecognizer({
    onDrag: handleTrimEndMouseMove,
    touchDragAngle: 90,
    distanceThreshold: 0,
  });

  const handleTrimStartMouseMove = (currentOffset, initialOffset) => {
    const dx = (currentOffset.x - initialOffset.x) / containerSize;
    const newTrim = Math.max(
      0,
      Math.min(props.trimEnd - MIN_LENGTH, initialTrim + dx)
    );
    props.onSetTrimStart(newTrim);
  };
  const handleTrimEndMouseMove = (currentOffset, initialOffset) => {
    const dx = (currentOffset.x - initialOffset.x) / containerSize;
    const newTrim = Math.min(
      1,
      Math.max(props.trimStart + MIN_LENGTH, initialTrim + dx)
    );
    props.onSetTrimEnd(newTrim);
  };
  const handleTrimStartMouseDown = e => {
    containerSize = containerElement.getBoundingClientRect().width;
    trimStartDragRecognizer.start(e);
    initialTrim = props.trimStart;
    e.stopPropagation();
    e.preventDefault();
  };
  const handleTrimEndMouseDown = e => {
    containerSize = containerElement.getBoundingClientRect().width;
    trimEndDragRecognizer.start(e);
    initialTrim = props.trimEnd;
    e.stopPropagation();
    e.preventDefault();
  };
  const storeRef = el => {
    containerElement = el;
  };

  return (
    <AudioTrimmerComponent
      containerRef={storeRef}
      playhead={props.playhead}
      trimEnd={props.trimEnd}
      trimStart={props.trimStart}
      onTrimEndMouseDown={handleTrimEndMouseDown}
      onTrimStartMouseDown={handleTrimStartMouseDown}
    />
  );
};

interface PropsInterface {
  onSetTrimEnd: any;
  onSetTrimStart: any;
  playhead: number;
  trimEnd: number;
  trimStart: number;
}

export default AudioTrimmer;
