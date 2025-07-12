import React, { useState } from 'react';
import type { QuizSlide as QuizSlideType, QuizAnswer } from '../../data/types';

interface QuizSlideProps {
  slide: QuizSlideType;
  onAnswer: (correct: boolean) => void;
}

const QuizSlide: React.FC<QuizSlideProps> = ({ slide, onAnswer }) => {
  const [imgErrors, setImgErrors] = useState<{ [key: number]: boolean }>({});

  return (
    <div style={{ padding: 24 }}>
      <h2>{slide.quiz_heading || 'Quiz'}</h2>
      <div style={{ margin: '16px 0' }}>{slide.quiz_question}</div>
      {/* TODO: Play audio if available */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {slide.quiz_answers.map((answer: QuizAnswer, idx: number) => (
          <button
            key={idx}
            style={{ minWidth: 120, minHeight: 80 }}
            onClick={() => onAnswer(!!answer.is_correct)}
          >
            {answer.image_url && !imgErrors[idx] ? (
              <img
                src={answer.image_url}
                alt={answer.text}
                style={{ width: 48, height: 48, objectFit: 'contain' }}
                onError={() => setImgErrors(e => ({ ...e, [idx]: true }))}
              />
            ) : answer.image_url ? (
              <div style={{ width: 48, height: 48, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                Image unavailable
              </div>
            ) : null}
            <div>{answer.text}</div>
          </button>
        ))}
      </div>
      {/* TODO: Show feedback and play feedback audio after answer */}
    </div>
  );
};

export default QuizSlide; 