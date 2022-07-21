import { useEffect } from 'react';
import { connect } from 'react-redux';

import {
  activateDeck,
  closeCards,
  dragCard,
  endDrag,
  nextStep,
  prevStep,
  shrinkExpandCards,
  startDrag,
} from '../reducers/cards';

import { openTipsLibrary } from '../reducers/modals';

import CardsComponent from '../components/cards/cards.jsx';
import { notScratchDesktop } from '../lib/isScratchDesktop';
import { loadImageData } from '../lib/libraries/decks/translate-image.js';

const Cards = (props: PropsInterface) => {
  useEffect(() => {
    if (props.locale !== 'en') {
      loadImageData(props.locale);
    }
  }, [props.locale]);

  return <CardsComponent {...props} />;
};

interface PropsInterface {
  locale: string;
}

const mapStateToProps = (state: any) => ({
  visible: state.scratchGui.cards.visible,
  content: state.scratchGui.cards.content,
  activeDeckId: state.scratchGui.cards.activeDeckId,
  step: state.scratchGui.cards.step,
  expanded: state.scratchGui.cards.expanded,
  x: state.scratchGui.cards.x,
  y: state.scratchGui.cards.y,
  isRtl: state.locales.isRtl,
  locale: state.locales.locale,
  dragging: state.scratchGui.cards.dragging,
  showVideos: notScratchDesktop(),
});

const mapDispatchToProps = (dispatch: any) => ({
  onActivateDeckFactory: (id: any) => () => dispatch(activateDeck(id)),
  onShowAll: () => {
    dispatch(openTipsLibrary());
    dispatch(closeCards());
  },
  onCloseCards: () => dispatch(closeCards()),
  onShrinkExpandCards: () => dispatch(shrinkExpandCards()),
  onNextStep: () => dispatch(nextStep()),
  onPrevStep: () => dispatch(prevStep()),
  onDrag: (e_: any, data: any) => dispatch(dragCard(data.x, data.y)),
  onStartDrag: () => dispatch(startDrag()),
  onEndDrag: () => dispatch(endDrag()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Cards);
