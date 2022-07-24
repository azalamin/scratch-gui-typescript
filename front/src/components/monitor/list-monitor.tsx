import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import ListMonitorScroller from './list-monitor-scroller.js';
import styles from './monitor.module.css';

const ListMonitor = ({
  draggable,
  label,
  width,
  height,
  value,
  onResizeMouseDown,
  onAdd,
  ...rowProps
}: PropsInterface) => (
  <div
    className={styles.listMonitor}
    style={{
      width: `${width}px`,
      height: `${height}px`,
    }}
  >
    <div className={styles.listHeader}>{label}</div>
    <div className={styles.listBody}>
      <ListMonitorScroller
        draggable={draggable}
        height={height}
        values={value}
        width={width}
        {...rowProps}
      />
    </div>
    <div className={styles.listFooter}>
      <div
        className={classNames(draggable ? styles.addButton : null, 'no-drag')}
        onClick={draggable ? onAdd : null}
      >
        {'+' /* TODO waiting on asset */}
      </div>
      <div className={styles.footerLength}>
        <FormattedMessage
          defaultMessage='length {length}'
          description='Length label on list monitors. DO NOT translate {length} (with brackets).'
          id='gui.monitor.listMonitor.listLength'
          values={{
            length: value.length,
          }}
        />
      </div>
      <div
        className={classNames(
          draggable ? styles.resizeHandle : null,
          'no-drag'
        )}
        onMouseDown={draggable ? onResizeMouseDown : null}
      >
        {'=' /* TODO waiting on asset */}
      </div>
    </div>
  </div>
);

interface PropsInterface {
  activeIndex: number;
  categoryColor?: string;
  draggable?: boolean;
  height: number;
  label?: string;
  onActivate?: any;
  onAdd?: any;
  onResizeMouseDown?: any;
  value?: any;
  width: number;
  activeValue?: any;
  onDeactivate?: any;
  onFocus?: any;
  onInput?: any;
  onKeyPress?: any;
  onRemove?: any;
}

// ListMonitor.propTypes = {
//   activeIndex: PropTypes.number,
//   categoryColor: PropTypes.string.isRequired,
//   draggable: PropTypes.bool.isRequired,
//   height: PropTypes.number,
//   label: PropTypes.string.isRequired,
//   onActivate: PropTypes.func,
//   onAdd: PropTypes.func,
//   onResizeMouseDown: PropTypes.func,
//   value: PropTypes.oneOfType([
//     PropTypes.string,
//     PropTypes.number,
//     PropTypes.arrayOf(
//       PropTypes.oneOfType([PropTypes.string, PropTypes.number])
//     ),
//   ]),
//   width: PropTypes.number,
// };

ListMonitor.defaultProps = {
  width: 110,
  height: 200,
};

export default ListMonitor;
