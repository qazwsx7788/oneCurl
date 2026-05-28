import { create } from 'zustand';
import { Project, ProjectTree } from '../types/project';
import { invoke } from '@tauri-apps/api/core';
import { getConfig, setConfig, deleteConfig } from '../services/tauri';

interface ProjectState {
    projects: Project[];
    projectTree: ProjectTree[];
    loading: boolean;
    initialized: boolean;

    // 选中的项目和需求
    selectedProjectId: number | null;
    selectedRequirementId: number | null;

    init: () => Promise<void>;
    fetchProjects: () => Promise<void>;
    fetchProjectTree: () => Promise<void>;
    createProject: (name: string, description?: string) => Promise<number>;
    updateProject: (id: number, name: string, description?: string) => Promise<void>;
    deleteProject: (id: number) => Promise<void>;
    createRequirement: (projectId: number, name: string, description?: string) => Promise<number>;
    updateRequirement: (id: number, name: string, description?: string) => Promise<void>;
    deleteRequirement: (id: number) => Promise<void>;

    // 设置选中状态
    setSelectedProjectId: (id: number | null) => Promise<void>;
    setSelectedRequirementId: (id: number | null) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    projects: [],
    projectTree: [],
    loading: false,
    initialized: false,
    selectedProjectId: null,
    selectedRequirementId: null,

    init: async () => {
        const [selectedProjectIdStr, selectedRequirementIdStr] = await Promise.all([
            getConfig('selectedProjectId'),
            getConfig('selectedRequirementId'),
        ]);
        
        const selectedProjectId = selectedProjectIdStr ? parseInt(selectedProjectIdStr, 10) : null;
        const selectedRequirementId = selectedRequirementIdStr ? parseInt(selectedRequirementIdStr, 10) : null;

        set({
            selectedProjectId,
            selectedRequirementId,
            initialized: true,
        });
    },

    fetchProjects: async () => {
        set({ loading: true });
        try {
            const projects = await invoke<Project[]>('get_projects');
            set({ projects, loading: false });
        } catch (error) {
            console.error('获取项目列表失败:', error);
            set({ loading: false });
        }
    },

    fetchProjectTree: async () => {
        set({ loading: true });
        try {
            const projectTree = await invoke<ProjectTree[]>('get_project_tree');
            const state = get();
            
            // 首先检查保存的选择是否有效
            let targetProjectId = state.selectedProjectId;
            let targetRequirementId = state.selectedRequirementId;
            
            // 检查保存的项目是否存在
            const savedProjectExists = targetProjectId && projectTree.some(p => p.project.id === targetProjectId);
            // 检查保存的需求是否属于该项目
            let savedRequirementExists = false;
            if (savedProjectExists && targetRequirementId) {
                const project = projectTree.find(p => p.project.id === targetProjectId);
                savedRequirementExists = project?.requirements.some(r => r.requirement.id === targetRequirementId) ?? false;
            }
            
            // 如果保存的选择有效，保持不变
            if (savedProjectExists) {
                // 需求可能无效，需要调整
                if (targetRequirementId && !savedRequirementExists) {
                    const project = projectTree.find(p => p.project.id === targetProjectId);
                    const defaultRequirement = project?.requirements.find(r => r.requirement.id === 1) || project?.requirements[0];
                    targetRequirementId = defaultRequirement?.requirement.id ?? null;
                }
                set({
                    projectTree,
                    loading: false,
                    selectedProjectId: targetProjectId,
                    selectedRequirementId: targetRequirementId,
                });
            } else {
                // 没有保存的选择或无效，使用默认
                const defaultProject = projectTree.find(p => p.project.id === 1) || projectTree[0];
                const defaultRequirement = defaultProject?.requirements.find(r => r.requirement.id === 1) || defaultProject?.requirements[0];
                set({
                    projectTree,
                    loading: false,
                    selectedProjectId: defaultProject?.project.id ?? null,
                    selectedRequirementId: defaultRequirement?.requirement.id ?? null,
                });
            }
        } catch (error) {
            console.error('获取项目树失败:', error);
            set({ loading: false });
        }
    },

    createProject: async (name, description) => {
        const id = await invoke<number>('create_project', { name, description });
        await get().fetchProjectTree();
        await get().fetchProjects();
        return id;
    },

    updateProject: async (id, name, description) => {
        await invoke('update_project', { id, name, description });
        await get().fetchProjectTree();
        await get().fetchProjects();
    },

    deleteProject: async (id) => {
        await invoke('delete_project', { id });
        if (get().selectedProjectId === id) {
            set({ selectedProjectId: null, selectedRequirementId: null });
            await deleteConfig('selectedProjectId');
            await deleteConfig('selectedRequirementId');
        }
        await get().fetchProjectTree();
        await get().fetchProjects();
    },

    createRequirement: async (projectId, name, description) => {
        const id = await invoke<number>('create_requirement', { projectId, name, description });
        await get().fetchProjectTree();
        return id;
    },

    updateRequirement: async (id, name, description) => {
        await invoke('update_requirement', { id, name, description });
        await get().fetchProjectTree();
    },

    deleteRequirement: async (id) => {
        await invoke('delete_requirement', { id });
        if (get().selectedRequirementId === id) {
            set({ selectedRequirementId: null });
            await deleteConfig('selectedRequirementId');
        }
        await get().fetchProjectTree();
    },

    setSelectedProjectId: async (id) => {
        set({ selectedProjectId: id, selectedRequirementId: null });
        if (id) {
            await setConfig('selectedProjectId', id.toString());
        } else {
            await deleteConfig('selectedProjectId');
        }
        await deleteConfig('selectedRequirementId');
    },

    setSelectedRequirementId: async (id) => {
        set({ selectedRequirementId: id });
        if (id) {
            await setConfig('selectedRequirementId', id.toString());
        } else {
            await deleteConfig('selectedRequirementId');
        }
    },
}));
