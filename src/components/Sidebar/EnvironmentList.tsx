import React, { useEffect, useState } from 'react';
import { useEnvironmentStore } from '../../stores/environmentStore';
import { Button } from '../Common/Button';
import { Modal } from '../Common/Modal';
import { EnvironmentEditor } from '../Environment/EnvironmentEditor';
import { Environment } from '../../types/environment';

export const EnvironmentList: React.FC = () => {
  const { environments, activeEnvironment, loading, fetchEnvironments, setActiveEnvironment } = useEnvironmentStore();
  const [showEditor, setShowEditor] = useState(false);
  const [editingEnv, setEditingEnv] = useState<Environment | undefined>(undefined);

  useEffect(() => { fetchEnvironments(); }, [fetchEnvironments]);

  const handleEdit = (env: Environment) => {
    setEditingEnv(env);
    setShowEditor(true);
  };

  if (loading) return <div className="text-center text-gray-500">加载中...</div>;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">环境列表</span>
        <Button size="sm" variant="secondary" onClick={() => { setEditingEnv(undefined); setShowEditor(true); }}>
          新建环境
        </Button>
      </div>

      {environments.length === 0 ? (
        <div className="text-center text-gray-500">暂无环境配置</div>
      ) : (
        environments.map((env) => (
          <div
            key={env.id}
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              activeEnvironment?.id === env.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-500'
            }`}
            onClick={() => setActiveEnvironment(env)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{env.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{env.variables.length} 个变量</div>
              </div>
              <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); handleEdit(env); }}>
                编辑
              </Button>
            </div>
          </div>
        ))
      )}

      <Modal isOpen={showEditor} onClose={() => setShowEditor(false)} title={editingEnv ? '编辑环境' : '新建环境'}>
        <EnvironmentEditor environment={editingEnv} onClose={() => setShowEditor(false)} />
      </Modal>
    </div>
  );
};
