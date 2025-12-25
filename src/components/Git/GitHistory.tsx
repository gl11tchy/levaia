import { useEditorStore } from '../../stores/editorStore';

export function GitHistory() {
  const { gitCommits } = useEditorStore();

  if (gitCommits.length === 0) {
    return (
      <div className="px-4 py-6 text-center text-editor-text-muted text-xs">
        No commits
      </div>
    );
  }

  return (
    <div className="py-1">
      {gitCommits.map(commit => (
        <div key={commit.hash} className="px-2 py-1 hover:bg-editor-hover text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-editor-text-muted flex-shrink-0">{commit.hash}</span>
            <span className="text-editor-text truncate" title={commit.message}>{commit.message}</span>
          </div>
          <div className="text-editor-text-muted pl-[52px]">{commit.author}, {commit.date}</div>
        </div>
      ))}
    </div>
  );
}
