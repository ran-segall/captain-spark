import React from 'react';

const OnboardingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      style={{
        backgroundColor: '#f3f3f3',
        width: '100vw',
        minHeight: '100dvh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          width: '100%',
          maxWidth: '420px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 0 10px rgba(0,0,0,0.04)',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default OnboardingLayout;
