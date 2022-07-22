import classNames from 'classnames';
import Box from '../box/box.jsx';
import styles from './blocks.module.css';

const BlocksComponent = (props: PropsInterface) => {
  const { containerRef, dragOver, ...componentProps } = props;
  return (
    <Box
      className={classNames(styles.blocks, {
        [styles.dragOver]: dragOver,
      })}
      {...componentProps}
      componentRef={containerRef}
    />
  );
};

interface PropsInterface {
  containerRef: any;
  dragOver: boolean;
}

export default BlocksComponent;
