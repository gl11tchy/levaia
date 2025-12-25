import { useEffect, useState } from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { useGit } from '../../hooks/useGit';
import { GitFileItem } from './GitFileItem';

export function GitPanel() {
  const { rootPath, gitStatus, refreshAllGitData } = useEditorStore();
  const { stageAll, unstageAll, commit } = useGit();
  const [message, setMessage] = useState('');
  const [expanded, setExpanded] = useState({ staged: true, changes: true, untracked: true });

  useEffect(() => {
    if (rootPath) refreshAllGitData();
  }, [rootPath, refreshAllGitData]);

  useEffect(() => {
    if (!rootPath) return;
    const interval = setInterval(() => refreshAllGitData(), 3000);
    return () => clearInterval(interval);
  }, [rootPath, refreshAllGitData]);

  const handleCommit = async () => {
    if (!message.trim()) return;
    const hash = await commit(message);
    if (hash) setMessage('');
  };

  if (!rootPath) {
    return <div className="h-full flex items-center justify-center text-editor-text-muted text-xs">No folder opened</div>;
  }

  if (!gitStatus) {
    return <div className="h-full flex items-center justify-center text-editor-text-muted text-xs">Not a git repository</div>;
  }

  const hasStaged = gitStatus.staged.length > 0;
  const hasChanges = gitStatus.unstaged.length > 0;
  const hasUntracked = gitStatus.untracked.length > 0;

  return (
    <div className="h-full flex flex-col bg-editor-sidebar text-[13px]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-[11px] font-medium text-editor-text-muted uppercase tracking-wider">Source Control</span>
      </div>

      {/* Commit Input */}
      <div className="px-3 pb-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleCommit(); }}
          placeholder="Commit message..."
          className="w-full px-2.5 py-1.5 text-[13px] bg-editor-hover border border-editor-border focus:border-editor-accent rounded-md outline-none text-editor-text placeholder:text-editor-text-muted transition-colors"
        />
      </div>

      {/* File Lists */}
      <div className="flex-1 overflow-y-auto">
        {hasStaged && (
          <Section
            title="Staged"
            count={gitStatus.staged.length}
            expanded={expanded.staged}
            onToggle={() => setExpanded(p => ({ ...p, staged: !p.staged }))}
            action={{ icon: '−', title: 'Unstage All', onClick: unstageAll }}
          >
            {gitStatus.staged.map(f => <GitFileItem key={f.path} file={f} type="staged" />)}
          </Section>
        )}

        {hasChanges && (
          <Section
            title="Changes"
            count={gitStatus.unstaged.length}
            expanded={expanded.changes}
            onToggle={() => setExpanded(p => ({ ...p, changes: !p.changes }))}
            action={{ icon: '+', title: 'Stage All', onClick: stageAll }}
          >
            {gitStatus.unstaged.map(f => <GitFileItem key={f.path} file={f} type="unstaged" />)}
          </Section>
        )}

        {hasUntracked && (
          <Section
            title="Untracked"
            count={gitStatus.untracked.length}
            expanded={expanded.untracked}
            onToggle={() => setExpanded(p => ({ ...p, untracked: !p.untracked }))}
            action={{ icon: '+', title: 'Stage All', onClick: () => stageAll() }}
          >
            {gitStatus.untracked.map(f => <GitFileItem key={f.path} file={f} type="untracked" />)}
          </Section>
        )}

        {!hasStaged && !hasChanges && !hasUntracked && (
          <div className="px-3 py-4 text-editor-text-muted text-[13px]">No changes</div>
        )}
      </div>
    </div>
  );
}

function Section({ title, count, expanded, onToggle, action, children }: {
  title: string;
  count: number;
  expanded: boolean;
  onToggle: () => void;
  action?: { icon: string; title: string; onClick: () => void };
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center h-7 px-3 cursor-pointer hover:bg-editor-hover group" onClick={onToggle}>
        <span className={`text-[10px] text-editor-text-muted mr-1.5 transition-transform ${expanded ? 'rotate-90' : ''}`}>▶</span>
        <span className="flex-1 text-[12px] font-medium text-editor-text">{title}</span>
        <span className="text-[11px] text-editor-text-muted mr-2">{count}</span>
        {action && (
          <button
            className="w-5 h-5 flex items-center justify-center text-editor-text-muted hover:text-editor-text hover:bg-editor-active rounded opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => { e.stopPropagation(); action.onClick(); }}
            title={action.title}
          >
            {action.icon}
          </button>
        )}
      </div>
      {expanded && children}
    </div>
  );
}
