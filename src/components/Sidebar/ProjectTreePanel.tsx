import React, { useEffect, useState } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { useTabStore } from '../../stores/tabStore';
import { useUIStore } from '../../stores/uiStore';
import { FavoriteRecord } from '../../types/favorite';

export const ProjectTreePanel: React.FC = () => {
  const { projectTree, loading, fetchProjectTree, updateProject, deleteProject, updateRequirement, deleteRequirement } = useProjectStore();
  const { loadRequest } = useTabStore();
  const { setInputMode } = useUIStore();

  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set([1]));
  const [expandedRequirements, setExpandedRequirements] = useState<Set<number>>(new Set([1]));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    fetchProjectTree();
  }, [fetchProjectTree]);

  const toggleProject = (id: number) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleRequirement = (id: number) => {
    setExpandedRequirements(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleLoadFavorite = (fav: FavoriteRecord) => {
    const req = fav.request;
    setInputMode('form');
    loadRequest({
      method: req.method,
      url: req.url,
      headers: req.headers || [],
      body: req.body || undefined,
      auth: req.auth || undefined,
      proxy: req.proxy || undefined,
      ssl_verify: req.ssl_verify ?? true,
      timeout: req.timeout || undefined,
    });
    // 恢复保存的响应数据
    if (fav.response) {
      const { setResponse } = useTabStore.getState();
      setResponse(fav.response);
    }
  };

  const startEdit = (type: 'project' | 'requirement', id: number, name: string) => {
    setEditingId(`${type}-${id}`);
    setEditingName(name);
  };

  const saveEdit = async () => {
    if (!editingId || !editingName.trim()) return;
    const [type, idStr] = editingId.split('-');
    const id = parseInt(idStr);

    if (type === 'project') {
      await updateProject(id, editingName.trim());
    } else {
      await updateRequirement(id, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  const handleDeleteProject = async (id: number) => {
    if (confirm('确定删除此项目？项目下的需求将同时删除。')) {
      await deleteProject(id);
    }
  };

  const handleDeleteRequirement = async (id: number) => {
    if (confirm('确定删除此需求？')) {
      await deleteRequirement(id);
    }
  };

  if (loading && projectTree.length === 0) {
    return <div className="text-center py-4" style={{ color: 'var(--text-muted)' }}>加载中...</div>;
  }

  return (
    <div className="flex flex-col gap-1">
      {projectTree.length === 0 ? (
        <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
          <p className="text-sm">暂无项目</p>
          <p className="text-xs mt-1">在顶部点击 + 创建项目</p>
        </div>
      ) : (
        projectTree.map(({ project, requirements }) => (
          <div key={project.id} className="rounded" style={{ background: 'var(--bg-elevated)' }}>
            {/* 项目头 */}
            <div
              className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-[var(--bg-hover)] rounded group"
              onClick={() => toggleProject(project.id)}
            >
              <svg
                width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ transform: expandedProjects.has(project.id) ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-fg)" strokeWidth="2">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
              </svg>
              {editingId === `project-${project.id}` ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  className="flex-1 px-1 py-0.5 text-xs rounded"
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--accent-border)',
                    color: 'var(--text-primary)',
                  }}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  className="flex-1 text-xs font-medium truncate"
                  style={{ color: 'var(--text-primary)' }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    startEdit('project', project.id, project.name);
                  }}
                >
                  {project.name}
                </span>
              )}
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {requirements.length}
              </span>
              <button
                className="p-0.5 rounded hover:bg-[var(--bg-active)] opacity-0 group-hover:opacity-100"
                style={{ color: 'var(--text-muted)' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProject(project.id);
                }}
                title="删除项目"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              </button>
            </div>

            {/* 需求列表 */}
            {expandedProjects.has(project.id) && (
              <div className="ml-4 flex flex-col gap-0.5 pb-1">
                {requirements.length === 0 ? (
                  <div className="px-2 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    暂无需求
                  </div>
                ) : (
                  requirements.map(({ requirement, favorites }) => (
                    <div key={requirement.id}>
                      {/* 需求头 */}
                      <div
                        className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-[var(--bg-hover)] rounded group"
                        onClick={() => toggleRequirement(requirement.id)}
                      >
                        <svg
                          width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          style={{ transform: expandedRequirements.has(requirement.id) ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                        </svg>
                        {editingId === `requirement-${requirement.id}` ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                            className="flex-1 px-1 py-0.5 text-xs rounded"
                            style={{
                              background: 'var(--bg-input)',
                              border: '1px solid var(--accent-border)',
                              color: 'var(--text-primary)',
                            }}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span
                            className="flex-1 text-xs truncate"
                            style={{ color: 'var(--text-secondary)' }}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              startEdit('requirement', requirement.id, requirement.name);
                            }}
                          >
                            {requirement.name}
                          </span>
                        )}
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {favorites.length}
                        </span>
                        <button
                          className="p-0.5 rounded hover:bg-[var(--bg-active)] opacity-0 group-hover:opacity-100"
                          style={{ color: 'var(--text-muted)' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRequirement(requirement.id);
                          }}
                          title="删除需求"
                        >
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                        </button>
                      </div>

                      {/* 收藏列表 */}
                      {expandedRequirements.has(requirement.id) && (
                        <div className="ml-4 flex flex-col gap-0.5">
                          {favorites.length === 0 ? (
                            <div className="px-2 py-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                              暂无收藏接口
                            </div>
                          ) : (
                            favorites.map((fav) => (
                              <div
                                key={fav.id}
                                className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-[var(--bg-hover)] rounded"
                                onClick={() => handleLoadFavorite(fav)}
                              >
                                <span
                                  className="text-xs font-mono"
                                  style={{
                                    color: fav.request.method === 'GET' ? 'var(--green-fg)' :
                                           fav.request.method === 'POST' ? 'var(--blue-fg)' :
                                           fav.request.method === 'PUT' ? 'var(--yellow-fg)' :
                                           fav.request.method === 'DELETE' ? 'var(--red-fg)' :
                                           'var(--text-primary)',
                                  }}
                                >
                                  {fav.request.method}
                                </span>
                                <span className="flex-1 text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                                  {fav.name}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};
