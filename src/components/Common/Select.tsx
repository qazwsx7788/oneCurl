import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: SelectOption[];
  onChange?: (value: string) => void;
  allowCreate?: boolean;
  createLabel?: string;
  onCreate?: () => void;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  onChange,
  allowCreate,
  createLabel = '+ 新增',
  onCreate,
  className = '',
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === '__create__') {
      onCreate?.();
      return;
    }
    onChange?.(e.target.value);
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <select
        className="input-field"
        style={{ cursor: 'pointer' }}
        onChange={handleChange}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        {allowCreate && (
          <option value="__create__">{createLabel}</option>
        )}
      </select>
    </div>
  );
};
