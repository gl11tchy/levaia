interface GitStatusIconProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { color: string; label: string }> = {
  'M': { color: 'text-amber-500/70', label: 'Modified' },
  'A': { color: 'text-emerald-500/70', label: 'Added' },
  'D': { color: 'text-red-500/70', label: 'Deleted' },
  'R': { color: 'text-violet-500/70', label: 'Renamed' },
  'C': { color: 'text-sky-500/70', label: 'Copied' },
  '?': { color: 'text-editor-text-muted', label: 'Untracked' },
  'U': { color: 'text-orange-500/70', label: 'Conflict' },
};

export function GitStatusIcon({ status, className = '' }: GitStatusIconProps) {
  const { color, label } = statusConfig[status] || { color: 'text-editor-text-muted', label: 'Unknown' };

  return (
    <span className={`font-mono text-[10px] ${color} ${className}`} title={label}>
      {status}
    </span>
  );
}
