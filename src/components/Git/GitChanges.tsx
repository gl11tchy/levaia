import { useState } from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { useGit } from '../../hooks/useGit';
import { GitFileItem } from './GitFileItem';
import { GitCommitInput } from './GitCommitInput';

interface SectionProps {
  title: string;
  count: number;
  expanded: boolean;
  onToggle: () => void;
  action?: { label: string; onClick: () => void };
  children: React.ReactNode;
}

function Section({ title, count, expanded, onToggle, action, children }: SectionProps) {
  return (
    <div>
      <div
        className="flex items-center px-2 py-1 cursor-pointer hover:bg-editor-hover group text-xs"
        onClick={onToggle}
      >
        <span className={`mr-1 text-editor-text-muted transition-transform ${expanded ? 'rotate-90' : ''}`}>›</span>
        <span className="flex-1 text-editor-text">{title}</span>
        <span className="text-editor-text-muted">{count}</span>
        {action && (
          <button
            className="ml-2 text-editor-text-muted hover:text-editor-text opacity-0 group-hover:opacity-100"
            onClick={(e) => { e.stopPropagation(); action.onClick(); }}
            title={action.label}
          >
            {action.label === 'Unstage All' ? '−' : '+'}
          </button>
        )}
      </div>
      {expanded && children}
    </div>
  );
}

export function GitChanges() {
  const { gitStatus } = useEditorStore();
  const { stageAll, unstageAll } = useGit();
  const [expanded, setExpanded] = useState({ staged: true, changes: true, untracked: true });

  if (!gitStatus) return null;

  const toggle = (key: keyof typeof expanded) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const hasStaged = gitStatus.staged.length > 0;
  const hasUnstaged = gitStatus.unstaged.length > 0;
  const hasUntracked = gitStatus.untracked.length > 0;
  const hasAny = hasStaged || hasUnstaged || hasUntracked;

  return (
    <div className="flex flex-col h-full">
      {hasStaged && <GitCommitInput />}

      <div className="flex-1 overflow-y-auto py-1">
        {hasStaged && (
          <Section
            title="Staged"
            count={gitStatus.staged.length}
            expanded={expanded.staged}
            onToggle={() => toggle('staged')}
            action={{ label: 'Unstage All', onClick: unstageAll }}
          >
            {gitStatus.staged.map(file => (
              <GitFileItem key={file.path} file={file} type="staged" />
            ))}
          </Section>
        )}

        {hasUnstaged && (
          <Section
            title="Changes"
            count={gitStatus.unstaged.length}
            expanded={expanded.changes}
            onToggle={() => toggle('changes')}
            action={{ label: 'Stage All', onClick: stageAll }}
          >
            {gitStatus.unstaged.map(file => (
              <GitFileItem key={file.path} file={file} type="unstaged" />
            ))}
          </Section>
        )}

        {hasUntracked && (
          <Section
            title="Untracked"
            count={gitStatus.untracked.length}
            expanded={expanded.untracked}
            onToggle={() => toggle('untracked')}
          >
            {gitStatus.untracked.map(file => (
              <GitFileItem key={file.path} file={file} type="untracked" />
            ))}
          </Section>
        )}

        {!hasAny && (
          <div className="px-4 py-6 text-center text-editor-text-muted text-xs">
            No changes
          </div>
        )}
      </div>
    </div>
  );
}
