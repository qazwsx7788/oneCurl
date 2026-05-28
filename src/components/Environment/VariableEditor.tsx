import React from 'react';
import { EnvironmentVariable, VariableType } from '../../types/environment';

interface VariableEditorProps {
  variable: EnvironmentVariable;
  onChange: (variable: EnvironmentVariable) => void;
  onDelete: () => void;
}

const VARIABLE_TYPES: { value: VariableType; label: string }[] = [
  { value: 'string', label: '字符串' },
  { value: 'number', label: '数字' },
  { value: 'boolean', label: '布尔' },
  { value: 'secret', label: '密钥' },
];

export const VariableEditor: React.FC<VariableEditorProps> = ({ variable, onChange, onDelete }) => {
  return (
    <div
      className="flex items-center gap-2"
      style={{
        padding: '6px 8px',
        background: 'var(--bg-base)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius)',
      }}
    >
      <input
        type="checkbox"
        checked={variable.enabled}
        onChange={(e) => onChange({ ...variable, enabled: e.target.checked })}
        style={{ accentColor: 'var(--accent-fg)', flexShrink: 0 }}
      />
      <input
        value={variable.key}
        onChange={(e) => onChange({ ...variable, key: e.target.value })}
        placeholder="变量名"
        className="font-mono outline-none"
        style={{
          flex: '1 1 100px',
          minWidth: 0,
          padding: '4px 8px',
          fontSize: '13px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-muted)',
          borderRadius: 'var(--radius)',
          color: 'var(--text-primary)',
        }}
      />
      <input
        type={variable.variableType === 'secret' ? 'password' : 'text'}
        value={variable.value}
        onChange={(e) => onChange({ ...variable, value: e.target.value })}
        placeholder="值"
        className="font-mono outline-none"
        style={{
          flex: '1 1 120px',
          minWidth: 0,
          padding: '4px 8px',
          fontSize: '13px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-muted)',
          borderRadius: 'var(--radius)',
          color: 'var(--text-primary)',
        }}
      />
      <select
        value={variable.variableType}
        onChange={(e) => onChange({ ...variable, variableType: e.target.value as VariableType })}
        className="outline-none"
        style={{
          flexShrink: 0,
          padding: '4px 6px',
          fontSize: '12px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-muted)',
          borderRadius: 'var(--radius)',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          width: '64px',
        }}
      >
        {VARIABLE_TYPES.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>
      <button
        onClick={onDelete}
        className="flex items-center justify-center"
        style={{
          flexShrink: 0,
          width: '24px',
          height: '24px',
          background: 'transparent',
          border: 'none',
          borderRadius: 'var(--radius)',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          transition: 'color 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger-fg)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
        title="删除变量"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        </svg>
      </button>
    </div>
  );
};
