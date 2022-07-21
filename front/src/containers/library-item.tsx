import { useEffect, useState } from 'react';
import { injectIntl } from 'react-intl';

import LibraryItemComponent from '../components/library-item/library-item.jsx';

const LibraryItem: any = (props: PropsInterface) => {
  const [iconStatus, setIconStatus] = useState<any>({
    iconIndex: 0,
    isRotatingIcon: false,
  });

  let intervalId: any;

  useEffect(() => {
    return () => {
      clearInterval(intervalId);
    };
  }, [intervalId]);

  const handleBlur = () => {
    handleMouseLeave();
  };

  const handleClick = (e: any) => {
    if (!props.disabled) {
      props.onSelect(props.id);
    }
    e.preventDefault();
  };

  const handleFocus = () => {
    if (!props.showPlayButton) {
      handleMouseEnter();
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      props.onSelect(props.id);
    }
  };

  const handleMouseEnter = () => {
    // only show hover effects on the item if not showing a play button
    if (!props.showPlayButton) {
      props.onMouseEnter(props.id);
      if (props.icons && props.icons.length) {
        stopRotatingIcons();
        setIconStatus({
          ...iconStatus,
          isRotatingIcon: true,
        });
      }
    }
  };

  const handleMouseLeave = () => {
    // only show hover effects on the item if not showing a play button
    if (!props.showPlayButton) {
      props.onMouseLeave(props.id);
      if (props.icons && props.icons.length) {
        setIconStatus({
          ...iconStatus,
          isRotatingIcon: false,
        });
      }
    }
  };

  const handlePlay = () => {
    props.onMouseEnter(props.id);
  };

  const handleStop = () => {
    props.onMouseLeave(props.id);
  };

  const startRotatingIcons = () => {
    rotateIcon();
    intervalId = setInterval(rotateIcon, 300);
  };

  const stopRotatingIcons = () => {
    if (intervalId) {
      intervalId = clearInterval(intervalId);
    }
  };

  const rotateIcon = () => {
    const nextIconIndex = (iconStatus.iconIndex + 1) % props.icons.length;
    setIconStatus({ iconIndex: nextIconIndex });
  };

  const curIconMd5 = () => {
    const iconMd5Prop = props.iconMd5;
    if (
      props.icons &&
      iconStatus.isRotatingIcon &&
      iconStatus.iconIndex < props.icons.length
    ) {
      const icon = props.icons[iconStatus.iconIndex] || {};
      return (
        icon.md5ext || // 3.0 library format
        icon.baseLayerMD5 || // 2.0 library format, TODO GH-5084
        iconMd5Prop
      );
    }
    return iconMd5Prop;
  };

  const iconMd5 = curIconMd5();
  const iconURL = iconMd5
    ? `https://cdn.assets.scratch.mit.edu/internalapi/asset/${iconMd5}/get/`
    : props.iconRawURL;

  return (
    <LibraryItemComponent
      bluetoothRequired={props.bluetoothRequired}
      collaborator={props.collaborator}
      description={props.description}
      disabled={props.disabled}
      extensionId={props.extensionId}
      featured={props.featured}
      hidden={props.hidden}
      iconURL={iconURL}
      icons={props.icons}
      id={props.id}
      insetIconURL={props.insetIconURL}
      internetConnectionRequired={props.internetConnectionRequired}
      isPlaying={props.isPlaying}
      name={props.name}
      showPlayButton={props.showPlayButton}
      onBlur={handleBlur}
      onClick={handleClick}
      onFocus={handleFocus}
      onKeyPress={handleKeyPress}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onPlay={handlePlay}
      onStop={handleStop}
    />
  );
};

interface PropsInterface {
  bluetoothRequired: boolean;
  collaborator: string;
  description: string | JSX.Element;
  disabled: boolean;
  extensionId: string;
  featured: boolean;
  hidden: boolean;
  iconMd5: string;
  iconRawURL: string;
  icons: any; // todo
  id: number;
  insetIconURL: string;
  internetConnectionRequired: boolean;
  isPlaying: boolean;
  name: string | JSX.Element;
  onMouseEnter: any;
  onMouseLeave: any;
  onSelect: any;
  showPlayButton: boolean;
}

// todo types
// LibraryItem.propTypes = {
//     bluetoothRequired: PropTypes.bool,
//     collaborator: PropTypes.string,
//     description: PropTypes.oneOfType([
//         PropTypes.string,
//         PropTypes.node
//     ]),
//     disabled: PropTypes.bool,
//     extensionId: PropTypes.string,
//     featured: PropTypes.bool,
//     hidden: PropTypes.bool,
//     iconMd5: PropTypes.string,
//     iconRawURL: PropTypes.string,
//     icons: PropTypes.arrayOf(
//         PropTypes.shape({
//             baseLayerMD5: PropTypes.string, // 2.0 library format, TODO GH-5084
//             md5ext: PropTypes.string // 3.0 library format
//         })
//     ),
//     id: PropTypes.number.isRequired,
//     insetIconURL: PropTypes.string,
//     internetConnectionRequired: PropTypes.bool,
//     isPlaying: PropTypes.bool,
//     name: PropTypes.oneOfType([
//         PropTypes.string,
//         PropTypes.node
//     ]),
//     onMouseEnter: PropTypes.func.isRequired,
//     onMouseLeave: PropTypes.func.isRequired,
//     onSelect: PropTypes.func.isRequired,
//     showPlayButton: PropTypes.bool
// };

export default injectIntl(LibraryItem);
