import bindAll from 'lodash.bindall';
import React from 'react';
import { connect } from 'react-redux';
import Renderer from 'scratch-render';

import { BitmapAdapter as V2BitmapAdapter } from 'scratch-svg-renderer';
import { getEventXY } from '../lib/touch-utils';
import VideoProvider from '../lib/video/video-provider';

import StageComponent from '../components/stage/stage';

import {
  activateColorPicker,
  deactivateColorPicker,
} from '../reducers/color-picker';

const colorPickerRadius = 20;
const dragThreshold = 3; // Same as the block drag threshold

class Stage extends React.Component<PropsInterface, StateInterface> {
  renderer: any;
  canvas: any;
  rect: any;
  intervalId: any;
  pickX: any;
  pickY: any;
  dragCanvas: any;
  document: any;
  constructor(props: PropsInterface) {
    super(props);
    bindAll(this, [
      'attachMouseEvents',
      'cancelMouseDownTimeout',
      'detachMouseEvents',
      'handleDoubleClick',
      'handleQuestionAnswered',
      'onMouseUp',
      'onMouseMove',
      'onMouseDown',
      'onStartDrag',
      'onStopDrag',
      'onWheel',
      'updateRect',
      'questionListener',
      'setDragCanvas',
      'clearDragCanvas',
      'drawDragCanvas',
      'positionDragCanvas',
    ]);
    this.state = {
      mouseDownTimeoutId: null,
      mouseDownPosition: null,
      isDragging: false,
      dragOffset: null,
      dragId: null,
      colorInfo: null,
      question: null,
      mouseDown: null,
    };
    if (this.props.vm.renderer) {
      this.renderer = this.props.vm.renderer;
      this.canvas = this.renderer.canvas;
    } else {
      this.canvas = document.createElement('canvas');
      this.renderer = new Renderer(this.canvas);
      this.props.vm.attachRenderer(this.renderer);

      // Only attach a video provider once because it is stateful
      this.props.vm.setVideoProvider(new VideoProvider());

      // Calling draw a single time before any project is loaded just makes
      // the canvas white instead of solid black–needed because it is not
      // possible to use CSS to style the canvas to have a different
      // default color
      this.props.vm.renderer.draw();
    }
    this.props.vm.attachV2BitmapAdapter(new V2BitmapAdapter());
  }
  componentDidMount() {
    this.attachRectEvents();
    this.attachMouseEvents(this.canvas);
    this.updateRect();
    this.props.vm.runtime.addListener('QUESTION', this.questionListener);
  }
  shouldComponentUpdate(nextProps: any, nextState: any) {
    return (
      this.props.stageSize !== nextProps.stageSize ||
      this.props.isColorPicking !== nextProps.isColorPicking ||
      this.state.colorInfo !== nextState.colorInfo ||
      this.props.isFullScreen !== nextProps.isFullScreen ||
      this.state.question !== nextState.question ||
      this.props.micIndicator !== nextProps.micIndicator ||
      this.props.isStarted !== nextProps.isStarted
    );
  }
  componentDidUpdate(prevProps: any) {
    if (this.props.isColorPicking && !prevProps.isColorPicking) {
      this.startColorPickingLoop();
    } else if (!this.props.isColorPicking && prevProps.isColorPicking) {
      this.stopColorPickingLoop();
    }
    this.updateRect();
    this.renderer.resize(this.rect.width, this.rect.height);
  }
  componentWillUnmount() {
    this.detachMouseEvents(this.canvas);
    this.detachRectEvents();
    this.stopColorPickingLoop();
    this.props.vm.runtime.removeListener('QUESTION', this.questionListener);
  }
  questionListener(question: any) {
    this.setState({ question: question });
  }
  handleQuestionAnswered(answer: any) {
    this.setState({ question: null }, () => {
      this.props.vm.runtime.emit('ANSWER', answer);
    });
  }
  startColorPickingLoop() {
    this.intervalId = setInterval(() => {
      if (typeof this.pickX === 'number') {
        this.setState({ colorInfo: this.getColorInfo(this.pickX, this.pickY) });
      }
    }, 30);
  }
  stopColorPickingLoop() {
    clearInterval(this.intervalId);
  }
  attachMouseEvents(canvas: any) {
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('touchmove', this.onMouseMove);
    document.addEventListener('touchend', this.onMouseUp);
    canvas.addEventListener('mousedown', this.onMouseDown);
    canvas.addEventListener('touchstart', this.onMouseDown);
    canvas.addEventListener('wheel', this.onWheel);
  }
  detachMouseEvents(canvas: any) {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('touchmove', this.onMouseMove);
    document.removeEventListener('touchend', this.onMouseUp);
    canvas.removeEventListener('mousedown', this.onMouseDown);
    canvas.removeEventListener('touchstart', this.onMouseDown);
    canvas.removeEventListener('wheel', this.onWheel);
  }
  attachRectEvents() {
    window.addEventListener('resize', this.updateRect);
    window.addEventListener('scroll', this.updateRect);
  }
  detachRectEvents() {
    window.removeEventListener('resize', this.updateRect);
    window.removeEventListener('scroll', this.updateRect);
  }
  updateRect() {
    this.rect = this.canvas.getBoundingClientRect();
  }
  getScratchCoords(x: any, y: any) {
    const nativeSize = this.renderer.getNativeSize();
    return [
      (nativeSize[0] / this.rect.width) * (x - this.rect.width / 2),
      (nativeSize[1] / this.rect.height) * (y - this.rect.height / 2),
    ];
  }
  getColorInfo(x: any, y: any) {
    return {
      x: x,
      y: y,
      ...this.renderer.extractColor(x, y, colorPickerRadius),
    };
  }
  handleDoubleClick(e: any) {
    const { x, y } = getEventXY(e);
    // Set editing target from cursor position, if clicking on a sprite.
    const mousePosition = [x - this.rect.left, y - this.rect.top];
    const drawableId = this.renderer.pick(mousePosition[0], mousePosition[1]);
    if (drawableId === null) return;
    const targetId = this.props.vm.getTargetIdForDrawableId(drawableId);
    if (targetId === null) return;
    this.props.vm.setEditingTarget(targetId);
  }
  onMouseMove(e: any) {
    const { x, y } = getEventXY(e);
    const mousePosition = [x - this.rect.left, y - this.rect.top];

    if (this.props.isColorPicking) {
      // Set the pickX/Y for the color picker loop to pick up
      this.pickX = mousePosition[0];
      this.pickY = mousePosition[1];
    }

    if (this.state.mouseDown && !this.state.isDragging) {
      const distanceFromMouseDown = Math.sqrt(
        Math.pow(mousePosition[0] - this.state.mouseDownPosition[0], 2) +
          Math.pow(mousePosition[1] - this.state.mouseDownPosition[1], 2)
      );
      if (distanceFromMouseDown > dragThreshold) {
        this.cancelMouseDownTimeout();
        this.onStartDrag(
          this.state.mouseDownPosition[0],
          this.state.mouseDownPosition[1]
        );
      }
    }
    if (this.state.mouseDown && this.state.isDragging) {
      // Editor drag style only updates the drag canvas, does full update at the end of drag
      // Non-editor drag style just updates the sprite continuously.
      if (this.props.useEditorDragStyle) {
        this.positionDragCanvas(mousePosition[0], mousePosition[1]);
      } else {
        const spritePosition = this.getScratchCoords(
          mousePosition[0],
          mousePosition[1]
        );
        this.props.vm.postSpriteInfo({
          x: spritePosition[0] + this.state.dragOffset[0],
          y: -(spritePosition[1] + this.state.dragOffset[1]),
          force: true,
        });
      }
    }
    const coordinates = {
      x: mousePosition[0],
      y: mousePosition[1],
      canvasWidth: this.rect.width,
      canvasHeight: this.rect.height,
    };
    this.props.vm.postIOData('mouse', coordinates);
  }
  onMouseUp(e: any) {
    const { x, y } = getEventXY(e);
    const mousePosition = [x - this.rect.left, y - this.rect.top];
    this.cancelMouseDownTimeout();
    this.setState({
      mouseDown: false,
      mouseDownPosition: null,
    });
    const data = {
      isDown: false,
      x: x - this.rect.left,
      y: y - this.rect.top,
      canvasWidth: this.rect.width,
      canvasHeight: this.rect.height,
      wasDragged: this.state.isDragging,
    };
    if (this.state.isDragging) {
      this.onStopDrag(mousePosition[0], mousePosition[1]);
    }
    this.props.vm.postIOData('mouse', data);

    if (
      this.props.isColorPicking &&
      mousePosition[0] > 0 &&
      mousePosition[0] < this.rect.width &&
      mousePosition[1] > 0 &&
      mousePosition[1] < this.rect.height
    ) {
      const { r, g, b } = this.state.colorInfo.color;
      const componentToString = (c: any) => {
        const hex = c.toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
      };
      const colorString = `#${componentToString(r)}${componentToString(
        g
      )}${componentToString(b)}`;
      this.props.onDeactivateColorPicker(colorString);
      this.setState({ colorInfo: null });
      this.pickX = null;
      this.pickY = null;
    }
  }
  onMouseDown(e: any) {
    this.updateRect();
    const { x, y } = getEventXY(e);
    const mousePosition = [x - this.rect.left, y - this.rect.top];
    if (this.props.isColorPicking) {
      // Set the pickX/Y for the color picker loop to pick up
      this.pickX = mousePosition[0];
      this.pickY = mousePosition[1];
      // Immediately update the color picker info
      this.setState({ colorInfo: this.getColorInfo(this.pickX, this.pickY) });
    } else {
      if (e.button === 0 || (window.TouchEvent && e instanceof TouchEvent)) {
        this.setState({
          mouseDown: true,
          mouseDownPosition: mousePosition,
          mouseDownTimeoutId: setTimeout(
            this.onStartDrag.bind(this, mousePosition[0], mousePosition[1]),
            400
          ),
        });
      }
      const data = {
        isDown: true,
        x: mousePosition[0],
        y: mousePosition[1],
        canvasWidth: this.rect.width,
        canvasHeight: this.rect.height,
      };
      this.props.vm.postIOData('mouse', data);
      if (e.preventDefault) {
        // Prevent default to prevent touch from dragging page
        e.preventDefault();
        // But we do want any active input to be blurred
        if (
          document.activeElement &&
          (document.activeElement as HTMLElement).blur
        ) {
          (document.activeElement as HTMLElement).blur();
        }
      }
    }
  }
  onWheel(e: { deltaX: any; deltaY: any }) {
    const data = {
      deltaX: e.deltaX,
      deltaY: e.deltaY,
    };
    this.props.vm.postIOData('mouseWheel', data);
  }
  cancelMouseDownTimeout() {
    if (this.state.mouseDownTimeoutId !== null) {
      clearTimeout(this.state.mouseDownTimeoutId);
    }
    this.setState({ mouseDownTimeoutId: null });
  }
  /**
   * Initialize the position of the "dragged sprite" canvas
   * @param {DrawableExtraction} drawableData The data returned from renderer.extractDrawableScreenSpace
   * @param {number} x The x position of the initial drag event
   * @param {number} y The y position of the initial drag event
   */
  drawDragCanvas(drawableData: any, x: number, y: number) {
    const {
      imageData,
      x: boundsX,
      y: boundsY,
      width: boundsWidth,
      height: boundsHeight,
    } = drawableData;

    this.dragCanvas.width = imageData.width;
    this.dragCanvas.height = imageData.height;
    // On high-DPI devices, the canvas size in layout-pixels is not equal to the size of the extracted data.
    this.dragCanvas.style.width = `${boundsWidth}px`;
    this.dragCanvas.style.height = `${boundsHeight}px`;

    this.dragCanvas.getContext('2d').putImageData(imageData, 0, 0);
    // Position so that pick location is at (0, 0) so that  positionDragCanvas()
    // can use translation to move to mouse position smoothly.
    this.dragCanvas.style.left = `${boundsX - x}px`;
    this.dragCanvas.style.top = `${boundsY - y}px`;
    this.dragCanvas.style.display = 'block';
  }
  clearDragCanvas() {
    this.dragCanvas.width = this.dragCanvas.height = 0;
    this.dragCanvas.style.display = 'none';
  }
  positionDragCanvas(mouseX: any, mouseY: any) {
    // mouseX/Y are relative to stage top/left, and dragCanvas is already
    // positioned so that the pick location is at (0,0).
    this.dragCanvas.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  }
  onStartDrag(x: any, y: any) {
    if (this.state.dragId) return;
    const drawableId = this.renderer.pick(x, y);
    if (drawableId === null) return;
    const targetId = this.props.vm.getTargetIdForDrawableId(drawableId);
    if (targetId === null) return;

    const target = this.props.vm.runtime.getTargetById(targetId);

    // Do not start drag unless in editor drag mode or target is draggable
    if (!(this.props.useEditorDragStyle || target.draggable)) return;

    // Dragging always brings the target to the front
    target.goToFront();

    const [scratchMouseX, scratchMouseY] = this.getScratchCoords(x, y);
    const offsetX = target.x - scratchMouseX;
    const offsetY = -(target.y + scratchMouseY);

    this.props.vm.startDrag(targetId);
    this.setState({
      isDragging: true,
      dragId: targetId,
      dragOffset: [offsetX, offsetY],
    });
    if (this.props.useEditorDragStyle) {
      // Extract the drawable art
      const drawableData = this.renderer.extractDrawableScreenSpace(drawableId);
      this.drawDragCanvas(drawableData, x, y);
      this.positionDragCanvas(x, y);
      this.props.vm.postSpriteInfo({ visible: false });
      this.props.vm.renderer.draw();
    }
  }
  onStopDrag(mouseX: any, mouseY: any) {
    const dragId = this.state.dragId;
    const commonStopDragActions = () => {
      this.props.vm.stopDrag(dragId);
      this.setState({
        isDragging: false,
        dragOffset: null,
        dragId: null,
      });
    };
    if (this.props.useEditorDragStyle) {
      // Need to sequence these actions to prevent flickering.
      const spriteInfo: any = { visible: true };
      // First update the sprite position if dropped in the stage.
      if (
        mouseX > 0 &&
        mouseX < this.rect.width &&
        mouseY > 0 &&
        mouseY < this.rect.height
      ) {
        const spritePosition = this.getScratchCoords(mouseX, mouseY);
        spriteInfo.x = spritePosition[0] + this.state.dragOffset[0];
        spriteInfo.y = -(spritePosition[1] + this.state.dragOffset[1]);
        spriteInfo.force = true;
      }
      this.props.vm.postSpriteInfo(spriteInfo);
      // Then clear the dragging canvas and stop drag (potentially slow if selecting sprite)
      this.clearDragCanvas();
      commonStopDragActions();
      this.props.vm.renderer.draw();
    } else {
      commonStopDragActions();
    }
  }
  setDragCanvas(canvas: any) {
    this.dragCanvas = canvas;
  }
  render() {
    const {
      vm, // eslint-disable-line no-unused-vars
      onActivateColorPicker, // eslint-disable-line no-unused-vars
      ...props
    } = this.props;
    return (
      <StageComponent
        canvas={this.canvas}
        colorInfo={this.state.colorInfo}
        dragRef={this.setDragCanvas}
        question={this.state.question}
        onDoubleClick={this.handleDoubleClick}
        onQuestionAnswered={this.handleQuestionAnswered}
        {...props}
      />
    );
  }
}

// TODO Functional Component
// const Stage = (prop: PropsInterface) => {
//   const [states, setStates] = useState<any>({
//     mouseDownTimeoutId: null,
//     mouseDownPosition: null,
//     isDragging: false,
//     dragOffset: null,
//     dragId: null,
//     colorInfo: null,
//     question: null,
//   });

//   let dragCanvas = useRef();

//   let renderer: any;
//   let canvas: any;
//   let intervalId: any;

//   if (prop.vm.renderer) {
//     renderer = prop.vm.renderer;
//     canvas = renderer.canvas;
//   } else {
//     canvas = document.createElement('canvas');
//     renderer = new Renderer(canvas);
//     prop.vm.attachRenderer(renderer);

//     // Only attach a video provider once because it is stateful
//     prop.vm.setVideoProvider(new VideoProvider());

//     // Calling draw a single time before any project is loaded just makes
//     // the canvas white instead of solid black–needed because it is not
//     // possible to use CSS to style the canvas to have a different
//     // default color
//     prop.vm.renderer.draw();
//   }
//   prop.vm.attachV2BitmapAdapter(new V2BitmapAdapter());

//   const questionListener = useCallback(
//     question => {
//       setStates({ ...states, question: question });
//     },
//     [states]
//   );

//   const handleQuestionAnswered = (answer: any) => {
//     setStates({ ...states, question: null });
//     if (states.questions === null) {
//       prop.vm.runtime.emit('ANSWER', answer);
//     }
//   };

//   let pickX: any;
//   let pickY: any;
//   const startColorPickingLoop = () => {
//     intervalId = setInterval(() => {
//       if (typeof pickX === 'number') {
//         setStates({ ...states, colorInfo: getColorInfo(pickX, pickY) });
//       }
//     }, 30);
//   };

//   const stopColorPickingLoop = useCallback(() => {
//     clearInterval(intervalId);
//   }, [intervalId]);

//   let rect: any;
//   const updateRect = useCallback(() => {
//     rect = canvas.getBoundingClientRect();
//   }, [canvas]);

//   const attachRectEvents = useCallback(() => {
//     window.addEventListener('resize', updateRect);
//     window.addEventListener('scroll', updateRect);
//   }, [updateRect]);

//   const detachRectEvents = useCallback(() => {
//     window.removeEventListener('resize', updateRect);
//     window.removeEventListener('scroll', updateRect);
//   }, [updateRect]);

//   const getScratchCoords = (x: any, y: any) => {
//     const nativeSize = renderer.getNativeSize();
//     return [
//       (nativeSize[0] / rect.width) * (x - rect.width / 2),
//       (nativeSize[1] / rect.height) * (y - rect.height / 2),
//     ];
//   };
//   const getColorInfo = (x: any, y: any) => {
//     return {
//       x: x,
//       y: y,
//       ...renderer.extractColor(x, y, colorPickerRadius),
//     };
//   };
//   const handleDoubleClick = (e: any) => {
//     const { x, y } = getEventXY(e);
//     // Set editing target from cursor position, if clicking on a sprite.
//     const mousePosition = [x - rect.left, y - rect.top];
//     const drawableId = renderer.pick(mousePosition[0], mousePosition[1]);
//     if (drawableId === null) return;
//     const targetId = prop.vm.getTargetIdForDrawableId(drawableId);
//     if (targetId === null) return;
//     prop.vm.setEditingTarget(targetId);
//   };

//   const onMouseMove = useCallback(e => {
//     const { x, y } = getEventXY(e);
//     const mousePosition = [x - rect.left, y - rect.top];

//     if (prop.isColorPicking) {
//       // Set the pickX/Y for the color picker loop to pick up
//       pickX = mousePosition[0];
//       pickY = mousePosition[1];
//     }

//     if (states.mouseDown && !states.isDragging) {
//       const distanceFromMouseDown = Math.sqrt(
//         Math.pow(mousePosition[0] - states.mouseDownPosition[0], 2) +
//           Math.pow(mousePosition[1] - states.mouseDownPosition[1], 2)
//       );
//       if (distanceFromMouseDown > dragThreshold) {
//         cancelMouseDownTimeout();
//         onStartDrag(...states.mouseDownPosition);
//       }
//     }
//     if (states.mouseDown && states.isDragging) {
//       // Editor drag style only updates the drag canvas, does full update at the end of drag
//       // Non-editor drag style just updates the sprite continuously.
//       if (prop.useEditorDragStyle) {
//         positionDragCanvas(mousePosition[0], mousePosition[1]);
//       } else {
//         const spritePosition = getScratchCoords(
//           mousePosition[0],
//           mousePosition[1]
//         );
//         prop.vm.postSpriteInfo({
//           x: spritePosition[0] + states.dragOffset[0],
//           y: -(spritePosition[1] + states.dragOffset[1]),
//           force: true,
//         });
//       }
//     }
//     const coordinates = {
//       x: mousePosition[0],
//       y: mousePosition[1],
//       canvasWidth: rect.width,
//       canvasHeight: rect.height,
//     };
//     prop.vm.postIOData('mouse', coordinates);
//   }, []);

//   const onMouseUp = e => {
//     const { x, y } = getEventXY(e);
//     const mousePosition = [x - rect.left, y - rect.top];
//     cancelMouseDownTimeout();
//     setStates({
//       ...states,
//       mouseDown: false,
//       mouseDownPosition: null,
//     });
//     const data = {
//       isDown: false,
//       x: x - rect.left,
//       y: y - rect.top,
//       canvasWidth: rect.width,
//       canvasHeight: rect.height,
//       wasDragged: states.isDragging,
//     };
//     if (states.isDragging) {
//       onStopDrag(mousePosition[0], mousePosition[1]);
//     }
//     prop.vm.postIOData('mouse', data);

//     if (
//       prop.isColorPicking &&
//       mousePosition[0] > 0 &&
//       mousePosition[0] < rect.width &&
//       mousePosition[1] > 0 &&
//       mousePosition[1] < rect.height
//     ) {
//       const { r, g, b } = states.colorInfo.color;
//       const componentToString = c => {
//         const hex = c.toString(16);
//         return hex.length === 1 ? `0${hex}` : hex;
//       };
//       const colorString = `#${componentToString(r)}${componentToString(
//         g
//       )}${componentToString(b)}`;
//       prop.onDeactivateColorPicker(colorString);
//       setStates({ ...states, colorInfo: null });
//       pickX = null;
//       pickY = null;
//     }
//   };
//   const onMouseDown = e => {
//     updateRect();
//     const { x, y } = getEventXY(e);
//     const mousePosition = [x - rect.left, y - rect.top];
//     if (prop.isColorPicking) {
//       // Set the pickX/Y for the color picker loop to pick up
//       pickX = mousePosition[0];
//       pickY = mousePosition[1];
//       // Immediately update the color picker info
//       setStates({ ...states, colorInfo: getColorInfo(pickX, pickY) });
//     } else {
//       if (e.button === 0 || (window.TouchEvent && e instanceof TouchEvent)) {
//         setStates({
//           ...states,
//           mouseDown: true,
//           mouseDownPosition: mousePosition,
//           mouseDownTimeoutId: setTimeout(
//             onStartDrag.bind(this, mousePosition[0], mousePosition[1]),
//             400
//           ),
//         });
//       }
//       const data = {
//         isDown: true,
//         x: mousePosition[0],
//         y: mousePosition[1],
//         canvasWidth: rect.width,
//         canvasHeight: rect.height,
//       };
//       prop.vm.postIOData('mouse', data);
//       if (e.preventDefault) {
//         // Prevent default to prevent touch from dragging page
//         e.preventDefault();
//         // But we do want any active input to be blurred
//         if (document.activeElement && document.activeElement.blur) {
//           document.activeElement.blur();
//         }
//       }
//     }
//   };
//   const onWheel = e => {
//     const data = {
//       deltaX: e.deltaX,
//       deltaY: e.deltaY,
//     };
//     prop.vm.postIOData('mouseWheel', data);
//   };
//   const cancelMouseDownTimeout = () => {
//     if (states.mouseDownTimeoutId !== null) {
//       clearTimeout(states.mouseDownTimeoutId);
//     }
//     setStates({ ...states, mouseDownTimeoutId: null });
//   };

//   const attachMouseEvents = useCallback(
//     canvas => {
//       document.addEventListener('mousemove', onMouseMove);
//       document.addEventListener('mouseup', onMouseUp);
//       document.addEventListener('touchmove', onMouseMove);
//       document.addEventListener('touchend', onMouseUp);
//       canvas.addEventListener('mousedown', onMouseDown);
//       canvas.addEventListener('touchstart', onMouseDown);
//       canvas.addEventListener('wheel', onWheel);
//     },
//     [onMouseDown, onMouseMove, onMouseUp, onWheel]
//   );

//   const detachMouseEvents = useCallback(
//     canvas => {
//       document.removeEventListener('mousemove', onMouseMove);
//       document.removeEventListener('mouseup', onMouseUp);
//       document.removeEventListener('touchmove', onMouseMove);
//       document.removeEventListener('touchend', onMouseUp);
//       canvas.removeEventListener('mousedown', onMouseDown);
//       canvas.removeEventListener('touchstart', onMouseDown);
//       canvas.removeEventListener('wheel', onWheel);
//     },
//     [onMouseDown, onMouseMove, onMouseUp, onWheel]
//   );

//   /**
//    * Initialize the position of the "dragged sprite" canvas
//    * @param {DrawableExtraction} drawableData The data returned from renderer.extractDrawableScreenSpace
//    * @param {number} x The x position of the initial drag event
//    * @param {number} y The y position of the initial drag event
//    */
//   const drawDragCanvas = (drawableData, x, y) => {
//     const {
//       imageData,
//       x: boundsX,
//       y: boundsY,
//       width: boundsWidth,
//       height: boundsHeight,
//     } = drawableData;
//     console.log(dragCanvas);
//     dragCanvas.width = imageData.width;
//     dragCanvas.height = imageData.height;
//     // On high-DPI devices, the canvas size in layout-pixels is not equal to the size of the extracted data.
//     dragCanvas.style.width = `${boundsWidth}px`;
//     dragCanvas.style.height = `${boundsHeight}px`;

//     dragCanvas.getContext('2d').putImageData(imageData, 0, 0);
//     // Position so that pick location is at (0, 0) so that  positionDragCanvas()
//     // can use translation to move to mouse position smoothly.
//     dragCanvas.style.left = `${boundsX - x}px`;
//     dragCanvas.style.top = `${boundsY - y}px`;
//     dragCanvas.style.display = 'block';
//   };
//   const clearDragCanvas = () => {
//     dragCanvas.width = dragCanvas.height = 0;
//     dragCanvas.style.display = 'none';
//   };
//   const positionDragCanvas = (mouseX, mouseY) => {
//     // mouseX/Y are relative to stage top/left, and dragCanvas is already
//     // positioned so that the pick location is at (0,0).
//     dragCanvas.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
//   };
//   const onStartDrag = (x, y) => {
//     if (states.dragId) return;
//     const drawableId = renderer.pick(x, y);
//     if (drawableId === null) return;
//     const targetId = prop.vm.getTargetIdForDrawableId(drawableId);
//     if (targetId === null) return;

//     const target = prop.vm.runtime.getTargetById(targetId);

//     // Do not start drag unless in editor drag mode or target is draggable
//     if (!(prop.useEditorDragStyle || target.draggable)) return;

//     // Dragging always brings the target to the front
//     target.goToFront();

//     const [scratchMouseX, scratchMouseY] = getScratchCoords(x, y);
//     const offsetX = target.x - scratchMouseX;
//     const offsetY = -(target.y + scratchMouseY);

//     prop.vm.startDrag(targetId);
//     setStates({
//       ...states,
//       isDragging: true,
//       dragId: targetId,
//       dragOffset: [offsetX, offsetY],
//     });
//     if (prop.useEditorDragStyle) {
//       // Extract the drawable art
//       const drawableData = renderer.extractDrawableScreenSpace(drawableId);
//       drawDragCanvas(drawableData, x, y);
//       positionDragCanvas(x, y);
//       prop.vm.postSpriteInfo({ visible: false });
//       prop.vm.renderer.draw();
//     }
//   };
//   const onStopDrag = (mouseX, mouseY) => {
//     const dragId = states.dragId;
//     const commonStopDragActions = () => {
//       prop.vm.stopDrag(dragId);
//       setStates({
//         ...states,
//         isDragging: false,
//         dragOffset: null,
//         dragId: null,
//       });
//     };
//     if (prop.useEditorDragStyle) {
//       // Need to sequence these actions to prevent flickering.
//       const spriteInfo = { visible: true };
//       // First update the sprite position if dropped in the stage.
//       if (
//         mouseX > 0 &&
//         mouseX < rect.width &&
//         mouseY > 0 &&
//         mouseY < rect.height
//       ) {
//         const spritePosition = getScratchCoords(mouseX, mouseY);
//         spriteInfo.x = spritePosition[0] + states.dragOffset[0];
//         spriteInfo.y = -(spritePosition[1] + states.dragOffset[1]);
//         spriteInfo.force = true;
//       }
//       prop.vm.postSpriteInfo(spriteInfo);
//       // Then clear the dragging canvas and stop drag (potentially slow if selecting sprite)
//       clearDragCanvas();
//       commonStopDragActions();
//       prop.vm.renderer.draw();
//     } else {
//       commonStopDragActions();
//     }
//   };
//   const setDragCanvas = canvas => {
//     dragCanvas = canvas;
//   };

//   useEffect(() => {
//     attachRectEvents();
//     attachMouseEvents(canvas);
//     updateRect();
//     prop.vm.runtime.addListener('QUESTION', questionListener);

//     return () => {
//       detachMouseEvents(canvas);
//       detachRectEvents();
//       stopColorPickingLoop();
//       prop.vm.runtime.removeListener('QUESTION', questionListener);
//     };
//   }, [
//     attachMouseEvents,
//     attachRectEvents,
//     canvas,
//     detachMouseEvents,
//     detachRectEvents,
//     questionListener,
//     stopColorPickingLoop,
//     updateRect,
//     prop.vm.runtime,
//   ]);

//   const {
//     vm, // eslint-disable-line no-unused-vars
//     onActivateColorPicker, // eslint-disable-line no-unused-vars
//     ...props
//   } = prop;

//   return (
//     <StageComponent
//       canvas={canvas}
//       colorInfo={states.colorInfo}
//       dragRef={setDragCanvas}
//       question={states.question}
//       onDoubleClick={handleDoubleClick}
//       onQuestionAnswered={handleQuestionAnswered}
//       {...props}
//     />
//   );
// };

interface PropsInterface {
  isColorPicking: boolean;
  isFullScreen: boolean;
  isStarted: boolean;
  micIndicator: boolean;
  onActivateColorPicker: any;
  onDeactivateColorPicker: any;
  stageSize: any;
  useEditorDragStyle: boolean;
  vm: any;
}

interface StateInterface {
  mouseDownTimeoutId: any;
  mouseDownPosition: any;
  mouseDown: any;
  isDragging: boolean;
  dragOffset: any;
  dragId: any;
  colorInfo: any;
  question: any;
}

// TODO
// Stage.propTypes = {
//   isColorPicking: PropTypes.bool,
//   isFullScreen: PropTypes.bool.isRequired,
//   isStarted: PropTypes.bool,
//   micIndicator: PropTypes.bool,
//   onActivateColorPicker: PropTypes.func,
//   onDeactivateColorPicker: PropTypes.func,
//   stageSize: PropTypes.oneOf(Object.keys(STAGE_DISPLAY_SIZES)).isRequired,
//   useEditorDragStyle: PropTypes.bool,
//   vm: PropTypes.instanceOf(VM).isRequired,
// };

// Stage.defaultProps = {
//   useEditorDragStyle: true,
// };

const mapStateToProps = (state: any) => ({
  isColorPicking: state.scratchGui.colorPicker.active,
  isFullScreen: state.scratchGui.mode.isFullScreen,
  isStarted: state.scratchGui.vmStatus.started,
  micIndicator: state.scratchGui.micIndicator,
  // Do not use editor drag style in fullscreen or player mode.
  useEditorDragStyle: !(
    state.scratchGui.mode.isFullScreen || state.scratchGui.mode.isPlayerOnly
  ),
});

const mapDispatchToProps = (dispatch: any) => ({
  onActivateColorPicker: () => dispatch(activateColorPicker()),
  onDeactivateColorPicker: (color: any) =>
    dispatch(deactivateColorPicker(color)),
});

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(Stage));
