import { invoke } from '@tauri-apps/api/core';
import { useEditorStore } from '../stores/editorStore';

export function useGit() {
  const {
    rootPath,
    gitStatus,
    gitBranches,
    gitCommits,
    refreshGitStatus,
    refreshGitBranches,
    refreshGitCommits,
    refreshAllGitData,
  } = useEditorStore();

  const stageFiles = async (paths: string[]): Promise<boolean> => {
    if (!rootPath || paths.length === 0) return false;
    try {
      await invoke('git_stage', { rootPath, paths });
      await refreshGitStatus();
      return true;
    } catch (error) {
      console.error('Failed to stage files:', error);
      return false;
    }
  };

  const stageAll = async (): Promise<boolean> => {
    if (!rootPath) return false;
    try {
      await invoke('git_stage_all', { rootPath });
      await refreshGitStatus();
      return true;
    } catch (error) {
      console.error('Failed to stage all:', error);
      return false;
    }
  };

  const unstageFiles = async (paths: string[]): Promise<boolean> => {
    if (!rootPath || paths.length === 0) return false;
    try {
      await invoke('git_unstage', { rootPath, paths });
      await refreshGitStatus();
      return true;
    } catch (error) {
      console.error('Failed to unstage files:', error);
      return false;
    }
  };

  const unstageAll = async (): Promise<boolean> => {
    if (!rootPath) return false;
    try {
      await invoke('git_unstage_all', { rootPath });
      await refreshGitStatus();
      return true;
    } catch (error) {
      console.error('Failed to unstage all:', error);
      return false;
    }
  };

  const discardChanges = async (paths: string[]): Promise<boolean> => {
    if (!rootPath || paths.length === 0) return false;
    try {
      await invoke('git_discard_changes', { rootPath, paths });
      await refreshGitStatus();
      return true;
    } catch (error) {
      console.error('Failed to discard changes:', error);
      return false;
    }
  };

  const commit = async (message: string): Promise<string | null> => {
    if (!rootPath || !message.trim()) return null;
    try {
      const hash = await invoke<string>('git_commit', { rootPath, message });
      await refreshAllGitData();
      return hash;
    } catch (error) {
      console.error('Failed to commit:', error);
      return null;
    }
  };

  const checkout = async (branch: string): Promise<boolean> => {
    if (!rootPath) return false;
    try {
      await invoke('git_checkout', { rootPath, branch });
      await refreshAllGitData();
      return true;
    } catch (error) {
      console.error('Failed to checkout:', error);
      return false;
    }
  };

  const createBranch = async (name: string, shouldCheckout: boolean = true): Promise<boolean> => {
    if (!rootPath || !name.trim()) return false;
    try {
      await invoke('git_create_branch', { rootPath, branch: name, checkout: shouldCheckout });
      await refreshGitBranches();
      return true;
    } catch (error) {
      console.error('Failed to create branch:', error);
      return false;
    }
  };

  return {
    // Data
    status: gitStatus,
    branches: gitBranches,
    commits: gitCommits,
    isRepo: gitStatus !== null,

    // Refresh
    refreshStatus: refreshGitStatus,
    refreshBranches: refreshGitBranches,
    refreshCommits: refreshGitCommits,
    refreshAll: refreshAllGitData,

    // Actions
    stageFiles,
    stageAll,
    unstageFiles,
    unstageAll,
    discardChanges,
    commit,
    checkout,
    createBranch,
  };
}
