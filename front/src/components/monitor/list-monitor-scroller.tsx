import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

import { List } from 'react-virtualized';
import styles from './monitor.module.css';

const ListMonitorScroller = (props: PropsInterface) => {
  const handleEventFactory = (index: any) => {
    return () => props.onActivate(index);
  };

  const noRowsRenderer = () => {
    return (
      <div className={classNames(styles.listRow, styles.listEmpty)}>
        <FormattedMessage
          defaultMessage='(empty)'
          description='Text shown on a list monitor when a list is empty'
          id='gui.monitor.listMonitor.empty'
        />
      </div>
    );
  };

  const rowRenderer = ({ index, key, style }: any) => {
    return (
      <div className={styles.listRow} key={key} style={style}>
        <div className={styles.listIndex}>{index + 1 /* one indexed */}</div>
        <div
          className={styles.listValue}
          dataIndex={index}
          style={{ background: props.categoryColor }}
          onClick={props.draggable ? handleEventFactory(index) : null}
        >
          {props.draggable && props.activeIndex === index ? (
            <div className={styles.inputWrapper}>
              <input
                autoFocus
                autoComplete={false}
                className={classNames(styles.listInput, 'no-drag')}
                spellCheck={false}
                type='text'
                value={props.activeValue}
                onBlur={props.onDeactivate}
                onChange={props.onInput}
                onFocus={props.onFocus}
                onKeyDown={props.onKeyPress} // key down to get ahead of blur
              />
              <div
                className={styles.removeButton}
                onMouseDown={props.onRemove} // mousedown to get ahead of blur
              >
                {'✖︎'}
              </div>
            </div>
          ) : (
            <div className={styles.valueInner}>{props.values[index]}</div>
          )}
        </div>
      </div>
    );
  };

  const { height, values, width, activeIndex, activeValue } = props;
  // Keep the active index in view if defined, else must be undefined for List component
  const scrollToIndex =
    activeIndex === null
      ? undefined
      : activeIndex; /* eslint-disable-line no-undefined */

  return (
    <List
      activeIndex={activeIndex}
      activeValue={activeValue}
      height={height - 44 /* Header/footer size, approx */}
      noRowsRenderer={noRowsRenderer}
      rowCount={values.length}
      rowHeight={24 /* Row size is same for all rows */}
      rowRenderer={rowRenderer}
      scrollToIndex={scrollToIndex} /* eslint-disable-line no-undefined */
      values={values}
      width={width}
    />
  );
};

interface PropsInterface {
  activeIndex?: number;
  activeValue?: string;
  categoryColor?: string;
  draggable?: boolean;
  height: number;
  onActivate?: any;
  onDeactivate?: any;
  onFocus?: any;
  onInput?: any;
  onKeyPress?: any;
  onRemove?: any;
  values: any;
  width: number;
}

// TODO
// ListMonitorScroller.propTypes = {
//   activeIndex: PropTypes.number,
//   activeValue: PropTypes.string,
//   categoryColor: PropTypes.string,
//   draggable: PropTypes.bool,
//   height: PropTypes.number,
//   onActivate: PropTypes.func,
//   onDeactivate: PropTypes.func,
//   onFocus: PropTypes.func,
//   onInput: PropTypes.func,
//   onKeyPress: PropTypes.func,
//   onRemove: PropTypes.func,
//   values: PropTypes.arrayOf(
//     PropTypes.oneOfType([PropTypes.string, PropTypes.number])
//   ),
//   width: PropTypes.number,
// };

export default ListMonitorScroller;
