import React from 'react';
import { useEnvironmentStore } from '../../stores/environmentStore';

export const EnvironmentSelector: React.FC = () => {
  const { environments, activeEnvironment, setActiveEnvironment, loading } = useEnvironmentStore();

  if (loading || environments.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span
        className="text-xs shrink-0"
        style={{ color: 'var(--text-muted)' }}
      >
        环境:
      </span>
      {environments.map((env) => {
        const isActive = activeEnvironment?.id === env.id;
        return (
          <button
            key={env.id}
            onClick={() => setActiveEnvironment(isActive ? null : env)}
            className="px-2 py-0.5 text-xs font-medium rounded transition-colors"
            style={{
              background: isActive ? 'var(--accent-fg)' : 'var(--bg-base)',
              color: isActive ? 'var(--bg-base)' : 'var(--text-secondary)',
              border: `1px solid ${isActive ? 'var(--accent-fg)' : 'var(--border-default)'}`,
              cursor: 'pointer',
            }}
            title={`${env.name} (${env.variables.length} 个变量)`}
          >
            {env.name}
          </button>
        );
      })}
      {activeEnvironment && (
        <button
          onClick={() => setActiveEnvironment(null)}
          className="px-1.5 py-0.5 text-xs rounded transition-colors"
          style={{
            background: 'transparent',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-muted)',
            cursor: 'pointer',
          }}
          title="清除环境"
        >
          ✕
        </button>
      )}
    </div>
  );
};
