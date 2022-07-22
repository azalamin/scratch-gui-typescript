import { useState } from 'react';
import QuestionComponent from '../components/question/question.jsx';

const Question = (props: PropsInterface) => {
  const [answer, setAnswer] = useState('');
  const handleChange = (e: any) => {
    setAnswer(e.target.value);
  };
  const handleKeyPress = (event: any) => {
    if (event.key === 'Enter') handleSubmit();
  };
  const handleSubmit = () => {
    props.onQuestionAnswered(answer);
  };

  return (
    <QuestionComponent
      answer={answer}
      question={props.question}
      onChange={handleChange}
      onClick={handleSubmit}
      onKeyPress={handleKeyPress}
    />
  );
};

interface PropsInterface {
  onQuestionAnswered: any;
  question: string;
}

// TODO
// Question.propTypes = {
//     onQuestionAnswered: PropTypes.func.isRequired,
//     question: PropTypes.string
// };

export default Question;
