import { useState } from 'react';
import { useGit } from '../../hooks/useGit';

export function GitCommitInput() {
  const [message, setMessage] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const { commit } = useGit();

  const handleCommit = async () => {
    if (!message.trim() || isCommitting) return;
    setIsCommitting(true);
    try {
      const hash = await commit(message);
      if (hash) setMessage('');
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="p-2 border-b border-editor-border">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message (Ctrl+Enter to commit)"
        className="w-full px-2 py-1 text-xs bg-editor-bg border border-editor-border rounded focus:border-editor-accent outline-none text-editor-text placeholder:text-editor-text-muted"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleCommit();
          }
        }}
      />
    </div>
  );
}
