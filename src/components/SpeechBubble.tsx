import React from 'react';

interface SpeechBubbleProps {
  avatar: string;
  alt: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({ avatar, alt, children, style, className }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', ...style }} className={className}>
    <img src={avatar} alt={alt} style={{ width: 80, height: 80, borderRadius: 20, marginRight: 16, flexShrink: 0 }} />
    <div className="quiz-speech-bubble"
      style={{
        background: '#fff',
        border: '1px solid #163657',
        borderRadius: 5,
        padding: '10px',
        fontSize: 16,
        color: '#1a2a3a',
        boxShadow: '0 2px 8px 0 rgba(22,54,87,0.04)',
        position: 'relative',
        minWidth: 0,
        maxWidth: 340,
        lineHeight: 1.4,
      }}
    >
      {children}
    </div>
  </div>
);

export default SpeechBubble; 