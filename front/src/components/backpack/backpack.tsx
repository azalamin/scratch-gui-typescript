import classNames from 'classnames';
import { FC } from 'react';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  IntlShape,
} from 'react-intl';
import SpriteSelectorItem from '../../containers/sprite-selector-item';
import DragConstants from '../../lib/drag-constants';
import { ComingSoonTooltip } from '../coming-soon/coming-soon';
import styles from './backpack.module.css';

// TODO make sprite selector item not require onClick
const noop = () => {};

const dragTypeMap: any = {
  // Keys correspond with the backpack-server item types
  costume: DragConstants.BACKPACK_COSTUME,
  sound: DragConstants.BACKPACK_SOUND,
  script: DragConstants.BACKPACK_CODE,
  sprite: DragConstants.BACKPACK_SPRITE,
};

const labelMap: any = defineMessages({
  costume: {
    id: 'gui.backpack.costumeLabel',
    defaultMessage: 'costume',
    description: 'Label for costume backpack item',
  },
  sound: {
    id: 'gui.backpack.soundLabel',
    defaultMessage: 'sound',
    description: 'Label for sound backpack item',
  },
  script: {
    id: 'gui.backpack.scriptLabel',
    defaultMessage: 'script',
    description: 'Label for script backpack item',
  },
  sprite: {
    id: 'gui.backpack.spriteLabel',
    defaultMessage: 'sprite',
    description: 'Label for sprite backpack item',
  },
});

const Backpack: FC<PropsInterface> = ({
  blockDragOver,
  containerRef,
  contents,
  dragOver,
  error,
  expanded,
  intl,
  loading,
  showMore,
  onToggle,
  onDelete,
  onMouseEnter,
  onMouseLeave,
  onMore,
}) => (
  <div className={styles.backpackContainer}>
    <div className={styles.backpackHeader} onClick={onToggle}>
      {onToggle ? (
        <FormattedMessage
          defaultMessage='Backpack'
          description='Button to open the backpack'
          id='gui.backpack.header'
        />
      ) : (
        <ComingSoonTooltip place='top' tooltipId='backpack-tooltip'>
          <FormattedMessage
            defaultMessage='Backpack'
            description='Button to open the backpack'
            id='gui.backpack.header'
          />
        </ComingSoonTooltip>
      )}
    </div>
    {expanded ? (
      <div
        className={classNames(styles.backpackList, {
          [styles.dragOver]: dragOver || blockDragOver,
        })}
        ref={containerRef}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {error ? (
          <div className={styles.statusMessage}>
            <FormattedMessage
              defaultMessage='Error loading backpack'
              description='Error backpack message'
              id='gui.backpack.errorBackpack'
            />
          </div>
        ) : loading ? (
          <div className={styles.statusMessage}>
            <FormattedMessage
              defaultMessage='Loading...'
              description='Loading backpack message'
              id='gui.backpack.loadingBackpack'
            />
          </div>
        ) : contents.length > 0 ? (
          <div className={styles.backpackListInner}>
            {contents.map((item: any) => (
              <SpriteSelectorItem
                className={styles.backpackItem}
                costumeURL={item.thumbnailUrl}
                details={item.name}
                dragPayload={item}
                dragType={dragTypeMap[item.type]}
                id={item.id}
                key={item.id}
                name={intl.formatMessage(labelMap[item.type])}
                selected={false}
                onClick={noop}
                onDeleteButtonClick={onDelete}
              />
            ))}
            {showMore && (
              <button className={styles.more} onClick={onMore}>
                <FormattedMessage
                  defaultMessage='More'
                  description='Load more from backpack'
                  id='gui.backpack.more'
                />
              </button>
            )}
          </div>
        ) : (
          <div className={styles.statusMessage}>
            <FormattedMessage
              defaultMessage='Backpack is empty'
              description='Empty backpack message'
              id='gui.backpack.emptyBackpack'
            />
          </div>
        )}
      </div>
    ) : null}
  </div>
);

interface PropsInterface {
  blockDragOver: boolean;
  containerRef: any;
  contents: any;
  dragOver: boolean;
  error: boolean;
  expanded: boolean;
  intl: IntlShape;
  loading: boolean;
  onDelete: any;
  onMore: any;
  onMouseEnter: any;
  onMouseLeave: any;
  onToggle: any;
  showMore: boolean;
}

// TODO
// Backpack.propTypes = {
//     blockDragOver: PropTypes.bool,
//     containerRef: PropTypes.func,
//     contents: PropTypes.arrayOf(PropTypes.shape({
//         id: PropTypes.string,
//         thumbnailUrl: PropTypes.string,
//         type: PropTypes.string,
//         name: PropTypes.string
//     })),
//     dragOver: PropTypes.bool,
//     error: PropTypes.bool,
//     expanded: PropTypes.bool,
//     intl: intlShape,
//     loading: PropTypes.bool,
//     onDelete: PropTypes.func,
//     onMore: PropTypes.func,
//     onMouseEnter: PropTypes.func,
//     onMouseLeave: PropTypes.func,
//     onToggle: PropTypes.func,
//     showMore: PropTypes.bool
// };

Backpack.defaultProps = {
  blockDragOver: false,
  contents: [],
  dragOver: false,
  expanded: false,
  loading: false,
  showMore: false,
  onMore: null,
  onToggle: null,
};

export default injectIntl(Backpack);
