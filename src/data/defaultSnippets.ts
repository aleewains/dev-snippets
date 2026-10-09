import { Snippet } from '../types/snippet';

export const DEFAULT_SNIPPETS: Snippet[] = [
  // Docker
  {
    id: 'docker-prune-all',
    title: 'Docker System Deep Prune',
    command: 'docker system prune -a --volumes -f',
    description: 'Purge all stopped containers, dangling images, unused networks, and build cache.',
    category: 'docker',
    tags: ['docker', 'clean', 'disk', 'prune'],
    isPinned: true,
    placeholders: [],
    explanationMarkdown:
      '### What it does\nReclaims disk space by ruthlessly removing:\n- All stopped containers\n- All unused volumes\n- All networks not used by at least one container\n- All unused build cache\n\n> ⚠️ **Warning**: Do not run in production if you rely on un-tagged stopped containers.',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'docker-stream-logs',
    title: 'Stream Container Logs with Timestamps',
    command: 'docker logs -f --tail 100 --timestamps <container>',
    description: 'Follow live output tailing the last 100 lines with high-resolution timestamps.',
    category: 'docker',
    tags: ['docker', 'logs', 'debug', 'tail'],
    isPinned: false,
    placeholders: [{ key: '<container>', label: 'Container ID or Name', defaultValue: 'app_backend' }],
    explanationMarkdown:
      '### Usage Flags\n- `-f` / `--follow`: Stream live stdout/stderr.\n- `--tail 100`: Avoid waiting for multi-gigabyte logs by starting from recent 100 lines.\n- `--timestamps`: Prepend ISO 8601 timestamps.',
    createdAt: '2026-01-11T12:00:00Z',
    updatedAt: '2026-01-11T12:00:00Z',
  },
  {
    id: 'docker-exec-sh',
    title: 'Interactive Shell Inside Container',
    command: 'docker exec -it <container> /bin/sh',
    description: 'Spawn an interactive TTY shell session inside a running Alpine/Linux container.',
    category: 'docker',
    tags: ['docker', 'exec', 'bash', 'terminal'],
    isPinned: false,
    placeholders: [{ key: '<container>', label: 'Container ID or Name', defaultValue: 'redis-cache' }],
    explanationMarkdown:
      '### Tip\nIf `/bin/sh` fails or you are on Debian/Ubuntu-based images, replace with `/bin/bash`.',
    createdAt: '2026-01-12T09:00:00Z',
    updatedAt: '2026-01-12T09:00:00Z',
  },

  // Git
  {
    id: 'git-undo-soft',
    title: 'Undo Last Commit (Keep Changes Staged)',
    command: 'git reset --soft HEAD~1',
    description: 'Roll back commit message and snapshot while preserving your staged working directory intact.',
    category: 'git',
    tags: ['git', 'undo', 'commit', 'reset'],
    isPinned: true,
    placeholders: [],
    explanationMarkdown:
      '### When to use\nUse this when you made a commit prematurely (e.g., forgot a file or typo in the commit message). All modified files stay staged in the index ready to be re-committed.',
    createdAt: '2026-01-13T14:20:00Z',
    updatedAt: '2026-01-13T14:20:00Z',
  },
  {
    id: 'git-discard-hard',
    title: 'Discard All Local Changes (Nuclear Reset)',
    command: 'git reset --hard HEAD && git clean -fd',
    description: 'Revert all modified tracked files and purge untracked files and directories.',
    category: 'git',
    tags: ['git', 'clean', 'reset', 'discard'],
    isPinned: false,
    placeholders: [],
    explanationMarkdown:
      '### ⚠️ Permanent Action\nThis nukes unstaged work and removes untracked scratch files. Make sure you don’t have uncommitted edits you care about.',
    createdAt: '2026-01-14T08:15:00Z',
    updatedAt: '2026-01-14T08:15:00Z',
  },
  {
    id: 'git-pretty-log',
    title: 'Compact Pretty Git Graph Tree',
    command: 'git log --graph --oneline --decorate --all -n 25',
    description: 'Visualize branch topology, commit hashes, branch pointers, and merges in a single screen.',
    category: 'git',
    tags: ['git', 'log', 'history', 'tree', 'graph'],
    isPinned: false,
    placeholders: [],
    explanationMarkdown:
      '### Pro Tip\nYou can alias this in your `~/.gitconfig`:\n```ini\n[alias]\n  lg = log --graph --oneline --decorate --all\n```',
    createdAt: '2026-01-15T11:00:00Z',
    updatedAt: '2026-01-15T11:00:00Z',
  },

  // Bash
  {
    id: 'bash-find-port',
    title: 'Find Process Listening on Port',
    command: 'lsof -i :<port> -sTCP:LISTEN -P -n',
    description: 'Inspect PID, process name, and socket binding for a given TCP port.',
    category: 'bash',
    tags: ['bash', 'port', 'lsof', 'network', 'kill'],
    isPinned: true,
    placeholders: [{ key: '<port>', label: 'Port number', defaultValue: '3000' }],
    explanationMarkdown:
      '### Next Step\nOnce you find the PID in the second column, you can terminate it with:\n```bash\nkill -9 <PID>\n```',
    createdAt: '2026-01-16T16:30:00Z',
    updatedAt: '2026-01-16T16:30:00Z',
  },
  {
    id: 'bash-find-large-files',
    title: 'Find Top 10 Largest Files in Directory',
    command: 'du -ah . 2>/dev/null | sort -rh | head -n 10',
    description: 'Recursively scan disk usage and output the ten heaviest files or folders in human-readable sizes.',
    category: 'bash',
    tags: ['bash', 'disk', 'du', 'storage', 'find'],
    isPinned: false,
    placeholders: [],
    explanationMarkdown:
      '### Breakdown\n- `du -ah .`: Disk usage for all files in human format (`M`, `G`).\n- `2>/dev/null`: Silence permission denied errors.\n- `sort -rh`: Sort reverse numeric with human suffix understanding.\n- `head -n 10`: Top 10 culprits.',
    createdAt: '2026-01-17T09:45:00Z',
    updatedAt: '2026-01-17T09:45:00Z',
  },

  // Kubernetes
  {
    id: 'k8s-crashed-logs',
    title: 'Logs from Previous Crashed Pod',
    command: 'kubectl logs -p <pod_name> -n <namespace>',
    description: 'Extract crash dump and panic stdout/stderr from a container before it restart-looped.',
    category: 'k8s',
    tags: ['k8s', 'kubernetes', 'crash', 'logs', 'oom'],
    isPinned: false,
    placeholders: [
      { key: '<pod_name>', label: 'Pod Name', defaultValue: 'api-deployment-7f89c' },
      { key: '<namespace>', label: 'Namespace', defaultValue: 'production' },
    ],
    explanationMarkdown:
      '### Why `-p` matters\nWhen a pod hits an `OOMKilled` or `CrashLoopBackOff`, normal `kubectl logs` only displays the fresh rebooted instance. The `-p` flag targets the prior deceased container instance.',
    createdAt: '2026-01-18T13:20:00Z',
    updatedAt: '2026-01-18T13:20:00Z',
  },

  // Regex
  {
    id: 'regex-email',
    title: 'Email Address Validation Pattern',
    command: '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$',
    description: 'Standard regex matching standard email format with subdomains and valid character classes.',
    category: 'regex',
    tags: ['regex', 'email', 'validation', 'pattern'],
    isPinned: false,
    placeholders: [],
    explanationMarkdown:
      '### Validation\n- Matches user local part with `+`, `_`, `.`, `-`\n- Validates `@` separator\n- Validates domain and TLD.',
    createdAt: '2026-01-19T15:00:00Z',
    updatedAt: '2026-01-19T15:00:00Z',
  },

  // SQL
  {
    id: 'sql-upsert-pg',
    title: 'PostgreSQL Idempotent Upsert',
    command: 'INSERT INTO <table> (id, name, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();',
    description: 'Insert record or update existing row atomically on unique key conflict.',
    category: 'sql',
    tags: ['sql', 'postgres', 'upsert', 'conflict'],
    isPinned: false,
    placeholders: [{ key: '<table>', label: 'Table Name', defaultValue: 'users' }],
    explanationMarkdown:
      '### Mechanics\n`EXCLUDED` refers to the prospective row proposed in `VALUES`. This avoids separate read-then-write race conditions in concurrent transactions.',
    createdAt: '2026-01-20T17:10:00Z',
    updatedAt: '2026-01-20T17:10:00Z',
  },
];
