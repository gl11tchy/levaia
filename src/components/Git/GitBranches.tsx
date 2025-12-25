import { useState } from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { useGit } from '../../hooks/useGit';
import type { GitBranch } from '../../types';

function Section({ title, count, expanded, onToggle, children }: {
  title: string; count: number; expanded: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center px-2 py-1 cursor-pointer hover:bg-editor-hover text-xs" onClick={onToggle}>
        <span className={`mr-1 text-editor-text-muted transition-transform ${expanded ? 'rotate-90' : ''}`}>›</span>
        <span className="flex-1 text-editor-text">{title}</span>
        <span className="text-editor-text-muted">{count}</span>
      </div>
      {expanded && children}
    </div>
  );
}

function BranchItem({ branch, onCheckout }: { branch: GitBranch; onCheckout: () => void }) {
  return (
    <div
      className={`flex items-center pl-4 pr-2 py-0.5 cursor-pointer hover:bg-editor-hover text-xs ${
        branch.is_current ? 'text-editor-text' : 'text-editor-text-muted'
      }`}
      onClick={!branch.is_current ? onCheckout : undefined}
    >
      <span className="w-3 mr-1">{branch.is_current ? '•' : ''}</span>
      <span className="truncate">{branch.name}</span>
    </div>
  );
}

export function GitBranches() {
  const { gitBranches } = useEditorStore();
  const { checkout, createBranch } = useGit();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [expanded, setExpanded] = useState({ local: true, remote: false });

  if (!gitBranches) return null;

  const handleCreate = async () => {
    if (newName.trim()) {
      const ok = await createBranch(newName.trim());
      if (ok) { setNewName(''); setCreating(false); }
    }
  };

  return (
    <div className="py-1">
      <div className="px-2 py-1">
        {creating ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') setCreating(false);
            }}
            onBlur={() => { if (!newName.trim()) setCreating(false); }}
            placeholder="New branch name"
            className="w-full px-2 py-1 text-xs bg-editor-bg border border-editor-border rounded text-editor-text placeholder:text-editor-text-muted outline-none focus:border-editor-accent"
            autoFocus
          />
        ) : (
          <button
            className="text-xs text-editor-text-muted hover:text-editor-text"
            onClick={() => setCreating(true)}
          >
            + New branch
          </button>
        )}
      </div>

      <Section title="Local" count={gitBranches.local.length} expanded={expanded.local} onToggle={() => setExpanded(p => ({ ...p, local: !p.local }))}>
        {gitBranches.local.map(b => <BranchItem key={b.name} branch={b} onCheckout={() => checkout(b.name)} />)}
      </Section>

      {gitBranches.remote.length > 0 && (
        <Section title="Remote" count={gitBranches.remote.length} expanded={expanded.remote} onToggle={() => setExpanded(p => ({ ...p, remote: !p.remote }))}>
          {gitBranches.remote.map(b => <BranchItem key={b.name} branch={b} onCheckout={() => checkout(b.name)} />)}
        </Section>
      )}
    </div>
  );
}
