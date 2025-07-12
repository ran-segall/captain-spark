import type { Slide, QuizSlide as QuizSlideType } from '../../data/types';
import VideoSlide from './VideoSlide';
import QuizSlide from './QuizSlide';
import React, { useState } from 'react';
import type { RefObject } from 'react';

interface SlideRendererProps {
  slide: Slide;
  onNext?: () => void;
  videoRef?: RefObject<HTMLVideoElement | null>;
  onVideoProgress?: (currentTime: number, duration: number) => void;
}

const SlideRenderer = ({ slide, onNext, videoRef, onVideoProgress }: SlideRendererProps) => {
  const [feedback, setFeedback] = useState<null | 'correct' | 'wrong'>(null);

  if (!slide) return null;
  if (slide.type === 'video') {
    return <VideoSlide videoUrl={slide.video_url} onEnded={onNext || (() => {})} videoRef={videoRef} onProgress={onVideoProgress} />;
  }
  if (slide.type === 'quiz') {
    if (feedback) {
      return (
        <div style={{ padding: 24 }}>
          <h2>{feedback === 'correct' ? 'Correct!' : 'Try Again!'}</h2>
          {/* TODO: Show feedback quote/audio */}
        </div>
      );
    }
    return (
      <QuizSlide
        slide={slide as QuizSlideType}
        onAnswer={correct => {
          setFeedback(correct ? 'correct' : 'wrong');
          setTimeout(() => {
            setFeedback(null);
            if (onNext) onNext();
          }, 1200);
        }}
      />
    );
  }
  return null;
};

export default SlideRenderer; 