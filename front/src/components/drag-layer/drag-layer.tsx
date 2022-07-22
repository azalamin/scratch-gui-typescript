import { FC } from 'react';
import styles from './dragLayer.module.css';

const DragLayer: FC<PropsInterface> = ({ dragging, img, currentOffset }) =>
  dragging ? (
    <div className={styles.dragLayer}>
      <div
        className={styles.imageWrapper}
        style={{
          transform: `translate(${currentOffset.x}px, ${currentOffset.y}px)`,
        }}
      >
        <img className={styles.image} src={img} alt='' />
      </div>
    </div>
  ) : null;

interface PropsInterface {
  currentOffset: any;
  dragging: boolean;
  img: string;
}

// TODO
// DragLayer.propTypes = {
//     currentOffset: PropTypes.shape({
//         x: PropTypes.number.isRequired,
//         y: PropTypes.number.isRequired
//     }),
//     dragging: PropTypes.bool.isRequired,
//     img: PropTypes.string
// };

export default DragLayer;
