import { useState } from 'react';

import DirectionComponent, {
  RotationStyles,
} from '../components/direction-picker/direction-picker.jsx';

const DirectionPicker = (props: PropsInterface) => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleOpenPopover = () => {
    setPopoverOpen(true);
  };
  const handleClosePopover = () => {
    setPopoverOpen(false);
  };
  const handleClickAllAround = () => {
    props.onChangeRotationStyle(RotationStyles.ALL_AROUND);
  };
  const handleClickLeftRight = () => {
    props.onChangeRotationStyle(RotationStyles.LEFT_RIGHT);
  };
  const handleClickDontRotate = () => {
    props.onChangeRotationStyle(RotationStyles.DONT_ROTATE);
  };

  return (
    <DirectionComponent
      direction={props.direction}
      disabled={props.disabled}
      labelAbove={props.labelAbove}
      popoverOpen={popoverOpen && !props.disabled}
      rotationStyle={props.rotationStyle}
      onChangeDirection={props.onChangeDirection}
      onClickAllAround={handleClickAllAround}
      onClickDontRotate={handleClickDontRotate}
      onClickLeftRight={handleClickLeftRight}
      onClosePopover={handleClosePopover}
      onOpenPopover={handleOpenPopover}
    />
  );
};

interface PropsInterface {
  direction: number;
  disabled: any;
  labelAbove: boolean;
  onChangeDirection: any;
  onChangeRotationStyle: any;
  rotationStyle: any;
}

export default DirectionPicker;
