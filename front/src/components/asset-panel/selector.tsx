import classNames from 'classnames';
import SpriteSelectorItem from '../../containers/sprite-selector-item.js';
import SortableHOC from '../../lib/sortable-hoc.jsx';
import ActionMenu from '../action-menu/action-menu.js';
import Box from '../box/box.jsx';
import SortableAsset from './sortable-asset.jsx';

import styles from './selector.module.css';

const Selector = (props: PropsInterface) => {
  const {
    buttons,
    containerRef,
    dragType,
    isRtl,
    items,
    selectedItemIndex,
    draggingIndex,
    draggingType,
    ordering,
    onAddSortable,
    onRemoveSortable,
    onDeleteClick,
    onDuplicateClick,
    onExportClick,
    onItemClick,
  } = props;

  const isRelevantDrag = draggingType === dragType;

  let newButtonSection = null;

  if (buttons.length > 0) {
    const { img, title, onClick } = buttons[0];
    const moreButtons = buttons.slice(1);
    newButtonSection = (
      <Box className={styles.newButtons}>
        <ActionMenu
          img={img}
          moreButtons={moreButtons}
          title={title}
          tooltipPlace={isRtl ? 'left' : 'right'}
          onClick={onClick}
          className={''}
        />
      </Box>
    );
  }

  return (
    <Box className={styles.wrapper} componentRef={containerRef}>
      <Box className={styles.listArea}>
        {items.map((item: any, index: any) => (
          <SortableAsset
            id={item.name}
            index={isRelevantDrag ? ordering.indexOf(index) : index}
            key={item.name}
            onAddSortable={onAddSortable}
            onRemoveSortable={onRemoveSortable}
          >
            <SpriteSelectorItem
              asset={item.asset}
              className={classNames(styles.listItem, {
                [styles.placeholder]: isRelevantDrag && index === draggingIndex,
              })}
              costumeURL={item.url}
              details={item.details}
              dragPayload={item.dragPayload}
              dragType={dragType}
              id={index}
              index={index}
              name={item.name}
              number={index + 1 /* 1-indexed */}
              selected={index === selectedItemIndex}
              onClick={onItemClick}
              onDeleteButtonClick={onDeleteClick}
              onDuplicateButtonClick={onDuplicateClick}
              onExportButtonClick={onExportClick}
            />
          </SortableAsset>
        ))}
      </Box>
      {newButtonSection}
    </Box>
  );
};

interface PropsInterface {
  buttons: any;
  containerRef: any;
  dragType: any;
  draggingIndex: number;
  draggingType: any;
  isRtl: boolean;
  items: any;
  onAddSortable: any;
  onDeleteClick: any;
  onDuplicateClick: any;
  onExportClick: any;
  onItemClick: any;
  onRemoveSortable: any;
  ordering: any;
  selectedItemIndex: number;
}

// TODO
// Selector.propTypes = {
//     buttons: PropTypes.arrayOf(PropTypes.shape({
//         title: PropTypes.string.isRequired,
//         img: PropTypes.string.isRequired,
//         onClick: PropTypes.func
//     })),
//     containerRef: PropTypes.func,
//     dragType: PropTypes.oneOf(Object.keys(DragConstants)),
//     draggingIndex: PropTypes.number,
//     draggingType: PropTypes.oneOf(Object.keys(DragConstants)),
//     isRtl: PropTypes.bool,
//     items: PropTypes.arrayOf(PropTypes.shape({
//         url: PropTypes.string,
//         name: PropTypes.string.isRequired
//     })),
//     onAddSortable: PropTypes.func,
//     onDeleteClick: PropTypes.func,
//     onDuplicateClick: PropTypes.func,
//     onExportClick: PropTypes.func,
//     onItemClick: PropTypes.func.isRequired,
//     onRemoveSortable: PropTypes.func,
//     ordering: PropTypes.arrayOf(PropTypes.number),
//     selectedItemIndex: PropTypes.number.isRequired
// };

export default SortableHOC(Selector);
