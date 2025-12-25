import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

export function useGitBranch(rootPath: string | null): string | null {
  const [branch, setBranch] = useState<string | null>(null);

  useEffect(() => {
    if (!rootPath) {
      setBranch(null);
      return;
    }

    invoke<string | null>('get_git_branch', { rootPath })
      .then(setBranch)
      .catch(() => setBranch(null));
  }, [rootPath]);

  return branch;
}
