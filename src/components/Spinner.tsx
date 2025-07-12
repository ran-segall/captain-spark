import React from 'react';

interface SpinnerProps {
  size?: number;
  color?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 32, color = '#222' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ marginRight: 0, verticalAlign: 'middle', display: 'inline-block' }}
  >
    <circle
      cx="10"
      cy="10"
      r="8"
      stroke={color}
      strokeWidth="3"
      strokeDasharray="40 20"
      strokeLinecap="round"
      fill="none"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 10 10"
        to="360 10 10"
        dur="0.8s"
        repeatCount="indefinite"
      />
    </circle>
  </svg>
);

export default Spinner; 