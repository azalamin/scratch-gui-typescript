import styles from './watermark.module.css';

const Watermark = (props: PropsInterface) => (
  <img className={styles.spriteImage} src={props.costumeURL} alt='' />
);

interface PropsInterface {
  costumeURL: string;
}

export default Watermark;
