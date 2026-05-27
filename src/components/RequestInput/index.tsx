import React from 'react';
import { CurlInput } from './CurlInput';
import { FormInput } from './FormInput';
import { useUIStore } from '../../stores/uiStore';

export const RequestInput: React.FC = () => {
  const { inputMode, setInputMode } = useUIStore();

  return (
    <div
      className="shrink-0"
      style={{ borderBottom: '1px solid var(--border-default)' }}
    >
      <div
        className="flex items-center gap-1 px-3 py-1"
        style={{ borderBottom: '1px solid var(--border-muted)' }}
      >
        <button
          className="px-2 py-0.5 text-xs font-medium transition-colors"
          style={{
            color: inputMode === 'curl' ? 'var(--accent-fg)' : 'var(--text-muted)',
            borderBottom: inputMode === 'curl' ? '2px solid var(--accent-fg)' : '2px solid transparent',
            background: 'transparent',
            border: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
          }}
          onClick={() => setInputMode('curl')}
        >
          cURL
        </button>
        <button
          className="px-2 py-0.5 text-xs font-medium transition-colors"
          style={{
            color: inputMode === 'form' ? 'var(--accent-fg)' : 'var(--text-muted)',
            borderBottom: inputMode === 'form' ? '2px solid var(--accent-fg)' : '2px solid transparent',
            background: 'transparent',
            border: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
          }}
          onClick={() => setInputMode('form')}
        >
          表单
        </button>
      </div>
      <div className="p-3">
        {inputMode === 'curl' ? <CurlInput /> : <FormInput />}
      </div>
    </div>
  );
};
