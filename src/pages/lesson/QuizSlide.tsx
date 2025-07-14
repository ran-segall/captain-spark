import React, { useState, useEffect, useRef } from 'react';
import type { QuizSlide as QuizSlideType, QuizAnswer } from '../../data/types';
import Button from '../../components/Button';
import SpeechBubble from '../../components/SpeechBubble';
import './QuizSlide.css';

const SPARK_AVATAR = '/images/ui/spark-profile.png';
const GLIMM_AVATAR = '/images/ui/glimm-profile.png';

interface QuizSlideProps {
  slide: QuizSlideType;
  onAnswer: (correct: boolean) => void;
}

type AnswerStatus = null | 'correct' | 'wrong';

const QuizSlide: React.FC<QuizSlideProps> = ({ slide, onAnswer }) => {
  const [imgErrors, setImgErrors] = useState<{ [key: number]: boolean }>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const feedbackAudioRef = useRef<HTMLAudioElement | null>(null);

  // Play question audio on mount or slide change
  useEffect(() => {
    if (slide.quiz_audio_url) {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        audioRef.current = new Audio(slide.quiz_audio_url);
        audioRef.current.play().catch(() => {});
      } catch (e) {
        // ignore audio errors
      }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [slide.quiz_audio_url]);

  // Play feedback audio when feedback is shown
  useEffect(() => {
    if (showFeedback && answerStatus) {
      let url = answerStatus === 'correct' ? slide.quiz_correct_audio_url : slide.quiz_wrong_audio_url;
      if (url) {
        try {
          if (feedbackAudioRef.current) {
            feedbackAudioRef.current.pause();
            feedbackAudioRef.current.currentTime = 0;
          }
          feedbackAudioRef.current = new Audio(url);
          feedbackAudioRef.current.play().catch(() => {});
        } catch (e) {
          // ignore audio errors
        }
      }
    }
    return () => {
      if (feedbackAudioRef.current) {
        feedbackAudioRef.current.pause();
        feedbackAudioRef.current = null;
      }
    };
  }, [showFeedback, answerStatus, slide.quiz_correct_audio_url, slide.quiz_wrong_audio_url]);

  // Handler for answer selection
  const handleAnswer = (idx: number, isCorrect: boolean) => {
    if (selected !== null) return; // Prevent double answer
    setSelected(idx);
    setAnswerStatus(isCorrect ? 'correct' : 'wrong');
    setShowFeedback(true); // Show feedback immediately
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 400); // match CSS transition duration
    // onAnswer(isCorrect); // Only call onAnswer(true) in handleContinue
  };

  // Handler for Try Again (wrong answer)
  const handleTryAgain = () => {
    setShowFeedback(false);
    setTimeout(() => {
      setSelected(null);
      setAnswerStatus(null);
    }, 400); // match feedback slide down duration
  };

  // Handler for Continue (correct answer)
  const handleContinue = () => {
    setShowFeedback(false);
    setTimeout(() => {
      setSelected(null);
      setAnswerStatus(null);
      onAnswer(true);
    }, 400);
  };

  // Animation classes
  const quoteClass =
    isAnimating || showFeedback ? 'quiz-quote slide-up-out' : 'quiz-quote slide-in';
  const qaClass =
    isAnimating || showFeedback ? 'quiz-main slide-up-fill' : 'quiz-main slide-in';
  const feedbackClass =
    showFeedback ? 'quiz-feedback-overlay slide-up-in' : 'quiz-feedback-overlay slide-down-out';

  return (
    <div className="quiz-slide-root">
      {/* Quote bubble with avatar */}
      <div className={quoteClass}>
        <SpeechBubble avatar={SPARK_AVATAR} alt="Captain Spark">
          {slide.quiz_question}
        </SpeechBubble>
      </div>
      {/* Heading and Answers */}
      <div className={qaClass}>
        <h2 className="quiz-heading">{slide.quiz_heading || 'Quiz'}</h2>
        {/* Answers 2x2 grid */}
        <div className="quiz-answers-grid">
          {slide.quiz_answers.map((answer: QuizAnswer, idx: number) => {
            let stateClass = '';
            if (selected !== null) {
              if (idx === selected) {
                if (answerStatus === 'correct') stateClass = 'correct';
                else if (answerStatus === 'wrong') stateClass = 'wrong';
              }
            }
            return (
              <button
                key={idx}
                className={`quiz-answer-box${selected === idx ? ' selected' : ''} ${stateClass}`}
                onClick={() => handleAnswer(idx, !!answer.is_correct)}
                disabled={selected !== null}
              >
                <div className="quiz-answer-img-container">
                  {answer.image_url && !imgErrors[idx] ? (
                    <img
                      src={answer.image_url}
                      alt={answer.text}
                      className="quiz-answer-img"
                      style={{ mixBlendMode: selected === idx && answerStatus ? 'multiply' : undefined }}
                      onError={() => setImgErrors(e => ({ ...e, [idx]: true }))}
                    />
                  ) : answer.image_url ? (
                    <div className="quiz-answer-img quiz-answer-img-unavailable">Image unavailable</div>
                  ) : null}
                </div>
                <div className="quiz-answer-text">{answer.text}</div>
              </button>
            );
          })}
        </div>
        {/* Disabled button at bottom (hidden when feedback is shown) */}
        {!showFeedback && (
          <div style={{ marginTop: 'auto' }}>
            <Button
              variant={selected === null ? 'disabled' : 'primary'}
              disabled={selected === null}
              fullWidth
            >
              Select An Answer
            </Button>
          </div>
        )}
      </div>
      {/* Feedback Overlay */}
      <div className={feedbackClass}>
        {answerStatus === 'correct' ? (
          <div className="quiz-feedback-box correct">
            <h2>Correct!</h2>
            <SpeechBubble avatar={GLIMM_AVATAR} alt="Glimm">
              {slide.quiz_correct_quote}
            </SpeechBubble>
            <div style={{ marginTop: 24 }}>
              <Button
                variant="success"
                fullWidth
                onClick={handleContinue}
              >
                Continue
              </Button>
            </div>
          </div>
        ) : answerStatus === 'wrong' ? (
          <div className="quiz-feedback-box wrong">
            <h2>Oops!</h2>
            <SpeechBubble avatar={SPARK_AVATAR} alt="Captain Spark">
              {slide.quiz_wrong_quote}
            </SpeechBubble>
            <div style={{ marginTop: 24 }}>
              <Button
                variant="primary"
                fullWidth
                onClick={handleTryAgain}
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default QuizSlide; 