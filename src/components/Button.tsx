import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'disabled';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

const VARIANT_STYLES = {
  primary: {
    background: '#FFA927',
    color: '#111',
    fontWeight: 700,
  },
  secondary: {
    background: '#FFEBD2',
    color: '#111',
    fontWeight: 700,
  },
  disabled: {
    background: '#E6E6E6',
    color: '#666',
    fontWeight: 700,
  },
  success: {
    background: '#00C200',
    color: '#fff',
    fontWeight: 700,
  },
};

const Spinner: React.FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ marginRight: 10, verticalAlign: 'middle', display: 'inline-block' }}
  >
    <circle
      cx="10"
      cy="10"
      r="8"
      stroke="#222"
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

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  fullWidth = true,
  disabled = false,
  loading = false,
}) => {
  // If disabled prop is true or variant is 'disabled', treat as disabled
  const isDisabled = disabled || variant === 'disabled' || loading;
  const style = {
    ...{
      border: 'none',
      borderRadius: 9999,
      padding: '0.75rem',
      fontSize: '1rem',
      fontFamily: 'inherit',
      width: fullWidth ? '100%' : undefined,
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.5 : 1,
      transition: 'opacity 0.2s',
      outline: 'none',
      display: 'block',
      textAlign: 'center',
    },
    ...VARIANT_STYLES[variant === 'disabled' ? 'disabled' : variant],
  } as React.CSSProperties;

  return (
    <button
      style={style}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      tabIndex={isDisabled ? -1 : 0}
    >
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {loading && <Spinner />}
        <span>{children}</span>
      </span>
    </button>
  );
};

export default Button; 