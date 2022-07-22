import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

import LibraryItem from '../../containers/library-item.jsx';
import Modal from '../../containers/modal.jsx';
import Divider from '../divider/divider.jsx';
import Filter from '../filter/filter.jsx';
import TagButton from '../../containers/tag-button.jsx';
import Spinner from '../spinner/spinner.jsx';

import styles from './library.css';

const messages = defineMessages({
    filterPlaceholder: {
        id: 'gui.library.filterPlaceholder',
        defaultMessage: 'Search',
        description: 'Placeholder text for library search field'
    },
    allTag: {
        id: 'gui.library.allTag',
        defaultMessage: 'All',
        description: 'Label for library tag to revert to all items after filtering by tag.'
    }
});

const ALL_TAG = {tag: 'all', intlLabel: messages.allTag};
const tagListPrefix = [ALL_TAG];

const LibraryComponent = (props) => {
    const [states, setStates] = useState({
        playingItem: null,
        filterQuery: '',
        selectedTag: ALL_TAG.tag,
        loaded: false
    });

    useEffect(() => {
        // Allow the spinner to display before loading the content
        setTimeout(() => {
             setStates({
                ...states,
                loaded: true
             });
        });
        if ( props.setStopHandler)  props.setStopHandler( handlePlayingEnd);

    }, []);

    useEffect(() => {
        scrollToTop();
    }, [states.filterQuery, states.selectedTag]);

    const handleSelect = (id) => {
         handleClose();
         props.onItemSelected( getFilteredData()[id]);
    }
    const handleClose = () => {
         props.onRequestClose();
    }
    const handleTagClick = (tag) => {
        if ( states.playingItem === null) {
             setStates({
                ...states,
                filterQuery: '',
                selectedTag: tag.toLowerCase()
            });
        } else {
             props.onItemMouseLeave( getFilteredData()[[ states.playingItem]]);
             setStates({
                ...states,
                filterQuery: '',
                playingItem: null,
                selectedTag: tag.toLowerCase()
            });
        }
    }
    const handleMouseEnter = (id) => {
        // don't restart if mouse over already playing item
        if ( props.onItemMouseEnter &&  states.playingItem !== id) {
             props.onItemMouseEnter( getFilteredData()[id]);
             setStates({
                ...states,
                playingItem: id
            });
        }
    }
    const handleMouseLeave = (id) => {
        if ( props.onItemMouseLeave) {
             props.onItemMouseLeave( getFilteredData()[id]);
             setStates({
                ...states,
                playingItem: null
            });
        }
    }
    const handlePlayingEnd = () => {
        if ( states.playingItem !== null) {
             setStates({
                ...states,
                playingItem: null
            });
        }
    }
    const handleFilterChange = (event) => {
        if ( states.playingItem === null) {
             setStates({
                ...states,
                filterQuery: event.target.value,
                selectedTag: ALL_TAG.tag
            });
        } else {
             props.onItemMouseLeave( getFilteredData()[[ states.playingItem]]);
             setStates({
                filterQuery: event.target.value,
                playingItem: null,
                selectedTag: ALL_TAG.tag
            });
        }
    }
    const handleFilterClear = () => {
         setStates({
            ...states,
            filterQuery: ''
         });
    }
    const getFilteredData = () => {
        if ( states.selectedTag === 'all') {
            if (!states.filterQuery) return  props.data;
            return  props.data.filter(dataItem => (
                (dataItem.tags || [])
                    // Second argument to map sets `this`
                    .map(String.prototype.toLowerCase.call, String.prototype.toLowerCase)
                    .concat(dataItem.name ?
                        (typeof dataItem.name === 'string' ?
                        // Use the name if it is a string, else use formatMessage to get the translated name
                            dataItem.name :  props.intl.formatMessage(dataItem.name.props)
                        ).toLowerCase() :
                        null)
                    .join('\n') // unlikely to partially match newlines
                    .indexOf( states.filterQuery.toLowerCase()) !== -1
            ));
        }
        return  props.data.filter(dataItem => (
            dataItem.tags &&
            dataItem.tags
                .map(String.prototype.toLowerCase.call, String.prototype.toLowerCase)
                .indexOf( states.selectedTag) !== -1
        ));
    }
    
    const scrollToTop = () => {
        //  filteredDataRef.scrollTop = 0;
    }
    const setFilteredDataRef = (ref) => {
        //  filteredDataRef = ref;
        // console.log(ref);
    }
    
    return (
        <Modal
            fullScreen
            contentLabel={ props.title}
            id={ props.id}
            onRequestClose={ handleClose}
            >
                {( props.filterable ||  props.tags) && (
                    <div className={styles.filterBar}>
                        { props.filterable && (
                            <Filter
                                className={classNames(
                                    styles.filterBarItem,
                                    styles.filter
                                )}
                                filterQuery={ states.filterQuery}
                                inputClassName={styles.filterInput}
                                placeholderText={ props.intl.formatMessage(messages.filterPlaceholder)}
                                onChange={ handleFilterChange}
                                onClear={ handleFilterClear}
                            />
                        )}
                        { props.filterable &&  props.tags && (
                            <Divider className={classNames(styles.filterBarItem, styles.divider)} />
                        )}
                        { props.tags &&
                            <div className={styles.tagWrapper}>
                                {tagListPrefix.concat( props.tags).map((tagProps, id) => (
                                    <TagButton
                                        active={ states.selectedTag === tagProps.tag.toLowerCase()}
                                        className={classNames(
                                            styles.filterBarItem,
                                            styles.tagButton,
                                            tagProps.className
                                        )}
                                        key={`tag-button-${id}`}
                                        onClick={ handleTagClick}
                                        {...tagProps}
                                    />
                                ))}
                            </div>
                        }
                    </div>
                )}
                <div
                    className={classNames(styles.libraryScrollGrid, {
                        [styles.withFilterBar]:  props.filterable ||  props.tags
                    })}
                    ref={setFilteredDataRef}
                >
                    { states.loaded ?  getFilteredData().map((dataItem, index) => (
                        <LibraryItem
                            bluetoothRequired={dataItem.bluetoothRequired}
                            collaborator={dataItem.collaborator}
                            description={dataItem.description}
                            disabled={dataItem.disabled}
                            extensionId={dataItem.extensionId}
                            featured={dataItem.featured}
                            hidden={dataItem.hidden}
                            iconMd5={dataItem.costumes ? dataItem.costumes[0].md5ext : dataItem.md5ext}
                            iconRawURL={dataItem.rawURL}
                            icons={dataItem.costumes}
                            id={index}
                            insetIconURL={dataItem.insetIconURL}
                            internetConnectionRequired={dataItem.internetConnectionRequired}
                            isPlaying={ states.playingItem === index}
                            // key={typeof dataItem.name === 'string' ? dataItem.name : dataItem.rawURL}
                            key={index}
                            name={dataItem.name}
                            showPlayButton={ props.showPlayButton}
                            onMouseEnter={ handleMouseEnter}
                            onMouseLeave={ handleMouseLeave}
                            onSelect={ handleSelect}
                        />
                    )) : (
                        <div className={styles.spinnerWrapper}>
                            <Spinner
                                large
                                level="primary"
                            />
                        </div>
                    )}
                </div>
        </Modal>
    );
};

LibraryComponent.propTypes = {
    data: PropTypes.arrayOf(
        /* eslint-disable react/no-unused-prop-types, lines-around-comment */
        // An item in the library
        PropTypes.shape({
            // @todo remove md5/rawURL prop from library, refactor to use storage
            md5: PropTypes.string,
            name: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.node
            ]),
            rawURL: PropTypes.string,
            path: PropTypes.string,
        })
        /* eslint-enable react/no-unused-prop-types, lines-around-comment */
    ),
    filterable: PropTypes.bool,
    id: PropTypes.string.isRequired,
    intl: intlShape.isRequired,
    onItemMouseEnter: PropTypes.func,
    onItemMouseLeave: PropTypes.func,
    onItemSelected: PropTypes.func,
    onRequestClose: PropTypes.func,
    setStopHandler: PropTypes.func,
    showPlayButton: PropTypes.bool,
    tags: PropTypes.arrayOf(PropTypes.shape(TagButton.propTypes)),
    title: PropTypes.string.isRequired
};

LibraryComponent.defaultProps = {
    filterable: true,
    showPlayButton: false
};

export default injectIntl(LibraryComponent);
