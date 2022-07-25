import SpriteInfoComponent from '../components/sprite-info/sprite-info';

const SpriteInfo = (props: PropsInterface) => {
  const handleClickVisible = (e: any) => {
    e.preventDefault();
    props.onChangeVisibility(true);
  };
  const handleClickNotVisible = (e: any) => {
    e.preventDefault();
    props.onChangeVisibility(false);
  };
  const handlePressVisible = (e: any) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      props.onChangeVisibility(true);
    }
  };
  const handlePressNotVisible = (e: any) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      props.onChangeVisibility(false);
    }
  };
  return (
    <SpriteInfoComponent
      {...props}
      onClickNotVisible={handleClickNotVisible}
      onClickVisible={handleClickVisible}
      onPressNotVisible={handlePressNotVisible}
      onPressVisible={handlePressVisible}
    />
  );
};

interface PropsInterface {
  onChangeDirection: any;
  onChangeName: any;
  onChangeSize: any;
  onChangeVisibility: any;
  onChangeX: any;
  onChangeY: any;
  x: number;
  y: number;
  direction?: any;
  disabled?: any;
  name?: any;
  rotationStyle?: any;
  size?: any;
  stageSize?: any;
  visible?: any;
  onChangeRotationStyle?: any;
}

// TODO
// SpriteInfo.propTypes = {
//     ...SpriteInfoComponent.propTypes,
//     onChangeDirection: PropTypes.func,
//     onChangeName: PropTypes.func,
//     onChangeSize: PropTypes.func,
//     onChangeVisibility: PropTypes.func,
//     onChangeX: PropTypes.func,
//     onChangeY: PropTypes.func,
//     x: PropTypes.number,
//     y: PropTypes.number
// };

export default SpriteInfo;
