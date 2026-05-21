const MUTED_MESSAGES = [
  'each child in a list should have a unique "key" prop',
  'Each child in a list should have a unique "key" prop',
];

export function shouldMuteMessage(message: string): boolean {
  return MUTED_MESSAGES.some((muted) => message.includes(muted));
}

export function extractSourceLocation(stack: string): string {
  if (!stack) {
    return '';
  }

  const patterns = [
    /at .+\/(app\/[^:)]+):(\d+):(\d+)/,
    /at .+\/(components\/[^:)]+):(\d+):(\d+)/,
    /at .+\/([^/]+\.tsx?):(\d+):(\d+)/,
    /at .+\/([^/]+\.bundle[^:]*):(\d+):(\d+)/,
    /at .+\/([^/\s:)]+\.[jt]sx?):(\d+):(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = stack.match(pattern);
    if (match) {
      return `${match[1]}:${match[2]}:${match[3]}`;
    }
  }

  const fileMatch = stack.match(/at .+\/([^/\s:)]+\.[jt]sx?):(\d+)/);
  if (fileMatch) {
    return `${fileMatch[1]}:${fileMatch[2]}`;
  }

  return '';
}

export function getCallerInfoFromStack(stack: string): string {
  const lines = stack.split('\n');

  for (let index = 3; index < lines.length; index += 1) {
    const line = lines[index] ?? '';

    if (line.includes('errorLogger') || line.includes('node_modules')) {
      continue;
    }

    let match = line.match(/at\s+\S+\s+\((?:.*\/)?([^/\s:)]+\.[jt]sx?):(\d+):(\d+)\)/);
    if (match) {
      return `${match[1]}:${match[2]}`;
    }

    match = line.match(/at\s+(?:.*\/)?([^/\s:)]+\.[jt]sx?):(\d+):(\d+)/);
    if (match) {
      return `${match[1]}:${match[2]}`;
    }

    match = line.match(/(?:.*\/)?([^/\s:)]+\.[jt]sx?):(\d+):\d+/);
    if (match) {
      return `${match[1]}:${match[2]}`;
    }

    if (
      line.includes('app/') ||
      line.includes('components/') ||
      line.includes('screens/') ||
      line.includes('hooks/') ||
      line.includes('utils/')
    ) {
      match = line.match(/([^/\s:)]+\.[jt]sx?):(\d+)/);
      if (match) {
        return `${match[1]}:${match[2]}`;
      }
    }
  }

  return '';
}

export function stringifyLogArgs(args: any[]): string {
  return args
    .map((arg) => {
      if (typeof arg === 'string') {
        return arg;
      }
      if (arg === null) {
        return 'null';
      }
      if (arg === undefined) {
        return 'undefined';
      }
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    })
    .join(' ');
}
