import Box from '../box/box';
import styles from './assetPanel.module.css';
import Selector from './selector';

const AssetPanel = (props: any) => (
  <Box className={styles.wrapper}>
    <Selector className={styles.selector} {...props} />
    <Box className={styles.detailArea}>{props.children}</Box>
  </Box>
);

// AssetPanel.propTypes = {
//   ...Selector.propTypes,
// };

export default AssetPanel;
