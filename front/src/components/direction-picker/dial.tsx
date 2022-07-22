import { useCallback, useEffect } from 'react';
import { getEventXY } from '../../lib/touch-utils';

import styles from './dial.module.css';

import dialFace from './icon--dial.svg';
import dialHandle from './icon--handle.svg';

const Dial = (props: PropsInterface) => {
  let directionOffset: any;

  /**
   * Get direction from dial center to mouse move event.
   * @param {Event} e - Mouse move event.
   * @returns {number} Direction in degrees, clockwise, 90=horizontal.
   */

  let handleElement: any;
  let containerElement: any;
  const directionToMouseEvent = useCallback(
    (e: any) => {
      const { x: mx, y: my } = getEventXY(e);
      const bbox = containerElement.getBoundingClientRect();
      const cy = bbox.top + bbox.height / 2;
      const cx = bbox.left + bbox.width / 2;
      const angle = Math.atan2(my - cy, mx - cx);
      const degrees = angle * (180 / Math.PI);
      return degrees + 90; // To correspond with scratch coordinate system
    },
    [containerElement]
  );

  /**
   * Create SVG path data string for the dial "gauge", the overlaid arc slice.
   * @param {number} radius - The radius of the dial.
   * @param {number} direction - Direction in degrees, clockwise, 90=horizontal.
   * @returns {string} Path data string for the gauge.
   */
  const gaugePath = (radius: any, direction: any): string => {
    const rads = direction * (Math.PI / 180);
    const path = [];
    path.push(`M ${radius} 0`);
    path.push(`L ${radius} ${radius}`);
    path.push(
      `L ${radius + radius * Math.sin(rads)} ${
        radius - radius * Math.cos(rads)
      }`
    );
    path.push(`A ${radius} ${radius} 0 0 ${direction < 0 ? 1 : 0} ${radius} 0`);
    path.push(`Z`);
    return path.join(' ');
  };

  const handleMouseMove = useCallback(
    (e: any) => {
      props.onChange(directionToMouseEvent(e) + directionOffset);
      e.preventDefault();
    },
    [directionOffset, directionToMouseEvent, props]
  );

  const unbindMouseEvents = useCallback(() => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', unbindMouseEvents);
    window.removeEventListener('touchmove', handleMouseMove);
    window.removeEventListener('touchend', unbindMouseEvents);
  }, [handleMouseMove]);

  const handleMouseDown = useCallback((e: any) => {
    // Because the drag handle is not a single point, there is some initial
    // difference between the current sprite direction and the direction to the mouse
    // Store this offset to prevent jumping when the mouse is moved.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    directionOffset = props.direction - directionToMouseEvent(e);
    window.addEventListener('mousemove', handleMouseMove);
    // window.addEventListener('mouseup', unbindMouseEvents);
    window.addEventListener('touchmove', handleMouseMove);
    // window.addEventListener('touchend', unbindMouseEvents);
    e.preventDefault();
  }, []);

  const containerRef = (el: any) => {
    containerElement = el;
  };

  const handleRef = (el: any) => {
    handleElement = el;
  };

  useEffect(() => {
    handleElement.addEventListener('mousedown', handleMouseDown);
    handleElement.addEventListener('touchstart', handleMouseDown);

    return () => {
      unbindMouseEvents();
      handleElement.removeEventListener('mousedown', handleMouseDown);
      handleElement.removeEventListener('touchstart', handleMouseDown);
    };
  }, [handleElement, handleMouseDown, unbindMouseEvents]);

  const { direction, radius } = props;

  return (
    <div className={styles.container}>
      <div
        className={styles.dialContainer}
        ref={containerRef}
        style={{
          width: `${radius * 2}px`,
          height: `${radius * 2}px`,
        }}
      >
        <img
          className={styles.dialFace}
          draggable={false}
          src={dialFace}
          alt=''
        />
        <svg className={styles.gauge} height={radius * 2} width={radius * 2}>
          <path className={styles.gaugePath} d={gaugePath(radius, direction)} />
        </svg>
        <img
          className={styles.dialHandle}
          draggable={false}
          ref={handleRef}
          src={dialHandle}
          alt=''
          style={{
            top: `${radius - radius * Math.cos(direction * (Math.PI / 180))}px`,
            left: `${
              radius + radius * Math.sin(direction * (Math.PI / 180))
            }px`,
            transform: `rotate(${direction}deg)`,
          }}
        />
      </div>
    </div>
  );
};

interface PropsInterface {
  direction: number;
  onChange: any;
  radius: number;
}

// TODO
// Dial.propTypes = {
//     direction: PropTypes.number,
//     onChange: PropTypes.func.isRequired,
//     radius: PropTypes.number
// };

Dial.defaultProps = {
  direction: 90, // degrees
  radius: 56, // px
};

export default Dial;
