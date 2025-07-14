import type { Slide, QuizSlide as QuizSlideType } from '../../data/types';
import VideoSlide from './VideoSlide';
import QuizSlide from './QuizSlide';
import type { RefObject } from 'react';

interface SlideRendererProps {
  slide: Slide;
  onNext?: () => void;
  videoRef?: RefObject<HTMLVideoElement | null>;
  onVideoProgress?: (currentTime: number, duration: number) => void;
}

const SlideRenderer = ({ slide, onNext, videoRef, onVideoProgress }: SlideRendererProps) => {
  if (!slide) return null;
  if (slide.type === 'video') {
    return <VideoSlide videoUrl={slide.video_url} onEnded={onNext || (() => {})} videoRef={videoRef} onProgress={onVideoProgress} />;
  }
  if (slide.type === 'quiz') {
    return (
      <QuizSlide
        slide={slide as QuizSlideType}
        onAnswer={correct => {
          if (correct && onNext) onNext();
        }}
      />
    );
  }
  return null;
};

export default SlideRenderer; 