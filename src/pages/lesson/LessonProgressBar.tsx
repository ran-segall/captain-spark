import React from 'react';
import type { Slide } from '../../data/types';

interface LessonProgressBarProps {
  slides: Slide[];
  currentIdx: number;
  currentProgress?: number; // 0-1 for current pill fill
  variant?: 'default' | 'blue';
}

const PILL_GAP = 8;
const PILL_HEIGHT = 8;
const PILL_WIDTH = 40;
const CIRCLE_SIZE = 8;
const BRAND_BLUE = '#163657';

const LessonProgressBar: React.FC<LessonProgressBarProps> = ({ slides, currentIdx, currentProgress = 0, variant = 'default' }) => {
  const fillColor = variant === 'blue' ? BRAND_BLUE : 'white';
  const bgColor = variant === 'blue' ? 'rgba(22,54,87,0.3)' : 'rgba(255,255,255,0.3)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: PILL_GAP, width: '100%', height: PILL_HEIGHT, margin: 0, padding: 0 }}>
      {slides.map((slide, idx) => {
        const isComplete = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        // For quiz slides, if current, fill 100% (no animation)
        const fill = (slide.type === 'quiz' && isCurrent) ? 1 : (isCurrent ? currentProgress : isComplete ? 1 : 0);
        if (slide.type === 'quiz') {
          // Quiz: circle, fixed size
          return (
            <div
              key={idx}
              style={{
                position: 'relative',
                width: CIRCLE_SIZE,
                height: CIRCLE_SIZE,
                background: bgColor,
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
                  background: fillColor,
                  borderRadius: '50%',
                  transition: isCurrent && slide.type !== 'quiz' ? 'width 0.2s linear' : 'none',
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
              background: bgColor,
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
                background: fillColor,
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