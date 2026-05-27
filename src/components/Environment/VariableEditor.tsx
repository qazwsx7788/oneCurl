import React from 'react';
import { EnvironmentVariable, VariableType } from '../../types/environment';
import { Input } from '../Common/Input';
import { Select } from '../Common/Select';
import { Button } from '../Common/Button';

interface VariableEditorProps {
  variable: EnvironmentVariable;
  onChange: (variable: EnvironmentVariable) => void;
  onDelete: () => void;
}

const VARIABLE_TYPES = [
  { value: 'string', label: '字符串' },
  { value: 'number', label: '数字' },
  { value: 'boolean', label: '布尔值' },
  { value: 'secret', label: '密钥' },
];

export const VariableEditor: React.FC<VariableEditorProps> = ({ variable, onChange, onDelete }) => {
  return (
    <div className="flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
      <input
        type="checkbox"
        checked={variable.enabled}
        onChange={(e) => onChange({ ...variable, enabled: e.target.checked })}
        className="w-4 h-4"
      />
      <Input
        value={variable.key}
        onChange={(e) => onChange({ ...variable, key: e.target.value })}
        placeholder="变量名"
        className="flex-1"
      />
      <Input
        type={variable.variableType === 'secret' ? 'password' : 'text'}
        value={variable.value}
        onChange={(e) => onChange({ ...variable, value: e.target.value })}
        placeholder="值"
        className="flex-1"
      />
      <Select
        options={VARIABLE_TYPES}
        value={variable.variableType}
        onChange={(value) => onChange({ ...variable, variableType: value as VariableType })}
        className="w-24"
      />
      <Button variant="danger" size="sm" onClick={onDelete}>删除</Button>
    </div>
  );
};
