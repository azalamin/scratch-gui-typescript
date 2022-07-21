import PropTypes from 'prop-types';
import React, { useState } from 'react';
import QuestionComponent from '../components/question/question.jsx';

const Question = (props) => {
    const [answer, setAnswer] = useState('');
    const handleChange = (e) => {
        setAnswer(e.target.value);
    }
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') handleSubmit();
    }
    const handleSubmit = () => {
       props.onQuestionAnswered(answer);
    }

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

Question.propTypes = {
    onQuestionAnswered: PropTypes.func.isRequired,
    question: PropTypes.string
};

export default Question;
