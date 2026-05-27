import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    fontWeight: 500,
    borderRadius: 'var(--radius)',
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.5 : 1,
    transition: 'all 0.15s',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap' as const,
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: 'var(--accent-emphasis)',
      color: '#fff',
    },
    secondary: {
      background: 'var(--bg-overlay)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-default)',
    },
    danger: {
      background: 'var(--danger-emphasis)',
      color: '#fff',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
    },
  };

  const sizes: Record<string, React.CSSProperties> = {
    sm: { padding: '4px 10px', fontSize: '13px' },
    md: { padding: '6px 14px', fontSize: '15px' },
    lg: { padding: '8px 16px', fontSize: '16px' },
  };

  return (
    <button
      className={className}
      style={{ ...base, ...variants[variant], ...sizes[size] }}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="inline-block animate-spin" style={{ width: 12, height: 12, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%' }} />
          处理中...
        </>
      ) : children}
    </button>
  );
};
