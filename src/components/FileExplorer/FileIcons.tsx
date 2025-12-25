import { getExtension } from '../../lib/fileUtils';

interface FileIconProps {
  name: string;
  isDirectory: boolean;
  className?: string;
}

export function FileIcon({ name, isDirectory, className = '' }: FileIconProps) {
  // Folders - OUTLINED and GRAY like Zed
  if (isDirectory) {
    return (
      <svg
        className={`w-4 h-4 ${className}`}
        viewBox="0 0 16 16"
        fill="none"
        stroke="#6d8086"
        strokeWidth="1.2"
      >
        <path d="M1.5 3.5h4l1 1.5h6.5a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-7.5a1 1 0 0 1 1-1z" />
      </svg>
    );
  }

  const ext = getExtension(name).toLowerCase();
  const lowerName = name.toLowerCase();

  // Special file names only - minimal list like Zed
  if (lowerName === '.gitignore' || lowerName === '.gitattributes') {
    return <GitIcon className={className} />;
  }
  if (lowerName === '.env' || lowerName.startsWith('.env.')) {
    return <EnvIcon className={className} />;
  }
  if (lowerName.startsWith('.eslintrc') || lowerName === 'eslint.config.js' || lowerName === 'eslint.config.mjs') {
    return <EslintIcon className={className} />;
  }
  if (lowerName.endsWith('.tsbuildinfo')) {
    return <ConfigLinesIcon className={className} />;
  }

  // Extension-based icons
  const IconComponent = getIconComponent(ext);
  return <IconComponent className={className} />;
}

// All icons are GRAY/MONOCHROME like Zed - no colors!
const ICON_COLOR = '#6d8086';

// TypeScript - Gray badge with "TS"
function TypeScriptIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <rect width="16" height="16" rx="2" fill="none" stroke={ICON_COLOR} strokeWidth="1" />
      <text x="8" y="11.5" fontSize="7" fontWeight="bold" fill={ICON_COLOR} textAnchor="middle" fontFamily="system-ui">TS</text>
    </svg>
  );
}

// JavaScript - Gray badge with "JS"
function JavaScriptIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <rect width="16" height="16" rx="2" fill="none" stroke={ICON_COLOR} strokeWidth="1" />
      <text x="8" y="11.5" fontSize="7" fontWeight="bold" fill={ICON_COLOR} textAnchor="middle" fontFamily="system-ui">JS</text>
    </svg>
  );
}

// JSON - Gray curly braces
function JsonIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <text x="8" y="12" fontSize="12" fontWeight="bold" fill={ICON_COLOR} textAnchor="middle" fontFamily="system-ui">{'{}'}</text>
    </svg>
  );
}

// Markdown - Gray "MD" badge
function MarkdownIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <rect width="16" height="16" rx="2" fill="none" stroke={ICON_COLOR} strokeWidth="1" />
      <text x="8" y="11.5" fontSize="7" fontWeight="bold" fill={ICON_COLOR} textAnchor="middle" fontFamily="system-ui">MD</text>
    </svg>
  );
}

// Git - Gray branch icon
function GitIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16" fill={ICON_COLOR}>
      <path d="M11.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zm-2.25.75a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.5 0v1.836A2.492 2.492 0 0 1 6 7h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25zM4.25 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zM3.5 3.25a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0z" />
    </svg>
  );
}

// Env - Three horizontal lines
function EnvIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16" fill={ICON_COLOR}>
      <rect x="3" y="4" width="10" height="1.5" rx="0.5" />
      <rect x="3" y="7.25" width="10" height="1.5" rx="0.5" />
      <rect x="3" y="10.5" width="10" height="1.5" rx="0.5" />
    </svg>
  );
}

// ESLint - Gray filled circle
function EslintIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="6" fill={ICON_COLOR} />
    </svg>
  );
}

// Config lines icon (for .tsbuildinfo etc)
function ConfigLinesIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16" fill={ICON_COLOR}>
      <rect x="3" y="4" width="10" height="1.5" rx="0.5" />
      <rect x="3" y="7.25" width="10" height="1.5" rx="0.5" />
      <rect x="3" y="10.5" width="10" height="1.5" rx="0.5" />
    </svg>
  );
}

// YAML - Gear icon
function YamlIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16" fill={ICON_COLOR}>
      <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
      <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
    </svg>
  );
}

// HTML - Gray badge
function HtmlIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <rect width="16" height="16" rx="2" fill="none" stroke={ICON_COLOR} strokeWidth="1" />
      <text x="8" y="11.5" fontSize="7" fontWeight="bold" fill={ICON_COLOR} textAnchor="middle" fontFamily="system-ui">H</text>
    </svg>
  );
}

// CSS - Gray badge
function CssIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <rect width="16" height="16" rx="2" fill="none" stroke={ICON_COLOR} strokeWidth="1" />
      <text x="8" y="11.5" fontSize="7" fontWeight="bold" fill={ICON_COLOR} textAnchor="middle" fontFamily="system-ui">C</text>
    </svg>
  );
}

// Python - Gray badge
function PythonIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <rect width="16" height="16" rx="2" fill="none" stroke={ICON_COLOR} strokeWidth="1" />
      <text x="8" y="11.5" fontSize="7" fontWeight="bold" fill={ICON_COLOR} textAnchor="middle" fontFamily="system-ui">PY</text>
    </svg>
  );
}

// Rust - Gray badge
function RustIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <rect width="16" height="16" rx="2" fill="none" stroke={ICON_COLOR} strokeWidth="1" />
      <text x="8" y="11.5" fontSize="7" fontWeight="bold" fill={ICON_COLOR} textAnchor="middle" fontFamily="system-ui">RS</text>
    </svg>
  );
}

// Go - Gray badge
function GoIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <rect width="16" height="16" rx="2" fill="none" stroke={ICON_COLOR} strokeWidth="1" />
      <text x="8" y="11.5" fontSize="7" fontWeight="bold" fill={ICON_COLOR} textAnchor="middle" fontFamily="system-ui">GO</text>
    </svg>
  );
}

// Shell - Gray badge
function ShellIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <rect width="16" height="16" rx="2" fill="none" stroke={ICON_COLOR} strokeWidth="1" />
      <text x="8" y="11" fontSize="9" fontWeight="bold" fill={ICON_COLOR} textAnchor="middle">$</text>
    </svg>
  );
}

// SQL - Gray database icon
function SqlIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16" fill={ICON_COLOR}>
      <ellipse cx="8" cy="4" rx="5" ry="2" />
      <path d="M3 4v8c0 1.1 2.24 2 5 2s5-.9 5-2V4" fill="none" stroke={ICON_COLOR} strokeWidth="1.3" />
    </svg>
  );
}

// Image - Gray
function ImageIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16" fill={ICON_COLOR}>
      <rect x="1" y="2" width="14" height="12" rx="1" fill="none" stroke={ICON_COLOR} strokeWidth="1.2" />
      <circle cx="5" cy="6" r="1.5" />
      <path d="M2 12l3-3 2 2 4-4 3 3v2H2z" />
    </svg>
  );
}

// SVG - Gray badge
function SvgIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <rect width="16" height="16" rx="2" fill="none" stroke={ICON_COLOR} strokeWidth="1" />
      <text x="8" y="11" fontSize="6" fontWeight="bold" fill={ICON_COLOR} textAnchor="middle">SVG</text>
    </svg>
  );
}

// TOML - Gray badge
function TomlIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16">
      <rect width="16" height="16" rx="2" fill="none" stroke={ICON_COLOR} strokeWidth="1" />
      <text x="8" y="11.5" fontSize="6" fontWeight="bold" fill={ICON_COLOR} textAnchor="middle" fontFamily="system-ui">TML</text>
    </svg>
  );
}

// Default file - simple outline
function DefaultFileIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16" fill="none" stroke="#6d8086" strokeWidth="1">
      <path d="M4 1.5h5.5L13 5v9a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 14V3a1.5 1.5 0 0 1 1-1.5z" />
      <path d="M9.5 1.5V5H13" />
    </svg>
  );
}

function getIconComponent(ext: string): React.FC<{ className?: string }> {
  const iconMap: Record<string, React.FC<{ className?: string }>> = {
    // JavaScript/TypeScript - simple badges
    '.js': JavaScriptIcon,
    '.mjs': JavaScriptIcon,
    '.cjs': JavaScriptIcon,
    '.jsx': JavaScriptIcon,
    '.ts': TypeScriptIcon,
    '.mts': TypeScriptIcon,
    '.cts': TypeScriptIcon,
    '.tsx': TypeScriptIcon,

    // Web
    '.html': HtmlIcon,
    '.htm': HtmlIcon,
    '.css': CssIcon,
    '.scss': CssIcon,
    '.less': CssIcon,

    // Data - JSON uses braces, YAML uses gear
    '.json': JsonIcon,
    '.yaml': YamlIcon,
    '.yml': YamlIcon,
    '.toml': TomlIcon,

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
