import React from 'react';

interface OnboardingProgressBarProps {
  step: number; // 1-based index
  totalSteps: number;
}

const OnboardingProgressBar: React.FC<OnboardingProgressBarProps> = ({ step, totalSteps }) => {
  return (
    <div style={{ display: 'flex', gap: 12, width: '100%', justifyContent: 'flex-start', marginBottom: '2rem' }}>
      {Array.from({ length: totalSteps }).map((_, idx) => (
        <div
          key={idx}
          style={{
            flex: 1,
            height: 8,
            background: idx < step ? '#163657' : 'rgba(22, 54, 87, 0.3)',
            borderRadius: 100,
            transition: 'background 0.3s',
            minWidth: 40,
            maxWidth: 80,
          }}
        />
      ))}
    </div>
  );
};

export default OnboardingProgressBar; 