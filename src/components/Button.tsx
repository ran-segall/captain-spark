import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'disabled';
  fullWidth?: boolean;
  disabled?: boolean;
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

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  fullWidth = true,
  disabled = false,
}) => {
  // If disabled prop is true or variant is 'disabled', treat as disabled
  const isDisabled = disabled || variant === 'disabled';
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
      {children}
    </button>
  );
};

export default Button; 