import { connect } from 'react-redux';
import DragLayer from '../components/drag-layer/drag-layer';

const mapStateToProps = (state: any) => ({
  dragging: state.scratchGui.assetDrag.dragging,
  currentOffset: state.scratchGui.assetDrag.currentOffset,
  img: state.scratchGui.assetDrag.img,
});

export default connect(mapStateToProps)(DragLayer);
