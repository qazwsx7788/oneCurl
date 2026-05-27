import React, { useState } from 'react';
import { Environment, EnvironmentVariable } from '../../types/environment';
import { Input } from '../Common/Input';
import { Button } from '../Common/Button';
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
    <div className="flex flex-col gap-4 p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {environment ? '编辑环境' : '新建环境'}
      </h3>
      <Input label="环境名称" value={name} onChange={(e) => setName(e.target.value)} placeholder="输入环境名称" />
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">变量列表</span>
          <Button size="sm" variant="secondary" onClick={handleAddVariable}>添加变量</Button>
        </div>
        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
          {variables.map((variable, index) => (
            <VariableEditor
              key={index}
              variable={variable}
              onChange={(v) => handleUpdateVariable(index, v)}
              onDelete={() => handleDeleteVariable(index)}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>取消</Button>
        <Button onClick={handleSave}>保存</Button>
      </div>
    </div>
  );
};
