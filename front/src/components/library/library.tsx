import classNames from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import { defineMessages, injectIntl, IntlShape } from 'react-intl';

import LibraryItem from '../../containers/library-item.js';
import Modal from '../../containers/modal.js';
import TagButton from '../../containers/tag-button.js';
import Divider from '../divider/divider.js';
import Filter from '../filter/filter.js';
import Spinner from '../spinner/spinner.jsx';

import styles from './library.module.css';

const messages = defineMessages({
  filterPlaceholder: {
    id: 'gui.library.filterPlaceholder',
    defaultMessage: 'Search',
    description: 'Placeholder text for library search field',
  },
  allTag: {
    id: 'gui.library.allTag',
    defaultMessage: 'All',
    description:
      'Label for library tag to revert to all items after filtering by tag.',
  },
});

const ALL_TAG = { tag: 'all', intlLabel: messages.allTag };
const tagListPrefix = [ALL_TAG];

let filteredDataRef: any;

const LibraryComponent = (props: PropsInterface) => {
  const [states, setStates] = useState<any>({
    playingItem: null,
    filterQuery: '',
    selectedTag: ALL_TAG.tag,
    loaded: false,
  });

  useEffect(() => {
    scrollToTop();
  }, [states.filterQuery, states.selectedTag]);

  const handleSelect: any = (id: any) => {
    handleClose();
    props.onItemSelected(getFilteredData()[id]);
  };
  const handleClose = () => {
    props.onRequestClose();
  };
  const handleTagClick = (tag: string) => {
    if (states.playingItem === null) {
      setStates({
        ...states,
        filterQuery: '',
        selectedTag: tag.toLowerCase(),
      });
    } else {
      props.onItemMouseLeave(getFilteredData()[states.playingItem]);
      setStates({
        ...states,
        filterQuery: '',
        playingItem: null,
        selectedTag: tag.toLowerCase(),
      });
    }
  };
  const handleMouseEnter: any = (id: any) => {
    // don't restart if mouse over already playing item
    if (props.onItemMouseEnter && states.playingItem !== id) {
      props.onItemMouseEnter(getFilteredData()[id]);
      setStates({
        ...states,
        playingItem: id,
      });
    }
  };
  const handleMouseLeave: any = (id: any) => {
    if (props.onItemMouseLeave) {
      props.onItemMouseLeave(getFilteredData()[id]);
      setStates({
        ...states,
        playingItem: null,
      });
    }
  };
  const handlePlayingEnd = useCallback(() => {
    if (states.playingItem !== null) {
      setStates({
        ...states,
        playingItem: null,
      });
    }
  }, [states]);

  const handleFilterChange = (event: any) => {
    if (states.playingItem === null) {
      setStates({
        ...states,
        filterQuery: event.target.value,
        selectedTag: ALL_TAG.tag,
      });
    } else {
      props.onItemMouseLeave(getFilteredData()[states.playingItem]); // Modified-states.
      setStates({
        filterQuery: event.target.value,
        playingItem: null,
        selectedTag: ALL_TAG.tag,
      });
    }
  };
  const handleFilterClear = () => {
    setStates({
      ...states,
      filterQuery: '',
    });
  };
  const getFilteredData = () => {
    if (states.selectedTag === 'all') {
      if (!states.filterQuery) return props.data;
      return props.data.filter(
        (dataItem: any) =>
          (dataItem.tags || [])
            // Second argument to map sets `this`
            .map(
              String.prototype.toLowerCase.call,
              String.prototype.toLowerCase
            )
            .concat(
              dataItem.name
                ? (typeof dataItem.name === 'string'
                    ? // Use the name if it is a string, else use formatMessage to get the translated name
                      dataItem.name
                    : props.intl.formatMessage(dataItem.name.props)
                  ).toLowerCase()
                : null
            )
            .join('\n') // unlikely to partially match newlines
            .indexOf(states.filterQuery.toLowerCase()) !== -1
      );
    }
    return props.data.filter(
      (dataItem: any) =>
        dataItem.tags &&
        dataItem.tags
          .map(String.prototype.toLowerCase.call, String.prototype.toLowerCase)
          .indexOf(states.selectedTag) !== -1
    );
  };

  const scrollToTop = () => {
    filteredDataRef.scrollTop = 0;
  };
  const setFilteredDataRef = (ref: any) => {
    filteredDataRef = ref;
    console.log(ref);
  };

  useEffect(() => {
    // Allow the spinner to display before loading the content
    setTimeout(() => {
      setStates({
        ...states,
        loaded: true,
      });
    });
    if (props.setStopHandler) props.setStopHandler(handlePlayingEnd);
  }, [handlePlayingEnd, props, states]);

  return (
    <Modal
      fullScreen
      contentLabel={props.title}
      id={props.id}
      onRequestClose={handleClose}
    >
      {(props.filterable || props.tags) && (
        <div className={styles.filterBar}>
          {props.filterable && (
            <Filter
              className={classNames(styles.filterBarItem, styles.filter)}
              filterQuery={states.filterQuery}
              inputClassName={styles.filterInput}
              placeholderText={props.intl.formatMessage(
                messages.filterPlaceholder
              )}
              onChange={handleFilterChange}
              onClear={handleFilterClear}
            />
          )}
          {props.filterable && props.tags && (
            <Divider
              className={classNames(styles.filterBarItem, styles.divider)}
            />
          )}
          {props.tags && (
            <div className={styles.tagWrapper}>
              {tagListPrefix
                .concat(props.tags)
                .map((tagProps: any, id: any) => (
                  <TagButton
                    active={states.selectedTag === tagProps.tag.toLowerCase()}
                    className={classNames(
                      styles.filterBarItem,
                      styles.tagButton,
                      tagProps.className
                    )}
                    key={`tag-button-${id}`}
                    onClick={handleTagClick}
                    {...tagProps}
                  />
                ))}
            </div>
          )}
        </div>
      )}
      <div
        className={classNames(styles.libraryScrollGrid, {
          [styles.withFilterBar]: props.filterable || props.tags,
        })}
        ref={setFilteredDataRef}
      >
        {states.loaded ? (
          getFilteredData().map((dataItem: any, index: any) => (
            <LibraryItem
              bluetoothRequired={dataItem.bluetoothRequired}
              collaborator={dataItem.collaborator}
              description={dataItem.description}
              disabled={dataItem.disabled}
              extensionId={dataItem.extensionId}
              featured={dataItem.featured}
              hidden={dataItem.hidden}
              iconMd5={
                dataItem.costumes
                  ? dataItem.costumes[0].md5ext
                  : dataItem.md5ext
              }
              iconRawURL={dataItem.rawURL}
              icons={dataItem.costumes}
              id={index}
              insetIconURL={dataItem.insetIconURL}
              internetConnectionRequired={dataItem.internetConnectionRequired}
              //   key={typeof dataItem.name === 'string' ? dataItem.name : dataItem.rawURL}
              key={index}
              name={dataItem.name}
              showPlayButton={props.showPlayButton}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onSelect={handleSelect}
              isPlaying={states.playingItem === index}
            />
          ))
        ) : (
          <div className={styles.spinnerWrapper}>
            <Spinner large level='primary' />
          </div>
        )}
      </div>
    </Modal>
  );
};

interface PropsInterface {
  data: any;
  filterable: boolean;
  id: string;
  intl: IntlShape;
  onItemMouseEnter: any;
  onItemMouseLeave: any;
  onItemSelected: any;
  onRequestClose: any;
  setStopHandler: any;
  showPlayButton: any;
  tags: any;
  title: string;
}

// TODO
// LibraryComponent.propTypes = {
//   data: PropTypes.arrayOf(
//     /* eslint-disable react/no-unused-prop-types, lines-around-comment */
//     // An item in the library
//     PropTypes.shape({
//       // @todo remove md5/rawURL prop from library, refactor to use storage
//       md5: PropTypes.string,
//       name: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
//       rawURL: PropTypes.string,
//       path: PropTypes.string,
//     })
//     /* eslint-enable react/no-unused-prop-types, lines-around-comment */
//   ),
//   filterable: PropTypes.bool,
//   id: PropTypes.string.isRequired,
//   intl: intlShape.isRequired,
//   onItemMouseEnter: PropTypes.func,
//   onItemMouseLeave: PropTypes.func,
//   onItemSelected: PropTypes.func,
//   onRequestClose: PropTypes.func,
//   setStopHandler: PropTypes.func,
//   showPlayButton: PropTypes.bool,
//   tags: PropTypes.arrayOf(PropTypes.shape(TagButton.propTypes)),
//   title: PropTypes.string.isRequired,
// };

LibraryComponent.defaultProps = {
  filterable: true,
  showPlayButton: false,
};

export default injectIntl(LibraryComponent);
