import { getExtension } from '../../lib/fileUtils';

interface FileIconProps {
  name: string;
  isDirectory: boolean;
  isExpanded?: boolean;
  className?: string;
}

export function FileIcon({ name, isDirectory, isExpanded, className = '' }: FileIconProps) {
  if (isDirectory) {
    return (
      <svg
        className={`w-4 h-4 ${className}`}
        viewBox="0 0 16 16"
        fill={isExpanded ? '#dcb67a' : '#c09553'}
      >
        <path d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5V5a1.5 1.5 0 0 0-1.5-1.5h-6l-1-1.5H1.5z" />
      </svg>
    );
  }

  const ext = getExtension(name).toLowerCase();
  const iconProps = getIconByExtension(ext);

  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16" fill={iconProps.color}>
      <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0H4z" opacity="0.8" />
      <path d="M9 0v4.5A1.5 1.5 0 0 0 10.5 6H14L9 0z" opacity="0.5" />
      {iconProps.icon && (
        <text x="7" y="12" fontSize="6" textAnchor="middle" fill="white" fontWeight="bold">
          {iconProps.icon}
        </text>
      )}
    </svg>
  );
}

interface IconInfo {
  color: string;
  icon?: string;
}

function getIconByExtension(ext: string): IconInfo {
  const iconMap: Record<string, IconInfo> = {
    // JavaScript/TypeScript
    '.js': { color: '#f1e05a', icon: 'JS' },
    '.jsx': { color: '#61dafb', icon: 'JSX' },
    '.ts': { color: '#3178c6', icon: 'TS' },
    '.tsx': { color: '#3178c6', icon: 'TSX' },

    // Web
    '.html': { color: '#e34c26', icon: 'H' },
    '.css': { color: '#563d7c', icon: 'C' },
    '.scss': { color: '#c6538c', icon: 'S' },
    '.less': { color: '#1d365d', icon: 'L' },

    // Data
    '.json': { color: '#cbcb41', icon: '{ }' },
    '.yaml': { color: '#cb171e', icon: 'Y' },
    '.yml': { color: '#cb171e', icon: 'Y' },
    '.toml': { color: '#9c4121', icon: 'T' },
    '.xml': { color: '#e34c26', icon: 'X' },

    // Markdown
    '.md': { color: '#083fa1', icon: 'M' },
    '.mdx': { color: '#fcb32c', icon: 'MDX' },

    // Programming
    '.py': { color: '#3572A5', icon: 'PY' },
    '.rs': { color: '#dea584', icon: 'RS' },
    '.go': { color: '#00ADD8', icon: 'GO' },
    '.java': { color: '#b07219', icon: 'J' },
    '.c': { color: '#555555', icon: 'C' },
    '.cpp': { color: '#f34b7d', icon: 'C++' },
    '.cs': { color: '#178600', icon: 'C#' },
    '.rb': { color: '#701516', icon: 'RB' },
    '.php': { color: '#4F5D95', icon: 'PHP' },
    '.swift': { color: '#F05138', icon: 'SW' },

    // Shell
    '.sh': { color: '#89e051', icon: '$' },
    '.bash': { color: '#89e051', icon: '$' },
    '.zsh': { color: '#89e051', icon: '$' },
    '.ps1': { color: '#012456', icon: 'PS' },

    // Config
    '.env': { color: '#ecd53f', icon: 'E' },
    '.gitignore': { color: '#f14e32', icon: 'GI' },
    '.dockerignore': { color: '#384d54', icon: 'D' },

    // Images
    '.png': { color: '#a074c4', icon: 'IMG' },
    '.jpg': { color: '#a074c4', icon: 'IMG' },
    '.jpeg': { color: '#a074c4', icon: 'IMG' },
    '.gif': { color: '#a074c4', icon: 'IMG' },
    '.svg': { color: '#ffb13b', icon: 'SVG' },
    '.ico': { color: '#a074c4', icon: 'ICO' },

    // Documents
    '.pdf': { color: '#b30b00', icon: 'PDF' },
    '.txt': { color: '#89e051', icon: 'TXT' },
    '.log': { color: '#89e051', icon: 'LOG' },

    // SQL
    '.sql': { color: '#e38c00', icon: 'SQL' },
  };

  return iconMap[ext] || { color: '#6d8086' };
}
