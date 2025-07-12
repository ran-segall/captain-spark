import React from 'react';
import type { Slide } from '../../data/types';

interface LessonProgressBarProps {
  slides: Slide[];
  currentIdx: number;
  currentProgress?: number; // 0-1 for current pill fill
}

const PILL_GAP = 8;
const PILL_HEIGHT = 8;
const PILL_WIDTH = 40;
const CIRCLE_SIZE = 8;

const LessonProgressBar: React.FC<LessonProgressBarProps> = ({ slides, currentIdx, currentProgress = 0 }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: PILL_GAP, width: '100%', height: PILL_HEIGHT, margin: 0, padding: 0 }}>
      {slides.map((slide, idx) => {
        const isComplete = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const fill = isCurrent ? currentProgress : isComplete ? 1 : 0;
        if (slide.type === 'quiz') {
          // Quiz: circle, fixed size
          return (
            <div
              key={idx}
              style={{
                position: 'relative',
                width: CIRCLE_SIZE,
                height: CIRCLE_SIZE,
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                flexGrow: 0,
                transition: 'background 0.2s',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${fill * 100}%`,
                  background: 'white',
                  borderRadius: '50%',
                  transition: isCurrent ? 'width 0.2s linear' : 'none',
                }}
              />
            </div>
          );
        }
        // Video: pill, stretchable
        return (
          <div
            key={idx}
            style={{
              position: 'relative',
              width: PILL_WIDTH,
              height: PILL_HEIGHT,
              background: 'rgba(255,255,255,0.3)',
              borderRadius: PILL_HEIGHT,
              overflow: 'hidden',
              flexShrink: 0,
              flexGrow: 1,
              transition: 'background 0.2s',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${fill * 100}%`,
                background: 'white',
                borderRadius: PILL_HEIGHT,
                transition: isCurrent ? 'width 0.2s linear' : 'none',
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default LessonProgressBar; 