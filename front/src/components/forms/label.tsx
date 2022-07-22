import styles from './label.module.css';

const Label = (props: PropsInterface) => (
  <label className={props.above ? styles.inputGroupColumn : styles.inputGroup}>
    <span
      className={
        props.secondary ? styles.inputLabelSecondary : styles.inputLabel
      }
    >
      {props.text}
    </span>
    {props.children}
  </label>
);

interface PropsInterface {
  above: boolean;
  children: JSX.Element;
  secondary: boolean;
  text: string | JSX.Element;
}

// TODO
// Label.propTypes = {
//     above: PropTypes.bool,
//     children: PropTypes.node,
//     secondary: PropTypes.bool,
//     text: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired
// };

Label.defaultProps = {
  above: false,
  secondary: false,
};

export default Label;
