import { connect } from 'react-redux';
import Box from '../components/box/box';
import greenFlag from '../components/green-flag/icon--green-flag.svg';

const GreenFlagOverlay = (props: PropsInterface) => {
  const handleClick = () => {
    props.vm.start();
    props.vm.greenFlag();
  };
  return (
    <Box className={props.wrapperClass} onClick={handleClick}>
      <div className={props.className}>
        <img draggable={false} src={greenFlag} alt='' />
      </div>
    </Box>
  );
};

interface PropsInterface {
  className: string;
  vm: any; // todo
  wrapperClass: string;
}

const mapStateToProps = (state: any) => ({
  vm: state.scratchGui.vm,
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(GreenFlagOverlay);
