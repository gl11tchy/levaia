// Language detection based on file extension
const LANGUAGE_MAP: Record<string, string> = {
  // JavaScript/TypeScript
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.mts': 'typescript',
  '.cts': 'typescript',

  // Web
  '.html': 'html',
  '.htm': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.sass': 'scss',
  '.less': 'less',
  '.vue': 'vue',
  '.svelte': 'svelte',

  // Data formats
  '.json': 'json',
  '.jsonc': 'json',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.toml': 'toml',
  '.xml': 'xml',
  '.svg': 'xml',
  '.csv': 'plaintext',

  // Markup
  '.md': 'markdown',
  '.mdx': 'markdown',
  '.txt': 'plaintext',
  '.log': 'plaintext',

  // Programming languages
  '.py': 'python',
  '.pyw': 'python',
  '.rs': 'rust',
  '.go': 'go',
  '.java': 'java',
  '.kt': 'kotlin',
  '.kts': 'kotlin',
  '.scala': 'scala',
  '.c': 'c',
  '.h': 'c',
  '.cpp': 'cpp',
  '.cc': 'cpp',
  '.cxx': 'cpp',
  '.hpp': 'cpp',
  '.hxx': 'cpp',
  '.cs': 'csharp',
  '.rb': 'ruby',
  '.php': 'php',
  '.swift': 'swift',
  '.m': 'objective-c',
  '.mm': 'objective-c',
  '.lua': 'lua',
  '.r': 'r',
  '.R': 'r',
  '.pl': 'perl',
  '.pm': 'perl',
  '.ex': 'elixir',
  '.exs': 'elixir',
  '.erl': 'erlang',
  '.hrl': 'erlang',
  '.clj': 'clojure',
  '.cljs': 'clojure',
  '.fs': 'fsharp',
  '.fsx': 'fsharp',
  '.hs': 'haskell',
  '.dart': 'dart',
  '.zig': 'zig',
  '.nim': 'nim',
  '.v': 'v',
  '.d': 'd',
  '.sol': 'solidity',

  // Shell/Scripts
  '.sh': 'shell',
  '.bash': 'shell',
  '.zsh': 'shell',
  '.fish': 'shell',
  '.ps1': 'powershell',
  '.psm1': 'powershell',
  '.bat': 'bat',
  '.cmd': 'bat',

  // Config files
  '.ini': 'ini',
  '.conf': 'ini',
  '.cfg': 'ini',
  '.env': 'dotenv',
  '.properties': 'properties',

  // Database
  '.sql': 'sql',
  '.pgsql': 'pgsql',
  '.mysql': 'mysql',

  // Docker/DevOps
  '.dockerfile': 'dockerfile',
  '.dockerignore': 'ignore',
  '.gitignore': 'ignore',
  '.gitattributes': 'properties',

  // Documentation
  '.rst': 'restructuredtext',
  '.tex': 'latex',
  '.bib': 'bibtex',

  // GraphQL
  '.graphql': 'graphql',
  '.gql': 'graphql',

  // Misc
  '.diff': 'diff',
  '.patch': 'diff',
  '.makefile': 'makefile',
};

// Special filenames that have specific languages
const FILENAME_MAP: Record<string, string> = {
  'Dockerfile': 'dockerfile',
  'Makefile': 'makefile',
  'CMakeLists.txt': 'cmake',
  'Gemfile': 'ruby',
  'Rakefile': 'ruby',
  'Vagrantfile': 'ruby',
  'Brewfile': 'ruby',
  '.gitignore': 'ignore',
  '.dockerignore': 'ignore',
  '.editorconfig': 'ini',
  '.prettierrc': 'json',
  '.eslintrc': 'json',
  'tsconfig.json': 'jsonc',
  'jsconfig.json': 'jsonc',
  'package.json': 'json',
  'composer.json': 'json',
  'Cargo.toml': 'toml',
  'go.mod': 'go.mod',
  'go.sum': 'go.sum',
};

export function detectLanguage(filename: string): string {
  // Check special filenames first
  const basename = filename.split('/').pop() || filename;
  if (FILENAME_MAP[basename]) {
    return FILENAME_MAP[basename];
  }

  // Check extension
  const lastDot = basename.lastIndexOf('.');
  if (lastDot > 0) {
    const ext = basename.substring(lastDot).toLowerCase();
    if (LANGUAGE_MAP[ext]) {
      return LANGUAGE_MAP[ext];
    }
  }

  return 'plaintext';
}

// File size formatting
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + units[i];
}

// Path utilities
export function getFileName(path: string): string {
  return path.split(/[\\/]/).pop() || path;
}

export function getDirectory(path: string): string {
  const parts = path.split(/[\\/]/);
  parts.pop();
  return parts.join('/') || '/';
}

export function getExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.substring(lastDot) : '';
}

export function joinPath(...parts: string[]): string {
  return parts.join('/').replace(/\/+/g, '/');
}

// Fuzzy search utilities
export function fuzzyMatch(str: string, query: string): boolean {
  if (!query) return true;

  const strLower = str.toLowerCase();
  const queryLower = query.toLowerCase();

  let queryIndex = 0;
  for (let i = 0; i < strLower.length && queryIndex < queryLower.length; i++) {
    if (strLower[i] === queryLower[queryIndex]) {
      queryIndex++;
    }
  }

  return queryIndex === queryLower.length;
}

export function fuzzyScore(str: string, query: string): number {
  if (!query) return 0;

  const strLower = str.toLowerCase();
  const queryLower = query.toLowerCase();

  let score = 0;
  let queryIndex = 0;
  let consecutiveBonus = 0;

  for (let i = 0; i < strLower.length && queryIndex < queryLower.length; i++) {
    if (strLower[i] === queryLower[queryIndex]) {
      score += 1 + consecutiveBonus;
      consecutiveBonus++;
      queryIndex++;

      // Bonus for matching at start
      if (i === 0) score += 3;

      // Bonus for matching after separator
      if (i > 0 && (strLower[i - 1] === '/' || strLower[i - 1] === '\\' || strLower[i - 1] === '.')) {
        score += 2;
      }
    } else {
      consecutiveBonus = 0;
    }
  }

  // Penalize longer strings
  score -= str.length * 0.01;

  return score;
}
