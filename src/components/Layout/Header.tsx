import React, { useRef, useState, useEffect } from 'react';
import { ThemeToggle } from '../Common/ThemeToggle';
import { useTabStore } from '../../stores/tabStore';
import { useProjectStore } from '../../stores/projectStore';
import { exportRequest, exportAsCurl, copyToClipboard, downloadAsFile } from '../../utils/export';
import { importFromFile } from '../../utils/import';

export const Header: React.FC = () => {
  const { addTab, getActiveTab, setMethod, setUrl, setHeaders, setBody, setAuth } = useTabStore();
  const { projectTree, fetchProjectTree, selectedProjectId, selectedRequirementId, setSelectedProjectId, setSelectedRequirementId, createProject, createRequirement, deleteProject, deleteRequirement } = useProjectStore();
  const currentRequest = getActiveTab()?.request || { method: 'GET', url: '', headers: [], ssl_verify: false };
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showProjectList, setShowProjectList] = useState(false);
  const [showRequirementList, setShowRequirementList] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewRequirement, setShowNewRequirement] = useState(false);
  const [newRequirementName, setNewRequirementName] = useState('');

  useEffect(() => {
    fetchProjectTree();
  }, [fetchProjectTree]);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = () => {
      setShowProjectList(false);
      setShowRequirementList(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const currentRequirements = selectedProjectId
    ? projectTree.find(p => p.project.id === selectedProjectId)?.requirements || []
    : [];

  const selectedProject = projectTree.find(p => p.project.id === selectedProjectId)?.project;
  const selectedRequirement = currentRequirements.find(r => r.requirement.id === selectedRequirementId)?.requirement;

  const handleExportJson = () => {
    const json = exportRequest(currentRequest);
    downloadAsFile(json, 'request.json');
  };

  const handleExportCurl = async () => {
    const curl = exportAsCurl(currentRequest);
    const success = await copyToClipboard(curl);
    if (success) {
      alert('已复制到剪贴板');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const request = await importFromFile(file);
    if (request) {
      setMethod(request.method);
      setUrl(request.url);
      setHeaders(request.headers);
      setBody(request.body || null);
      setAuth(request.auth || null);
    } else {
      alert('导入失败：无效的文件格式');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    const id = await createProject(newProjectName.trim());
    setSelectedProjectId(id);
    setNewProjectName('');
    setShowNewProject(false);
  };

  const handleCreateRequirement = async () => {
    if (!selectedProjectId || !newRequirementName.trim()) return;
    const id = await createRequirement(selectedProjectId, newRequirementName.trim());
    setSelectedRequirementId(id);
    setNewRequirementName('');
    setShowNewRequirement(false);
  };

  return (
    <header
      className="flex items-center justify-between px-3 shrink-0 relative"
      style={{
        height: 'var(--header-height)',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      {/* 左侧：logo + 当前项目需求 + 新建按钮 */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-fg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            oneCurl
          </span>
        </div>

        <div style={{ width: '1px', height: '16px', background: 'var(--border-default)' }} />

        {/* 当前项目/需求显示 + 新建按钮 */}
        <div className="flex items-center gap-1.5">
          {/* 项目 */}
          <div className="flex items-center gap-1 relative">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>项目:</span>
            <span
              className="text-xs font-medium cursor-pointer hover:underline"
              style={{ color: selectedProject ? 'var(--text-primary)' : 'var(--text-muted)' }}
              onClick={(e) => { e.stopPropagation(); setShowProjectList(!showProjectList); }}
            >
              {selectedProject?.name || '未选择'}
            </span>
            <button
              className="p-0.5 rounded hover:bg-[var(--bg-hover)]"
              style={{ color: 'var(--text-muted)' }}
              onClick={() => setShowNewProject(!showNewProject)}
              title="新建项目"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            {/* 项目下拉列表 */}
            {showProjectList && (
              <div
                className="absolute top-full left-0 mt-1 py-1 rounded shadow-lg z-50"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', minWidth: '120px' }}
                onClick={(e) => e.stopPropagation()}
              >
                {projectTree.length === 0 ? (
                  <div className="px-3 py-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>暂无项目</div>
                ) : (
                  projectTree.map(({ project }) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between px-3 py-1.5 text-xs cursor-pointer hover:bg-[var(--bg-hover)] group"
                      style={{ color: selectedProjectId === project.id ? 'var(--accent-fg)' : 'var(--text-primary)' }}
                      onClick={() => {
                        setSelectedProjectId(project.id);
                        setShowProjectList(false);
                      }}
                    >
                      <span>{project.name}</span>
                      <button
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[var(--bg-active)]"
                        style={{ color: 'var(--danger-fg)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`确定删除项目"${project.name}"？项目下的需求将同时删除。`)) {
                            deleteProject(project.id);
                          }
                        }}
                        title="删除项目"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 需求 */}
          <div className="flex items-center gap-1 relative">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>需求:</span>
            <span
              className="text-xs font-medium cursor-pointer hover:underline"
              style={{ color: selectedRequirement ? 'var(--text-primary)' : 'var(--text-muted)', opacity: selectedProjectId ? 1 : 0.6 }}
              onClick={(e) => { e.stopPropagation(); selectedProjectId && setShowRequirementList(!showRequirementList); }}
            >
              {selectedRequirement?.name || '未选择'}
            </span>
            <button
              className="p-0.5 rounded hover:bg-[var(--bg-hover)]"
              style={{ color: 'var(--text-muted)', opacity: selectedProjectId ? 1 : 0.5 }}
              onClick={() => selectedProjectId && setShowNewRequirement(!showNewRequirement)}
              title={selectedProjectId ? '新建需求' : '请先选择项目'}
              disabled={!selectedProjectId}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            {/* 需求下拉列表 */}
            {showRequirementList && (
              <div
                className="absolute top-full left-0 mt-1 py-1 rounded shadow-lg z-50"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', minWidth: '120px' }}
                onClick={(e) => e.stopPropagation()}
              >
                {currentRequirements.length === 0 ? (
                  <div className="px-3 py-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>暂无需求</div>
                ) : (
                  currentRequirements.map(({ requirement }) => (
                    <div
                      key={requirement.id}
                      className="flex items-center justify-between px-3 py-1.5 text-xs cursor-pointer hover:bg-[var(--bg-hover)] group"
                      style={{ color: selectedRequirementId === requirement.id ? 'var(--accent-fg)' : 'var(--text-primary)' }}
                      onClick={() => {
                        setSelectedRequirementId(requirement.id);
                        setShowRequirementList(false);
                      }}
                    >
                      <span>{requirement.name}</span>
                      <button
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[var(--bg-active)]"
                        style={{ color: 'var(--danger-fg)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`确定删除需求"${requirement.name}"？`)) {
                            deleteRequirement(requirement.id);
                          }
                        }}
                        title="删除需求"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 右侧：导入导出等 */}
      <div className="flex items-center gap-1">
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        <button className="ghost-btn" onClick={() => fileInputRef.current?.click()} title="导入请求">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>导入</span>
        </button>
        <button className="ghost-btn" onClick={handleExportJson} title="导出 JSON">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>导出</span>
        </button>
        <button className="ghost-btn" onClick={handleExportCurl} title="复制 curl 命令">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          <span>cURL</span>
        </button>
        <div style={{ width: '1px', height: '16px', background: 'var(--border-default)' }} />
        <button className="ghost-btn" onClick={addTab} title="新建请求 (Ctrl+N)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <ThemeToggle />
      </div>

      {/* 新建项目弹出框 */}
      {showNewProject && (
        <div
          className="absolute top-full left-3 mt-1 p-2 rounded shadow-lg z-50"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <div className="flex gap-1">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="项目名称"
              className="px-2 py-1 text-xs rounded"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                width: '150px',
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
              autoFocus
            />
            <button
              className="px-2 py-1 text-xs rounded"
              style={{ background: 'var(--accent-bg)', color: 'var(--accent-fg)' }}
              onClick={handleCreateProject}
            >
              确定
            </button>
            <button
              className="px-2 py-1 text-xs rounded"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
              onClick={() => { setShowNewProject(false); setNewProjectName(''); }}
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 新建需求弹出框 */}
      {showNewRequirement && (
        <div
          className="absolute top-full left-3 mt-1 p-2 rounded shadow-lg z-50"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <div className="flex gap-1">
            <input
              type="text"
              value={newRequirementName}
              onChange={(e) => setNewRequirementName(e.target.value)}
              placeholder="需求名称"
              className="px-2 py-1 text-xs rounded"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                width: '150px',
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateRequirement()}
              autoFocus
            />
            <button
              className="px-2 py-1 text-xs rounded"
              style={{ background: 'var(--accent-bg)', color: 'var(--accent-fg)' }}
              onClick={handleCreateRequirement}
            >
              确定
            </button>
            <button
              className="px-2 py-1 text-xs rounded"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
              onClick={() => { setShowNewRequirement(false); setNewRequirementName(''); }}
            >
              取消
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
