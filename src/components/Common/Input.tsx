import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <input
        className="input-field"
        style={{
          borderColor: error ? 'var(--danger-fg)' : undefined,
        }}
        {...props}
      />
      {error && (
        <span className="text-xs" style={{ color: 'var(--danger-fg)' }}>{error}</span>
      )}
    </div>
  );
};
