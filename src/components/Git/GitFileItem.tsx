import { useGit } from '../../hooks/useGit';
import { useEditorStore } from '../../stores/editorStore';
import { FileIcon } from '../FileExplorer/FileIcons';
import type { GitFileStatus } from '../../types';

interface GitFileItemProps {
  file: GitFileStatus;
  type: 'staged' | 'unstaged' | 'untracked';
}

const statusColors: Record<string, string> = {
  'M': 'text-amber-400',
  'A': 'text-emerald-400', 
  'D': 'text-red-400',
  'R': 'text-sky-400',
  'U': 'text-orange-400',
  '?': 'text-editor-text-muted',
};

export function GitFileItem({ file, type }: GitFileItemProps) {
  const { stageFiles, unstageFiles, discardChanges } = useGit();
  const { openFile, rootPath } = useEditorStore();

  const fileName = file.path.split('/').pop() || file.path;
  const dirPath = file.path.includes('/') ? file.path.substring(0, file.path.lastIndexOf('/')) : '';

  return (
    <div
      className="flex items-center h-7 pl-6 pr-3 cursor-pointer hover:bg-editor-hover group transition-colors"
      onClick={() => rootPath && openFile(`${rootPath}/${file.path}`)}
    >
      <FileIcon name={fileName} isDirectory={false} className="w-4 h-4 mr-2 flex-shrink-0 opacity-70" />
      
      <span className="flex-1 truncate text-[13px]">
        <span className="text-editor-text">{fileName}</span>
        {dirPath && <span className="text-editor-text-muted ml-2 text-[12px]">{dirPath}</span>}
      </span>

      {/* Hover Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
        {type === 'unstaged' && (
          <button
            className="w-5 h-5 flex items-center justify-center text-editor-text-muted hover:text-editor-text hover:bg-editor-active rounded text-sm"
            onClick={(e) => { e.stopPropagation(); if (confirm(`Discard changes to "${fileName}"?`)) discardChanges([file.path]); }}
            title="Discard Changes"
          >↶</button>
        )}
        {type === 'staged' ? (
          <button
            className="w-5 h-5 flex items-center justify-center text-editor-text-muted hover:text-editor-text hover:bg-editor-active rounded text-sm"
            onClick={(e) => { e.stopPropagation(); unstageFiles([file.path]); }}
            title="Unstage"
          >−</button>
        ) : (
          <button
            className="w-5 h-5 flex items-center justify-center text-editor-text-muted hover:text-editor-text hover:bg-editor-active rounded text-sm"
            onClick={(e) => { e.stopPropagation(); stageFiles([file.path]); }}
            title="Stage"
          >+</button>
        )}
      </div>

      {/* Status Badge */}
      <span className={`text-[11px] font-medium w-4 text-right ${statusColors[file.status] || 'text-editor-text-muted'}`}>
        {file.status}
      </span>
    </div>
  );
}
