import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import BackpackComponent from '../components/backpack/backpack.jsx';
import {
  getBackpackContents,
  saveBackpackObject,
  deleteBackpackObject,
  soundPayload,
  costumePayload,
  spritePayload,
  codePayload,
} from '../lib/backpack-api';
import DragConstants from '../lib/drag-constants';
import DropAreaHOC from '../lib/drop-area-hoc.jsx';

import { connect } from 'react-redux';
import storage from '../lib/storage';
import VM from 'scratch-vm';

const dragTypes = [
  DragConstants.COSTUME,
  DragConstants.SOUND,
  DragConstants.SPRITE,
];
const DroppableBackpack = DropAreaHOC(dragTypes)(BackpackComponent);

const Backpack = (props: PropsInterface) => {
  const [states, setStates] = useState({
    // While the DroppableHOC manages drop interactions for asset tiles,
    // we still need to micromanage drops coming from the block workspace.
    // TODO this may be refactorable with the share-the-love logic in SpriteSelectorItem
    blockDragOutsideWorkspace: false,
    blockDragOverBackpack: false,
    error: false,
    itemsPerPage: 20,
    moreToLoad: false,
    loading: false,
    expanded: false,
    contents: [],
  });

  // If a host is given, add it as a web source to the storage module
  // TODO remove the hacky flag that prevents double adding
  if (props.host && !storage._hasAddedBackpackSource) {
    storage.addWebSource(
      [
        storage.AssetType.ImageVector,
        storage.AssetType.ImageBitmap,
        storage.AssetType.Sound,
      ],
      getBackpackAssetURL
    );
    storage._hasAddedBackpackSource = true;
  }

  useEffect(() => {
    props.vm.addListener('BLOCK_DRAG_END', handleBlockDragEnd);
    props.vm.addListener('BLOCK_DRAG_UPDATE', handleBlockDragUpdate);

    if (states.expanded) {
      // Emit resize on window to get blocks to resize
      window.dispatchEvent(new Event('resize'));
    }

    return () => {
      removeListeners();
    };
  }, [states.expanded, handleBlockDragUpdate, props.vm]);

  const removeListeners = () => {
    props.vm.removeListener('BLOCK_DRAG_END', handleBlockDragEnd);
    props.vm.removeListener('BLOCK_DRAG_UPDATE', handleBlockDragUpdate);
  };

  const getBackpackAssetURL = (asset: any) => {
    return `${props.host}/${asset.assetId}.${asset.dataFormat}`;
  };
  const handleToggle = () => {
    const newState = !states.expanded;
    setStates({ ...states, expanded: newState, contents: [] });
    if (newState) {
      getContents();
    }
  };
  const handleDrop = (dragInfo: any) => {
    let payloader: any = null;
    let presaveAsset: any = null;
    switch (dragInfo.dragType) {
      case DragConstants.COSTUME:
        payloader = costumePayload;
        presaveAsset = dragInfo.payload.asset;
        break;
      case DragConstants.SOUND:
        payloader = soundPayload;
        presaveAsset = dragInfo.payload.asset;
        break;
      case DragConstants.SPRITE:
        payloader = spritePayload;
        break;
      case DragConstants.CODE:
        payloader = codePayload;
        break;
    }
    if (!payloader) return;

    // Creating the payload is async, so set loading before starting
    setStates({ ...states, loading: true }, () => {
      payloader(dragInfo.payload, props.vm)
        .then(payload => {
          // Force the asset to save to the asset server before storing in backpack
          // Ensures any asset present in the backpack is also on the asset server
          if (presaveAsset && !presaveAsset.clean) {
            return storage
              .store(
                presaveAsset.assetType,
                presaveAsset.dataFormat,
                presaveAsset.data,
                presaveAsset.assetId
              )
              .then(() => payload);
          }
          return payload;
        })
        .then(payload =>
          saveBackpackObject({
            host: props.host,
            token: props.token,
            username: props.username,
            ...payload,
          })
        )
        .then(item => {
          setStates({
            ...states,
            loading: false,
            contents: [item].concat(states.contents),
          });
        })
        .catch(error => {
          setStates({ ...states, error: true, loading: false });
          throw error;
        });
    });
  };
  const handleDelete = id => {
    setStates({ ...states, loading: true }, () => {
      deleteBackpackObject({
        host: props.host,
        token: props.token,
        username: props.username,
        id: id,
      })
        .then(() => {
          setStates({
            ...states,
            loading: false,
            contents: states.contents.filter(o => o.id !== id),
          });
        })
        .catch(error => {
          setStates({ ...states, error: true, loading: false });
          throw error;
        });
    });
  };
  const getContents = () => {
    if (props.token && props.username) {
      setStates({ ...states, loading: true, error: false }, () => {
        getBackpackContents({
          host: props.host,
          token: props.token,
          username: props.username,
          offset: states.contents.length,
          limit: states.itemsPerPage,
        })
          .then(contents => {
            setStates({
              ...states,
              contents: states.contents.concat(contents),
              moreToLoad: contents.length === states.itemsPerPage,
              loading: false,
            });
          })
          .catch(error => {
            setStates({ ...states, error: true, loading: false });
            throw error;
          });
      });
    }
  };
  const handleBlockDragUpdate = isOutsideWorkspace => {
    setStates({
      ...states,
      blockDragOutsideWorkspace: isOutsideWorkspace,
    });
  };
  const handleMouseEnter = () => {
    if (states.blockDragOutsideWorkspace) {
      setStates({
        ...states,
        blockDragOverBackpack: true,
      });
    }
  };
  const handleMouseLeave = () => {
    setStates({
      ...states,
      blockDragOverBackpack: false,
    });
  };
  const handleBlockDragEnd = (blocks, topBlockId) => {
    if (states.blockDragOverBackpack) {
      handleDrop({
        dragType: DragConstants.CODE,
        payload: {
          blockObjects: blocks,
          topBlockId: topBlockId,
        },
      });
    }
    setStates({
      ...states,
      blockDragOverBackpack: false,
      blockDragOutsideWorkspace: false,
    });
  };
  const handleMore = () => {
    getContents();
  };

  return (
    <DroppableBackpack
      blockDragOver={states.blockDragOverBackpack}
      contents={states.contents}
      error={states.error}
      expanded={states.expanded}
      loading={states.loading}
      showMore={states.moreToLoad}
      onDelete={handleDelete}
      onDrop={handleDrop}
      onMore={handleMore}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onToggle={props.host ? handleToggle : null}
    />
  );
};

interface PropsInterface {
  host: string;
  token: string;
  username: string;
  vm: any;
}

const getTokenAndUsername = (state: any) => {
  // Look for the session state provided by scratch-www
  if (state.session && state.session.session && state.session.session.user) {
    return {
      token: state.session.session.user.token,
      username: state.session.session.user.username,
    };
  }
  // Otherwise try to pull testing params out of the URL, or return nulls
  // TODO a hack for testing the backpack
  const tokenMatches = window.location.href.match(/[?&]token=([^&]*)&?/);
  const usernameMatches = window.location.href.match(/[?&]username=([^&]*)&?/);
  return {
    token: tokenMatches ? tokenMatches[1] : null,
    username: usernameMatches ? usernameMatches[1] : null,
  };
};

const mapStateToProps = (state: any) =>
  Object.assign(
    {
      dragInfo: state.scratchGui.assetDrag,
      vm: state.scratchGui.vm,
      blockDrag: state.scratchGui.blockDrag,
    },
    getTokenAndUsername(state)
  );

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Backpack);
