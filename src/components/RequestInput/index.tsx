import React, { useEffect } from 'react';
import { CurlInput } from './CurlInput';
import { FormInput } from './FormInput';
import { EnvironmentSelector } from './EnvironmentSelector';
import { useUIStore } from '../../stores/uiStore';
import { useEnvironmentStore } from '../../stores/environmentStore';

export const RequestInput: React.FC = () => {
  const { inputMode, setInputMode } = useUIStore();
  const { init } = useEnvironmentStore();

  useEffect(() => {
    init();
  }, [init]);

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
            background: 'transparent',
            border: 'none',
            borderBottom: inputMode === 'curl' ? '2px solid var(--accent-fg)' : '2px solid transparent',
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
            background: 'transparent',
            border: 'none',
            borderBottom: inputMode === 'form' ? '2px solid var(--accent-fg)' : '2px solid transparent',
            cursor: 'pointer',
          }}
          onClick={() => setInputMode('form')}
        >
          表单
        </button>
      </div>
      <div className="px-3 py-1.5" style={{ borderBottom: '1px solid var(--border-muted)' }}>
        <EnvironmentSelector />
      </div>
      <div className="p-3">
        {inputMode === 'curl' ? <CurlInput /> : <FormInput />}
      </div>
    </div>
  );
};
