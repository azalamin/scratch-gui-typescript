import Input from '../forms/input';
import enterIcon from './icon--enter.svg';
import styles from './question.module.css';

const QuestionComponent = (props: PropsInterface) => {
  const { answer, className, question, onChange, onClick, onKeyPress } = props;
  return (
    <div className={className}>
      <div className={styles.questionContainer}>
        {question ? (
          <div className={styles.questionLabel}>{question}</div>
        ) : null}
        <div className={styles.questionInput}>
          <Input
            autoFocus
            value={answer}
            onChange={onChange}
            onKeyPress={onKeyPress}
          />
          <button className={styles.questionSubmitButton} onClick={onClick}>
            <img
              className={styles.questionSubmitButtonIcon}
              draggable={false}
              src={enterIcon}
              alt=''
            />
          </button>
        </div>
      </div>
    </div>
  );
};

interface PropsInterface {
  answer?: string;
  className?: string;
  onChange?: any;
  onClick?: any;
  onKeyPress?: any;
  question?: string;
}

// QuestionComponent.propTypes = {
//     answer: PropTypes.string,
//     className: PropTypes.string,
//     onChange: PropTypes.func.isRequired,
//     onClick: PropTypes.func.isRequired,
//     onKeyPress: PropTypes.func.isRequired,
//     question: PropTypes.string
// };

export default QuestionComponent;
