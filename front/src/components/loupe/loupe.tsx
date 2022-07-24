import { useCallback, useEffect } from 'react';

import Box from '../box/box.js';
import styles from './loupe.module.css';

const zoomScale: any = 3;

const LoupeComponent = (props: PropsInterface) => {
  let canvas: any;
  const draw = useCallback(() => {
    const boxSize = 6 / zoomScale;
    const boxLineWidth = 1 / zoomScale;
    const colorRingWidth = 15 / zoomScale;

    const ctx = canvas.getContext('2d');
    const { color, data, width, height } = props.colorInfo;
    canvas.width = zoomScale * width;
    canvas.height = zoomScale * height;

    // In order to scale the image data, must draw to a tmp canvas first
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = width;
    tmpCanvas.height = height;
    const tmpCtx: any = tmpCanvas.getContext('2d');
    const imageData = tmpCtx.createImageData(width, height);
    imageData.data.set(data);
    tmpCtx.putImageData(imageData, 0, 0);

    // Scale the loupe canvas and draw the zoomed image
    ctx.save();
    ctx.scale(zoomScale, zoomScale);
    ctx.drawImage(tmpCanvas, 0, 0, width, height);

    // Draw an outlined square at the cursor position (cursor is hidden)
    ctx.lineWidth = boxLineWidth;
    ctx.strokeStyle = 'black';
    ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    ctx.beginPath();
    ctx.rect(
      width / 2 - boxSize / 2,
      height / 2 - boxSize / 2,
      boxSize,
      boxSize
    );
    ctx.fill();
    ctx.stroke();

    // Draw a thick ring around the loupe showing the current color
    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    ctx.lineWidth = colorRingWidth;
    ctx.beginPath();
    ctx.moveTo(width, height / 2);
    ctx.arc(width / 2, height / 2, width / 2, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }, [canvas, props.colorInfo]);

  const setCanvas = (element: any) => {
    canvas = element;
  };

  useEffect(() => {
    draw();
  }, [draw]);
  const { colorInfo, ...boxProps } = props;

  return (
    <Box
      {...boxProps}
      className={styles.colorPicker}
      componentRef={setCanvas}
      element='canvas'
      height={colorInfo.height}
      style={{
        top: colorInfo.y - (zoomScale * colorInfo.height) / 2,
        left: colorInfo.x - (zoomScale * colorInfo.width) / 2,
        width: colorInfo.width * zoomScale,
        height: colorInfo.height * zoomScale,
      }}
      width={colorInfo.width}
    />
  );
};

interface PropsInterface {
  colorInfo: any;
}

// TODo
// LoupeComponent.propTypes = {
//     colorInfo: PropTypes.shape({
//         color: PropTypes.shape({
//             r: PropTypes.number,
//             g: PropTypes.number,
//             b: PropTypes.number,
//             a: PropTypes.number
//         }),
//         data: PropTypes.instanceOf(Uint8Array),
//         width: PropTypes.number,
//         height: PropTypes.number,
//         x: PropTypes.number,
//         y: PropTypes.number
//     })
// };

export default LoupeComponent;