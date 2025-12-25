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
  const lowerName = name.toLowerCase();

  // Special file names
  if (lowerName === '.gitignore' || lowerName === '.gitattributes') {
    return <GitIcon className={className} />;
  }
  if (lowerName === '.env' || lowerName.startsWith('.env.')) {
    return <EnvIcon className={className} />;
  }
  if (lowerName === 'package.json' || lowerName === 'package-lock.json') {
    return <NpmIcon className={className} />;
  }
  if (lowerName === '.eslintrc' || lowerName === '.eslintrc.json' || lowerName === '.eslintrc.js' || lowerName === 'eslint.config.js' || lowerName === 'eslint.config.mjs') {
    return <EslintIcon className={className} />;
  }
  if (lowerName === 'tsconfig.json' || lowerName.startsWith('tsconfig.')) {
    return <TsConfigIcon className={className} />;
  }
  if (lowerName === 'vercel.json') {
    return <VercelIcon className={className} />;
  }
  if (lowerName === 'next.config.js' || lowerName === 'next.config.mjs' || lowerName === 'next-env.d.ts') {
    return <NextIcon className={className} />;
  }
  if (lowerName === 'tailwind.config.js' || lowerName === 'tailwind.config.ts') {
    return <TailwindIcon className={className} />;
  }
  if (lowerName === 'postcss.config.js' || lowerName === 'postcss.config.mjs') {
    return <PostCssIcon className={className} />;
  }
  if (lowerName === 'readme.md' || lowerName === 'readme') {
    return <ReadmeIcon className={className} />;
  }
  if (lowerName === 'license' || lowerName === 'license.md') {
    return <LicenseIcon className={className} />;
  }
  if (lowerName === 'dockerfile' || lowerName.endsWith('.dockerfile')) {
    return <DockerIcon className={className} />;
  }
  if (lowerName === 'cargo.toml' || lowerName === 'cargo.lock') {
    return <CargoIcon className={className} />;
  }
  if (lowerName === 'pnpm-lock.yaml' || lowerName === 'pnpm-workspace.yaml') {
    return <PnpmIcon className={className} />;
  }

  // Extension-based icons
  const IconComponent = getIconComponent(ext);
  return <IconComponent className={className} />;
}

// Individual icon components for cleaner code
function TypeScriptIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <rect width="16" height="16" rx="2" fill="#3178c6" />
      <text x="8" y="11.5" fontSize="7" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="system-ui">TS</text>
    </svg>
  );
}

function JavaScriptIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <rect width="16" height="16" rx="2" fill="#f7df1e" />
      <text x="8" y="11.5" fontSize="7" fontWeight="bold" fill="#323330" textAnchor="middle" fontFamily="system-ui">JS</text>
    </svg>
  );
}

function ReactIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="1.5" fill="#61dafb" />
      <ellipse cx="8" cy="8" rx="6.5" ry="2.5" fill="none" stroke="#61dafb" strokeWidth="0.8" />
      <ellipse cx="8" cy="8" rx="6.5" ry="2.5" fill="none" stroke="#61dafb" strokeWidth="0.8" transform="rotate(60 8 8)" />
      <ellipse cx="8" cy="8" rx="6.5" ry="2.5" fill="none" stroke="#61dafb" strokeWidth="0.8" transform="rotate(120 8 8)" />
    </svg>
  );
}

function JsonIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <text x="8" y="12" fontSize="11" fontWeight="bold" fill="#cbcb41" textAnchor="middle" fontFamily="system-ui">{'{}'}</text>
    </svg>
  );
}

function MarkdownIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <rect width="16" height="16" rx="2" fill="#083fa1" />
      <text x="8" y="11.5" fontSize="7" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="system-ui">MD</text>
    </svg>
  );
}

function HtmlIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <path d="M2 1l1.2 12L8 15l4.8-2L14 1H2z" fill="#e34c26" />
      <path d="M8 2.5v11l3.8-1.6L12.8 2.5H8z" fill="#ef652a" />
      <text x="8" y="10" fontSize="5" fontWeight="bold" fill="white" textAnchor="middle">H</text>
    </svg>
  );
}

function CssIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <path d="M2 1l1.2 12L8 15l4.8-2L14 1H2z" fill="#264de4" />
      <path d="M8 2.5v11l3.8-1.6L12.8 2.5H8z" fill="#2965f1" />
      <text x="8" y="10" fontSize="5" fontWeight="bold" fill="white" textAnchor="middle">C</text>
    </svg>
  );
}

function PythonIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <rect width="16" height="16" rx="2" fill="#3572A5" />
      <text x="8" y="11.5" fontSize="7" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="system-ui">PY</text>
    </svg>
  );
}

function RustIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <rect width="16" height="16" rx="2" fill="#dea584" />
      <text x="8" y="11.5" fontSize="7" fontWeight="bold" fill="#000" textAnchor="middle" fontFamily="system-ui">RS</text>
    </svg>
  );
}

function GoIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <rect width="16" height="16" rx="2" fill="#00ADD8" />
      <text x="8" y="11.5" fontSize="7" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="system-ui">GO</text>
    </svg>
  );
}

function GitIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16" fill="#f14e32">
      <path d="M15.698 7.287L8.712.302a1.03 1.03 0 0 0-1.457 0l-1.45 1.45 1.84 1.84a1.223 1.223 0 0 1 1.55 1.56l1.773 1.774a1.224 1.224 0 1 1-.733.693L8.57 5.953v4.123a1.224 1.224 0 1 1-1.008-.036V5.862a1.224 1.224 0 0 1-.665-1.605L5.093 2.453l-4.79 4.79a1.03 1.03 0 0 0 0 1.457l6.986 6.986a1.03 1.03 0 0 0 1.457 0l6.953-6.953a1.03 1.03 0 0 0 0-1.457" />
    </svg>
  );
}

function EnvIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <rect x="1" y="3" width="14" height="10" rx="1" fill="#ecd53f" />
      <circle cx="5" cy="8" r="2" fill="#323330" />
      <rect x="8" y="6" width="5" height="1.5" rx="0.5" fill="#323330" />
      <rect x="8" y="8.5" width="3" height="1.5" rx="0.5" fill="#323330" />
    </svg>
  );
}

function NpmIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <rect width="16" height="16" fill="#cb3837" />
      <path d="M3 3h10v10H8V5.5H5.5V13H3V3z" fill="white" />
    </svg>
  );
}

function EslintIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <path d="M8 1L1 5v6l7 4 7-4V5L8 1z" fill="#4B32C3" />
      <path d="M8 3.5L3 6.5v5l5 3 5-3v-5L8 3.5z" fill="#8080F2" />
    </svg>
  );
}

function TsConfigIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <rect width="16" height="16" rx="2" fill="#3178c6" />
      <path d="M4 10V6h4v1.2H5.5V10H4zm4.5 0V7.2h1.2V6H14v1.2h-2.8V10h-1.2z" fill="white" />
    </svg>
  );
}

function VercelIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <path d="M8 2L15 14H1L8 2z" fill="#000" />
    </svg>
  );
}

function NextIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="7" fill="#000" />
      <path d="M6 5v6l4.5-3L6 5z" fill="white" />
    </svg>
  );
}

function TailwindIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <path d="M8 4c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.9 1.35.99 1 2.13 2.15 4.6 2.15 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.9-1.35C11.61 5.15 10.47 4 8 4zM3 8c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.9 1.35C4.39 12.85 5.53 14 8 14c2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.9-1.35C6.61 9.15 5.47 8 3 8z" fill="#38bdf8" />
    </svg>
  );
}

function PostCssIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <rect width="16" height="16" rx="2" fill="#dd3a0a" />
      <text x="8" y="11" fontSize="6" fontWeight="bold" fill="white" textAnchor="middle">PC</text>
    </svg>
  );
}

function ReadmeIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <rect width="16" height="16" rx="2" fill="#2b579a" />
      <path d="M4 4h3v2H5v1h2v2H5v3H4V4zm5 0h3v8h-1V5H9V4z" fill="white" />
    </svg>
  );
}

function LicenseIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16" fill="#d4a007">
      <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13z" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  );
}

function DockerIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16" fill="#2496ed">
      <path d="M8.5 5H10v2H8.5V5zm-3 0H7v2H5.5V5zm-3 0H4v2H2.5V5zm6-3H10v2H8.5V2zm-3 0H7v2H5.5V2zm0 3H7v2H5.5V5zm-3 3H4v2H2.5V8zm3 0H7v2H5.5V8zm3 0H10v2H8.5V8z" />
      <path d="M15 7c-.5-.5-1.5-.5-2.5-.3 0-.8-.5-1.5-1-2l-.3-.2-.2.3c-.3.5-.5 1-.5 1.5 0 .3 0 .5.2.8-.3.2-.8.3-1.7.3H.5l-.1.5c0 1 .2 2 .5 2.8.5 1 1.2 1.5 2 2 1 .5 2.5.8 4 .8 3.5 0 6-1.5 7.2-4.3.5 0 1.5 0 2-.8l.2-.3-.3-.2c-.5-.3-1-.5-1.5-.4z" />
    </svg>
  );
}

function CargoIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <rect width="16" height="16" rx="2" fill="#dea584" />
      <circle cx="8" cy="8" r="4" fill="none" stroke="#000" strokeWidth="1.5" />
      <circle cx="8" cy="8" r="1" fill="#000" />
    </svg>
  );
}

function PnpmIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <rect x="1" y="1" width="4" height="4" fill="#f9ad00" />
      <rect x="6" y="1" width="4" height="4" fill="#f9ad00" />
      <rect x="11" y="1" width="4" height="4" fill="#f9ad00" />
      <rect x="6" y="6" width="4" height="4" fill="#f9ad00" />
      <rect x="6" y="11" width="4" height="4" fill="#4e4e4e" />
      <rect x="11" y="6" width="4" height="4" fill="#4e4e4e" />
      <rect x="11" y="11" width="4" height="4" fill="#4e4e4e" />
    </svg>
  );
}

function ShellIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <rect width="16" height="16" rx="2" fill="#89e051" />
      <text x="8" y="11" fontSize="9" fontWeight="bold" fill="#000" textAnchor="middle">$</text>
    </svg>
  );
}

function YamlIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <rect width="16" height="16" rx="2" fill="#cb171e" />
      <text x="8" y="11.5" fontSize="7" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="system-ui">YML</text>
    </svg>
  );
}

function SqlIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <ellipse cx="8" cy="4" rx="6" ry="2.5" fill="#e38c00" />
      <path d="M2 4v8c0 1.38 2.69 2.5 6 2.5s6-1.12 6-2.5V4" fill="none" stroke="#e38c00" strokeWidth="1.5" />
      <ellipse cx="8" cy="12" rx="6" ry="2.5" fill="none" stroke="#e38c00" strokeWidth="1" />
    </svg>
  );
}

function ImageIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16" fill="#a074c4">
      <rect x="1" y="2" width="14" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="5" cy="6" r="1.5" />
      <path d="M2 12l3-3 2 2 4-4 3 3v2H2v0z" />
    </svg>
  );
}

function SvgIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <rect width="16" height="16" rx="2" fill="#ffb13b" />
      <text x="8" y="11" fontSize="6" fontWeight="bold" fill="#000" textAnchor="middle">SVG</text>
    </svg>
  );
}

function DefaultFileIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16" fill="#6d8086">
      <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0H4z" opacity="0.8" />
      <path d="M9 0v4.5A1.5 1.5 0 0 0 10.5 6H14L9 0z" opacity="0.5" />
    </svg>
  );
}

function getIconComponent(ext: string): React.FC<{ className?: string }> {
  const iconMap: Record<string, React.FC<{ className?: string }>> = {
    // JavaScript/TypeScript
    '.js': JavaScriptIcon,
    '.mjs': JavaScriptIcon,
    '.cjs': JavaScriptIcon,
    '.jsx': ReactIcon,
    '.ts': TypeScriptIcon,
    '.mts': TypeScriptIcon,
    '.cts': TypeScriptIcon,
    '.tsx': ReactIcon,

    // Web
    '.html': HtmlIcon,
    '.htm': HtmlIcon,
    '.css': CssIcon,
    '.scss': CssIcon,
    '.less': CssIcon,

    // Data
    '.json': JsonIcon,
    '.yaml': YamlIcon,
    '.yml': YamlIcon,
    '.toml': CargoIcon,

    // Markdown
    '.md': MarkdownIcon,
    '.mdx': MarkdownIcon,

    // Programming
    '.py': PythonIcon,
    '.rs': RustIcon,
    '.go': GoIcon,

    // Shell
    '.sh': ShellIcon,
    '.bash': ShellIcon,
    '.zsh': ShellIcon,

    // Images
    '.png': ImageIcon,
    '.jpg': ImageIcon,
    '.jpeg': ImageIcon,
    '.gif': ImageIcon,
    '.webp': ImageIcon,
    '.svg': SvgIcon,
    '.ico': ImageIcon,

    // SQL
    '.sql': SqlIcon,
  };

  return iconMap[ext] || DefaultFileIcon;
}
