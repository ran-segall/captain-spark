import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 1
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  // Clamp progress between 0 and 1
  const clampedProgress = Math.max(0, Math.min(1, progress));
  
  return (
    <div
      style={{
        width: '100%',
        height: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: '100px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${clampedProgress * 100}%`,
          height: '100%',
          backgroundColor: 'white',
          borderRadius: '100px',
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  );
};

export default ProgressBar; 