import React, { useState } from 'react';
import { Environment, EnvironmentVariable } from '../../types/environment';
import { VariableEditor } from './VariableEditor';
import { useEnvironmentStore } from '../../stores/environmentStore';

interface EnvironmentEditorProps {
  environment?: Environment;
  onClose: () => void;
}

export const EnvironmentEditor: React.FC<EnvironmentEditorProps> = ({ environment, onClose }) => {
  const { saveEnvironment } = useEnvironmentStore();
  const [name, setName] = useState(environment?.name || '');
  const [variables, setVariables] = useState<EnvironmentVariable[]>(environment?.variables || []);

  const handleAddVariable = () => {
    setVariables([...variables, { key: '', value: '', variableType: 'string', enabled: true }]);
  };

  const handleUpdateVariable = (index: number, variable: EnvironmentVariable) => {
    const newVariables = [...variables];
    newVariables[index] = variable;
    setVariables(newVariables);
  };

  const handleDeleteVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('请输入环境名称');
      return;
    }
    await saveEnvironment({
      id: environment?.id || 0,
      name,
      variables,
      createdAt: environment?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="flex flex-col gap-4 p-4" style={{ minWidth: '460px' }}>
      {/* 环境名称 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          环境名称
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="如: UAT、生产环境、测试环境"
          className="font-mono outline-none"
          style={{
            padding: '6px 10px',
            fontSize: '13px',
            background: 'var(--bg-base)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* 变量列表 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            变量列表 {variables.length > 0 && `(${variables.length})`}
          </span>
          <button
            onClick={handleAddVariable}
            className="flex items-center gap-1 text-xs font-medium"
            style={{
              padding: '3px 8px',
              background: 'transparent',
              border: '1px solid var(--accent-fg)',
              borderRadius: 'var(--radius)',
              color: 'var(--accent-fg)',
              cursor: 'pointer',
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            添加变量
          </button>
        </div>

        {variables.length === 0 ? (
          <div
            className="flex items-center justify-center"
            style={{
              padding: '24px',
              border: '1px dashed var(--border-muted)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-muted)',
              fontSize: '12px',
            }}
          >
            暂无变量，点击上方按钮添加
          </div>
        ) : (
          <div className="flex flex-col gap-1.5" style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {variables.map((variable, index) => (
              <VariableEditor
                key={index}
                variable={variable}
                onChange={(v) => handleUpdateVariable(index, v)}
                onDelete={() => handleDeleteVariable(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 底部按钮 */}
      <div
        className="flex justify-end gap-2 pt-2"
        style={{ borderTop: '1px solid var(--border-default)' }}
      >
        <button
          onClick={onClose}
          className="text-xs font-medium"
          style={{
            padding: '6px 14px',
            background: 'transparent',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          取消
        </button>
        <button
          onClick={handleSave}
          className="text-xs font-medium"
          style={{
            padding: '6px 14px',
            background: 'var(--accent-fg)',
            border: 'none',
            borderRadius: 'var(--radius)',
            color: 'var(--bg-base)',
            cursor: 'pointer',
          }}
        >
          保存
        </button>
      </div>
    </div>
  );
};
