import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactTooltip from 'react-tooltip';

// import styles from './action-menu.css';
import styles from './actionMenu.module.css';

const CLOSE_DELAY = 300; // ms

const ActionMenu = (props: PropsInterface) => {
  const [states, setStates] = useState<any>({
    isOpen: false,
    forceHide: false,
  });

  let mainTooltipId: any = `tooltip-${Math.random()}`;
  let buttonRef: any = useRef();
  let containerRef: any = useRef();

  let closeTimeoutId: any;
  const handleClosePopover = () => {
    closeTimeoutId = setTimeout(() => {
      setStates({
        ...states,
        isOpen: false,
      });
      closeTimeoutId = null;
    }, CLOSE_DELAY);
  };
  const handleToggleOpenState = useCallback(() => {
    if (closeTimeoutId) {
      clearTimeout(closeTimeoutId);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      closeTimeoutId = null;
    } else if (!states.isOpen) {
      setStates({
        isOpen: true,
        forceHide: false,
      });
    }
  }, []);

  const handleTouchOutside = useCallback(
    e => {
      if (states.isOpen && !containerRef.contains(e.target)) {
        setStates({ ...states, isOpen: false });
        ReactTooltip.hide();
      }
    },
    [states]
  );

  const clickDelayer = (fn: any) => {
    // Return a wrapped action that manages the menu closing.
    // @todo we may be able to use react-transition for this in the future
    // for now all this work is to ensure the menu closes BEFORE the
    // (possibly slow) action is started.
    return (event: any) => {
      ReactTooltip.hide();
      if (fn) fn(event);
      // Blur the button so it does not keep focus after being clicked
      // This prevents keyboard events from triggering the button
      buttonRef.blur();
      setStates({ forceHide: true, isOpen: false });
    };
  };

  const handleTouchStart = useCallback(
    e => {
      if (!states.isOpen) {
        e.preventDefault();
        handleToggleOpenState();
      }
    },
    [handleToggleOpenState, states.isOpen]
  );

  const removeEventListeners = useCallback(() => {
    buttonRef.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchstart', handleTouchOutside);
  }, [handleTouchOutside, handleTouchStart]);

  const setButtonRef = (ref: any) => {
    buttonRef = ref;
  };
  const setContainerRef = (ref: any) => {
    containerRef = ref;
  };

  useEffect(() => {
    if (states.forceHide)
      setTimeout(() => setStates({ ...states, forceHide: false }));
  }, [states, states.forceHide]);

  useEffect(() => {
    // Touch start on the main button is caught to trigger open and not click
    buttonRef.addEventListener('touchstart', handleTouchStart);
    // Touch start on document is used to trigger close if it is outside
    document.addEventListener('touchstart', handleTouchOutside);

    return () => {
      removeEventListeners();
    };
  }, [handleTouchStart, handleTouchOutside, removeEventListeners]);

  const {
    className,
    img: mainImg,
    title: mainTitle,
    moreButtons,
    tooltipPlace,
    onClick,
  } = props;

  return (
    <div
      className={classNames(styles.menuContainer, className, {
        [styles.expanded]: states.isOpen,
        [styles.forceHidden]: states.forceHide,
      })}
      ref={setContainerRef}
      onMouseEnter={handleToggleOpenState}
      onMouseLeave={handleClosePopover}
    >
      <button
        aria-label={mainTitle}
        className={classNames(styles.button, styles.mainButton)}
        data-for={mainTooltipId}
        data-tip={mainTitle}
        ref={setButtonRef}
        onClick={clickDelayer(onClick)}
      >
        <img
          className={styles.mainIcon}
          draggable={false}
          src={mainImg}
          alt=''
        />
      </button>
      <ReactTooltip
        className={styles.tooltip}
        effect='solid'
        id={mainTooltipId}
        place={tooltipPlace || 'left'}
      />
      <div className={styles.moreButtonsOuter}>
        <div className={styles.moreButtons}>
          {(moreButtons || []).map(
            (
              {
                img,
                title,
                onClick: handleClick,
                fileAccept,
                fileChange,
                fileInput,
                fileMultiple,
              }: any,
              keyId: any
            ) => {
              const isComingSoon = !handleClick;
              const hasFileInput = fileInput;
              const tooltipId = `${mainTooltipId}-${title}`;
              return (
                <div key={`${tooltipId}-${keyId}`}>
                  <button
                    aria-label={title}
                    className={classNames(styles.button, styles.moreButton, {
                      [styles.comingSoon]: isComingSoon,
                    })}
                    data-for={tooltipId}
                    data-tip={title}
                    onClick={
                      hasFileInput ? handleClick : clickDelayer(handleClick)
                    }
                  >
                    <img
                      className={styles.moreIcon}
                      draggable={false}
                      src={img}
                      alt=''
                    />
                    {hasFileInput ? (
                      <input
                        accept={fileAccept}
                        className={styles.fileInput}
                        multiple={fileMultiple}
                        ref={fileInput}
                        type='file'
                        onChange={fileChange}
                      />
                    ) : null}
                  </button>
                  <ReactTooltip
                    className={classNames(styles.tooltip, {
                      [styles.comingSoonTooltip]: isComingSoon,
                    })}
                    effect='solid'
                    id={tooltipId}
                    place={tooltipPlace || 'left'}
                  />
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
};

interface PropsInterface {
  className: string;
  img: string;
  moreButtons: any;
  onClick: any;
  title: any;
  tooltipPlace: any;
}

// TODO
// ActionMenu.propTypes = {
//     className: PropTypes.string,
//     img: PropTypes.string,
//     moreButtons: PropTypes.arrayOf(PropTypes.shape({
//         img: PropTypes.string,
//         title: PropTypes.node.isRequired,
//         onClick: PropTypes.func, // Optional, "coming soon" if no callback provided
//         fileAccept: PropTypes.string, // Optional, only for file upload
//         fileChange: PropTypes.func, // Optional, only for file upload
//         fileInput: PropTypes.func, // Optional, only for file upload
//         fileMultiple: PropTypes.bool // Optional, only for file upload
//     })),
//     onClick: PropTypes.func.isRequired,
//     title: PropTypes.node.isRequired,
//     tooltipPlace: PropTypes.string
// };

export default React.memo(ActionMenu);
