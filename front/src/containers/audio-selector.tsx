import { ChangeEvent, useEffect, useState } from 'react';
import AudioSelectorComponent from '../components/audio-trimmer/audio-selector.jsx';
import DragRecognizer from '../lib/drag-recognizer';
import { getEventXY } from '../lib/touch-utils';

const MIN_LENGTH = 0.01;
const MIN_DURATION = 500;

// class AudioSelector extends React.Component {
//     constructor (props) {
//         super(props);
//         bindAll(this, [
//             'handleNewSelectionMouseDown',
//             'handleTrimStartMouseDown',
//             'handleTrimEndMouseDown',
//             'handleTrimStartMouseMove',
//             'handleTrimEndMouseMove',
//             'handleTrimStartMouseUp',
//             'handleTrimEndMouseUp',
//             'storeRef'
//         ]);

//         this.state = {
//             trimStart: props.trimStart,
//             trimEnd: props.trimEnd
//     };

//         this.clickStartTime = 0;

//         this.trimStartDragRecognizer = new DragRecognizer({
//             onDrag: this.handleTrimStartMouseMove,
//             onDragEnd: this.handleTrimStartMouseUp,
//             touchDragAngle: 90,
//             distanceThreshold: 0
//         });
//         this.trimEndDragRecognizer = new DragRecognizer({
//             onDrag: this.handleTrimEndMouseMove,
//             onDragEnd: this.handleTrimEndMouseUp,
//             touchDragAngle: 90,
//             distanceThreshold: 0
//         });
//     }
//     componentWillReceiveProps (newProps) {
//         const {trimStart, trimEnd} = this.props;
//         if (newProps.trimStart === trimStart && newProps.trimEnd === trimEnd) return;
//         this.setState({
//             trimStart: newProps.trimStart,
//             trimEnd: newProps.trimEnd
//         });
//     }
//     clearSelection () {
//         this.props.onSetTrim(null, null);
//     }
//     handleNewSelectionMouseDown (e) {
//         const {width, left} = this.containerElement.getBoundingClientRect();
//         this.initialTrimEnd = (getEventXY(e).x - left) / width;
//         this.initialTrimStart = this.initialTrimEnd;
//         this.props.onSetTrim(this.initialTrimStart, this.initialTrimEnd);

//         this.clickStartTime = Date.now();

//         this.containerSize = width;
//         this.trimEndDragRecognizer.start(e);

//         e.preventDefault();
//     }
//     handleTrimStartMouseMove (currentOffset, initialOffset) {
//         const dx = (currentOffset.x - initialOffset.x) / this.containerSize;
//         const newTrim = Math.max(0, Math.min(1, this.initialTrimStart + dx));
//         if (newTrim > this.initialTrimEnd) {
//             this.setState({
//                 trimStart: this.initialTrimEnd,
//                 trimEnd: newTrim
//             });
//         } else {
//             this.setState({
//                 trimStart: newTrim,
//                 trimEnd: this.initialTrimEnd
//             });
//         }
//     }
//     handleTrimEndMouseMove (currentOffset, initialOffset) {
//         const dx = (currentOffset.x - initialOffset.x) / this.containerSize;
//         const newTrim = Math.min(1, Math.max(0, this.initialTrimEnd + dx));
//         if (newTrim < this.initialTrimStart) {
//             this.setState({
//                 trimStart: newTrim,
//                 trimEnd: this.initialTrimStart
//             });
//         } else {
//             this.setState({
//                 trimStart: this.initialTrimStart,
//                 trimEnd: newTrim
//             });
//         }
//     }
//     handleTrimStartMouseUp () {
//         this.props.onSetTrim(this.state.trimStart, this.state.trimEnd);
//     }
//     handleTrimEndMouseUp () {
//         // If the selection was made quickly (tooFast) and is small (tooShort),
//         // deselect instead. This allows click-to-deselect even if you drag
//         // a little bit by accident. It also allows very quickly making a
//         // selection, as long as it is above a minimum length.
//         const tooFast = (Date.now() - this.clickStartTime) < MIN_DURATION;
//         const tooShort = (this.state.trimEnd - this.state.trimStart) < MIN_LENGTH;
//         if (tooFast && tooShort) {
//             this.clearSelection();
//         } else {
//             this.props.onSetTrim(this.state.trimStart, this.state.trimEnd);
//         }
//     }
//     handleTrimStartMouseDown (e) {
//         this.containerSize = this.containerElement.getBoundingClientRect().width;
//         this.trimStartDragRecognizer.start(e);
//         this.initialTrimStart = this.props.trimStart;
//         this.initialTrimEnd = this.props.trimEnd;
//         e.stopPropagation();
//         e.preventDefault();
//     }
//     handleTrimEndMouseDown (e) {
//         this.containerSize = this.containerElement.getBoundingClientRect().width;
//         this.trimEndDragRecognizer.start(e);
//         this.initialTrimEnd = this.props.trimEnd;
//         this.initialTrimStart = this.props.trimStart;
//         e.stopPropagation();
//         e.preventDefault();
//     }
//     storeRef (el) {
//         this.containerElement = el;
//     }
//     render () {
//         return (
//             <AudioSelectorComponent
//                 containerRef={this.storeRef}
//                 playhead={this.props.playhead}
//                 trimEnd={this.state.trimEnd}
//                 trimStart={this.state.trimStart}
//                 onNewSelectionMouseDown={this.handleNewSelectionMouseDown}
//                 onTrimEndMouseDown={this.handleTrimEndMouseDown}
//                 onTrimStartMouseDown={this.handleTrimStartMouseDown}
//             />
//         );
//     }
// }

const AudioSelector = (props: PropsInterface) => {
  const [states, setStates] = useState({
    trimStart: props.trimStart,
    trimEnd: props.trimEnd,
  });
  const [trimStartState, setTrimStartState] = useState<any | null>(null);
  const [trimEndState, setTrimEndState] = useState<any | null>(null);

  let containerElement: any;
  let initialTrimEnd: any;
  let initialTrimStart: any;
  let containerSize: any;

  let clickStartTime: any = 0;

  useEffect(() => {
    if (trimStartState === props.trimStart && trimEndState === props.trimEnd) {
      setTrimStartState(props.trimStart);
      setTrimEndState(props.trimEnd);
      return;
    }
    setStates({
      trimStart: trimStartState,
      trimEnd: trimEndState,
    });
  }, [props.trimStart, props.trimEnd, trimStartState, trimEndState]);

  const clearSelection = () => {
    props.onSetTrim(null, null);
  };
  const handleNewSelectionMouseDown = (e: ChangeEvent) => {
    const { width, left } = containerElement.getBoundingClientRect();
    initialTrimEnd = (getEventXY(e).x - left) / width;
    initialTrimStart = initialTrimEnd;
    props.onSetTrim(initialTrimStart, initialTrimEnd);

    clickStartTime = Date.now();

    containerSize = width;
    trimEndDragRecognizer.start(e);

    e.preventDefault();
  };
  const handleTrimStartMouseMove = (
    currentOffset: any,
    initialOffset: any
  ): any => {
    const dx = (currentOffset.x - initialOffset.x) / containerSize;
    const newTrim = Math.max(0, Math.min(1, initialTrimStart + dx));
    if (newTrim > initialTrimEnd) {
      setStates({
        trimStart: initialTrimEnd,
        trimEnd: newTrim,
      });
    } else {
      setStates({
        trimStart: newTrim,
        trimEnd: initialTrimEnd,
      });
    }
  };
  const handleTrimEndMouseMove = (currentOffset: any, initialOffset: any) => {
    const dx = (currentOffset.x - initialOffset.x) / containerSize;
    const newTrim = Math.min(1, Math.max(0, initialTrimEnd + dx));
    if (newTrim < initialTrimStart) {
      setStates({
        trimStart: newTrim,
        trimEnd: initialTrimStart,
      });
    } else {
      setStates({
        trimStart: initialTrimStart,
        trimEnd: newTrim,
      });
    }
  };
  const handleTrimStartMouseUp = () => {
    props.onSetTrim(states.trimStart, states.trimEnd);
  };
  const handleTrimEndMouseUp = () => {
    // If the selection was made quickly (tooFast) and is small (tooShort),
    // deselect instead. This allows click-to-deselect even if you drag
    // a little bit by accident. It also allows very quickly making a
    // selection, as long as it is above a minimum length.
    const tooFast = Date.now() - clickStartTime < MIN_DURATION;
    const tooShort = states.trimEnd - states.trimStart < MIN_LENGTH;
    if (tooFast && tooShort) {
      clearSelection();
    } else {
      props.onSetTrim(states.trimStart, states.trimEnd);
    }
  };
  const handleTrimStartMouseDown = (e: any) => {
    containerSize = containerElement.getBoundingClientRect().width;
    trimStartDragRecognizer.start(e);
    initialTrimStart = props.trimStart;
    initialTrimEnd = props.trimEnd;
    e.stopPropagation();
    e.preventDefault();
  };
  const handleTrimEndMouseDown = (e: any) => {
    containerSize = containerElement.getBoundingClientRect().width;
    trimEndDragRecognizer.start(e);
    initialTrimEnd = props.trimEnd;
    initialTrimStart = props.trimStart;
    e.stopPropagation();
    e.preventDefault();
  };
  const storeRef = (el: any) => {
    containerElement = el;
  };

  const trimStartDragRecognizer = new DragRecognizer({
    onDrag: handleTrimStartMouseMove,
    onDragEnd: handleTrimStartMouseUp,
    touchDragAngle: 90,
    distanceThreshold: 0,
  });

  const trimEndDragRecognizer = new DragRecognizer({
    onDrag: handleTrimEndMouseMove,
    onDragEnd: handleTrimEndMouseUp,
    touchDragAngle: 90,
    distanceThreshold: 0,
  });

  return (
    <AudioSelectorComponent
      containerRef={storeRef}
      playhead={props.playhead}
      trimEnd={states.trimEnd}
      trimStart={states.trimStart}
      onNewSelectionMouseDown={handleNewSelectionMouseDown}
      onTrimEndMouseDown={handleTrimEndMouseDown}
      onTrimStartMouseDown={handleTrimStartMouseDown}
    />
  );
};

interface PropsInterface {
  onSetTrim: any;
  playhead: number;
  trimEnd: number;
  trimStart: number;
  onPlay?: any;
  onStop?: any;
}

export default AudioSelector;
