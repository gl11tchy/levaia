import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { useEditorStore } from '../stores/editorStore';
import type { FileEntry, FileInfo } from '../types';

export function useFileSystem() {
  const { rootPath, setRootPath, refreshFolder, openFile } = useEditorStore();

  const openFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Open Folder',
      });

      if (selected && typeof selected === 'string') {
        setRootPath(selected);
      }
    } catch (error) {
      console.error('Failed to open folder:', error);
    }
  };

  const closeFolder = () => {
    setRootPath(null);
  };

  const createFile = async (path: string): Promise<boolean> => {
    try {
      await invoke('create_file', { path });
      const parentDir = path.substring(0, path.lastIndexOf('/'));
      await refreshFolder(parentDir || rootPath || '');
      return true;
    } catch (error) {
      console.error('Failed to create file:', error);
      return false;
    }
  };

  const createDirectory = async (path: string): Promise<boolean> => {
    try {
      await invoke('create_directory', { path });
      const parentDir = path.substring(0, path.lastIndexOf('/'));
      await refreshFolder(parentDir || rootPath || '');
      return true;
    } catch (error) {
      console.error('Failed to create directory:', error);
      return false;
    }
  };

  const renameItem = async (oldPath: string, newPath: string): Promise<boolean> => {
    try {
      await invoke('rename_item', { oldPath, newPath });
      const parentDir = oldPath.substring(0, oldPath.lastIndexOf('/'));
      await refreshFolder(parentDir || rootPath || '');
      return true;
    } catch (error) {
      console.error('Failed to rename:', error);
      return false;
    }
  };

  const deleteItem = async (path: string): Promise<boolean> => {
    try {
      await invoke('delete_item', { path });
      const parentDir = path.substring(0, path.lastIndexOf('/'));
      await refreshFolder(parentDir || rootPath || '');
      return true;
    } catch (error) {
      console.error('Failed to delete:', error);
      return false;
    }
  };

  const getFileInfo = async (path: string): Promise<FileInfo | null> => {
    try {
      return await invoke<FileInfo>('get_file_info', { path });
    } catch (error) {
      console.error('Failed to get file info:', error);
      return null;
    }
  };

  const readDirectory = async (path: string): Promise<FileEntry[]> => {
    try {
      return await invoke<FileEntry[]>('read_directory', { path });
    } catch (error) {
      console.error('Failed to read directory:', error);
      return [];
    }
  };

  return {
    rootPath,
    openFolder,
    closeFolder,
    createFile,
    createDirectory,
    renameItem,
    deleteItem,
    getFileInfo,
    readDirectory,
    openFile,
  };
}
