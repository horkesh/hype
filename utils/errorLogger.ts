
import { Platform } from "react-native";
import Constants from "expo-constants";

// Global error logging for runtime errors
// Captures console.log/warn/error and sends to Natively server for AI debugging

// Declare __DEV__ global (React Native global for development mode detection)
declare const __DEV__: boolean;

// Simple debouncing to prevent duplicate logs
const recentLogs: { [key: string]: boolean } = {};
const clearLogAfterDelay = (logKey: string) => {
  setTimeout(() => delete recentLogs[logKey], 100);
};

// Messages to mute (noisy warnings that don't help debugging)
const MUTED_MESSAGES = [
  'each child in a list should have a unique "key" prop',
  'Each child in a list should have a unique "key" prop',
];

// Check if a message should be muted
const shouldMuteMessage = (message: string): boolean => {
  return MUTED_MESSAGES.some(muted => message.includes(muted));
};

// Queue for batching logs
let logQueue: { level: string; message: string; source: string; timestamp: string; platform: string }[] = [];
let flushTimeout: ReturnType<typeof setTimeout> | null = null;
const FLUSH_INTERVAL = 500; // Flush every 500ms

// Get a friendly platform name
const getPlatformName = (): string => {
  switch (Platform.OS) {
    case 'ios':
      return 'iOS';
    case 'android':
      return 'Android';
    case 'web':
      return 'Web';
    default:
      return Platform.OS;
  }
};

// Cache the log server URL
let cachedLogServerUrl: string | null = null;
let urlChecked = false;

// Get the log server URL based on platform
const getLogServerUrl = (): string | null => {
  if (urlChecked) return cachedLogServerUrl;

  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // For web, use the current origin
      cachedLogServerUrl = `${window.location.origin}/natively-logs`;
    } else {
      // For native, try to get the Expo dev server URL
      // experienceUrl format: exp://xxx.ngrok.io/... or exp://192.168.1.1:8081/...
      const experienceUrl = (Constants as any).experienceUrl;
      if (experienceUrl) {
        // Convert exp:// to https:// (for tunnels) or http:// (for local)
        let baseUrl = experienceUrl
          .replace('exp://', 'https://')
          .split('/')[0] + '//' + experienceUrl.replace('exp://', '').split('/')[0];

        // If it looks like a local IP, use http
        if (baseUrl.includes('192.168.') || baseUrl.includes('10.') || baseUrl.includes('localhost')) {
          baseUrl = baseUrl.replace('https://', 'http://');
        }

        cachedLogServerUrl = `${baseUrl}/natively-logs`;
      } else {
        // Fallback: try to use manifest hostUri
        const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.hostUri;
        if (hostUri) {
          const protocol = hostUri.includes('ngrok') || hostUri.includes('.io') ? 'https' : 'http';
          cachedLogServerUrl = `${protocol}://${hostUri.split('/')[0]}/natively-logs`;
        }
      }
    }
  } catch (e) {
    // Silently fail
  }

  urlChecked = true;
  return cachedLogServerUrl;
};

// Track if we've logged fetch errors to avoid spam
let fetchErrorLogged = false;

// Flush the log queue to server
const flushLogs = async () => {
  if (logQueue.length === 0) return;

  const logsToSend = [...logQueue];
  logQueue = [];
  flushTimeout = null;

  const url = getLogServerUrl();
  if (!url) {
    // URL not available, silently skip
    return;
  }

  for (const log of logsToSend) {
    try {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
      }).catch((e) => {
        // Log fetch errors only once to avoid spam
        if (!fetchErrorLogged) {
          fetchErrorLogged = true;
          // Use a different method to avoid recursion - write directly without going through our intercept
          if (typeof window !== 'undefined' && window.console) {
            (window.console as any).__proto__.log.call(console, '[Natively] Fetch error (will not repeat):', e.message || e);
          }
        }
      });
    } catch (e) {
      // Silently ignore sync errors
    }
  }
};

// Queue a log to be sent
const queueLog = (level: string, message: string, source: string = '') => {
  const logKey = `${level}:${message}`;

  // Skip duplicates
  if (recentLogs[logKey]) return;
  recentLogs[logKey] = true;
  clearLogAfterDelay(logKey);

  logQueue.push({
    level,
    message,
    source,
    timestamp: new Date().toISOString(),
    platform: getPlatformName(),
  });

  // Schedule flush if not already scheduled
  if (!flushTimeout) {
    flushTimeout = setTimeout(flushLogs, FLUSH_INTERVAL);
  }
};

// Function to send errors to parent window (React frontend) - for web iframe mode
const sendErrorToParent = (level: string, message: string, data: any) => {
  // Create a simple key to identify duplicate errors
  const errorKey = `${level}:${message}:${JSON.stringify(data)}`;

  // Skip if we've seen this exact error recently
  if (recentLogs[errorKey]) {
    return;
  }

  // Mark this error as seen and schedule cleanup
  recentLogs[errorKey] = true;
  clearLogAfterDelay(errorKey);

  try {
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'EXPO_ERROR',
        level: level,
        message: message,
        data: data,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        source: 'expo-template'
      }, '*');
    }
  } catch (error) {
    // Silently fail
  }
};

// Function to extract meaningful source location from stack trace
const extractSourceLocation = (stack: string): string => {
  if (!stack) return '';

  // Look for various patterns in the stack trace
  const patterns = [
    // Pattern for app files: app/filename.tsx:line:column
    /at .+\/(app\/[^:)]+):(\d+):(\d+)/,
    // Pattern for components: components/filename.tsx:line:column
    /at .+\/(components\/[^:)]+):(\d+):(\d+)/,
    // Pattern for any .tsx/.ts files
    /at .+\/([^/]+\.tsx?):(\d+):(\d+)/,
    // Pattern for bundle files with source maps
    /at .+\/([^/]+\.bundle[^:]*):(\d+):(\d+)/,
    // Pattern for any JavaScript file
    /at .+\/([^/\s:)]+\.[jt]sx?):(\d+):(\d+)/
  ];

  for (const pattern of patterns) {
    const match = stack.match(pattern);
    if (match) {
      return `${match[1]}:${match[2]}:${match[3]}`;
    }
  }

  // If no specific pattern matches, try to find any file reference
  const fileMatch = stack.match(/at .+\/([^/\s:)]+\.[jt]sx?):(\d+)/);
  if (fileMatch) {
    return `${fileMatch[1]}:${fileMatch[2]}`;
  }

  return '';
};

// Function to get caller information from stack trace
const getCallerInfo = (): string => {
  const stack = new Error().stack || '';
  const lines = stack.split('\n');

  // Skip the first few lines (Error, getCallerInfo, stringifyArgs, console override, setupErrorLogging internals)
  for (let i = 3; i < lines.length; i++) {
    const line = lines[i];

    // Skip internal errorLogger calls and node_modules
    if (line.includes('errorLogger') || line.includes('node_modules')) {
      continue;
    }

    // Try multiple patterns to extract source location
    // Pattern 1: Standard format "at Component (file.tsx:10:5)"
    let match = line.match(/at\s+\S+\s+\((?:.*\/)?([^/\s:)]+\.[jt]sx?):(\d+):(\d+)\)/);
    if (match) {
      return `${match[1]}:${match[2]}`;
    }

    // Pattern 2: Anonymous function "at file.tsx:10:5"
    match = line.match(/at\s+(?:.*\/)?([^/\s:)]+\.[jt]sx?):(\d+):(\d+)/);
    if (match) {
      return `${match[1]}:${match[2]}`;
    }

    // Pattern 3: Hermes/React Native bundle format
    match = line.match(/(?:.*\/)?([^/\s:)]+\.[jt]sx?):(\d+):\d+/);
    if (match) {
      return `${match[1]}:${match[2]}`;
    }

    // Pattern 4: Look for app/ or components/ paths specifically
    if (line.includes('app/') || line.includes('components/') || line.includes('screens/') || line.includes('hooks/') || line.includes('utils/')) {
      match = line.match(/([^/\s:)]+\.[jt]sx?):(\d+)/);
      if (match) {
        return `${match[1]}:${match[2]}`;
      }
    }
  }

  return '';
};

// Helper to safely stringify arguments
const stringifyArgs = (args: any[]): string => {
  return args.map(arg => {
    if (typeof arg === 'string') return arg;
    if (arg === null) return 'null';
    if (arg === undefined) return 'undefined';
    try {
      return JSON.stringify(arg);
    } catch {
      return String(arg);
    }
  }).join(' ');
};

export const setupErrorLogging = () => {
  // Don't initialize in production builds - no need for log forwarding
  if (!__DEV__) {
    return;
  }

  // Store original console methods BEFORE any modifications
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;

  // Log initialization info using original console (not intercepted)
  const logServerUrl = getLogServerUrl();
  originalConsoleLog('[Natively] Setting up error logging...');
  originalConsoleLog('[Natively] Log server URL:', logServerUrl || 'NOT AVAILABLE');
  originalConsoleLog('[Natively] Platform:', Platform.OS);

  // Override console.log to capture and send to server
  console.log = (...args: any[]) => {
    // Always call original first
    originalConsoleLog.apply(console, args);

    // Queue log for sending to server
    const message = stringifyArgs(args);
    const source = getCallerInfo();
    queueLog('log', message, source);
  };

  // Override console.warn to capture and send to server
  console.warn = (...args: any[]) => {
    // Always call original first
    originalConsoleWarn.apply(console, args);

    // Queue log for sending to server (skip muted messages)
    const message = stringifyArgs(args);
    if (shouldMuteMessage(message)) return;

    const source = getCallerInfo();
    queueLog('warn', message, source);
  };

  // Override console.error to capture and send to server
  console.error = (...args: any[]) => {
    // Queue log for sending to server (skip muted messages)
    const message = stringifyArgs(args);
    if (shouldMuteMessage(message)) return;

    // Always call original first
    originalConsoleError.apply(console, args);

    const source = getCallerInfo();
    queueLog('error', message, source);

    // Also send to parent window for web iframe mode
    sendErrorToParent('error', 'Console Error', message);
  };

  // Capture unhandled errors in web environment
  if (typeof window !== 'undefined') {
    // Override window.onerror to catch JavaScript errors
    window.onerror = (message, source, lineno, colno, error) => {
      const sourceFile = source ? source.split('/').pop() : 'unknown';
      const errorMessage = `RUNTIME ERROR: ${message} at ${sourceFile}:${lineno}:${colno}`;

      queueLog('error', errorMessage, `${sourceFile}:${lineno}:${colno}`);
      sendErrorToParent('error', 'JavaScript Runtime Error', {
        message,
        source: `${sourceFile}:${lineno}:${colno}`,
        error: error?.stack || error,
      });

      return false; // Don't prevent default error handling
    };

    // Capture unhandled promise rejections (web only)
    if (Platform.OS === 'web') {
      window.addEventListener('unhandledrejection', (event) => {
        const message = `UNHANDLED PROMISE REJECTION: ${event.reason}`;
        queueLog('error', message, '');
        sendErrorToParent('error', 'Unhandled Promise Rejection', { reason: event.reason });
      });
    }
  }
};

type Language = 'bs' | 'en';

type RawRecord = Record<string, any>;

function normalizePriceLevel(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(1, Math.min(4, value));
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) {
      return Math.max(1, Math.min(4, parsed));
    }
  }

  return 1;
}

function toInstagramUrl(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const handle = trimmed.replace(/^@/, '');
  return `https://instagram.com/${handle}`;
}

function pickLocalizedValue(
  record: RawRecord,
  language: Language,
  baseField: string
): string | null {
  const localized =
    language === 'bs'
      ? record[`${baseField}_bs`] ?? record[`${baseField}_en`]
      : record[`${baseField}_en`] ?? record[`${baseField}_bs`];

  if (typeof localized === 'string' && localized.trim()) {
    return localized;
  }

  const fallback = record[baseField];
  return typeof fallback === 'string' && fallback.trim() ? fallback : null;
}

function formatTimeRange(start: unknown, end: unknown): string {
  if (typeof start === 'string' && typeof end === 'string' && start && end) {
    return `${start} - ${end}`;
  }

  if (typeof start === 'string' && start) {
    return start;
  }

  if (typeof end === 'string' && end) {
    return end;
  }

  return '';
}

export function normalizeVenue<T extends RawRecord>(venue: T, language: Language) {
  const priceLevel = normalizePriceLevel(venue.price_level ?? venue.price_range);
  const insiderTip = pickLocalizedValue(venue, language, 'insider_tip');
  const instagramUrl = toInstagramUrl(venue.instagram ?? venue.instagram_handle);

  return {
    ...venue,
    price_level: priceLevel,
    price_range: venue.price_range ?? priceLevel,
    insider_tip: insiderTip,
    insider_tip_bs: venue.insider_tip_bs ?? insiderTip,
    insider_tip_en: venue.insider_tip_en ?? insiderTip,
    instagram: instagramUrl,
    instagram_handle: venue.instagram_handle ?? venue.instagram ?? null,
  };
}

export function normalizeVenueRows<T extends RawRecord>(venues: T[] | null | undefined, language: Language) {
  return (venues ?? []).map((venue) => normalizeVenue(venue, language));
}

export function normalizeDailySpecial<T extends RawRecord>(special: T, language: Language) {
  const title = pickLocalizedValue(special, language, 'title') ?? special.menu_title ?? '';
  const description = pickLocalizedValue(special, language, 'description') ?? special.description ?? null;
  const price =
    typeof special.price === 'number'
      ? special.price
      : typeof special.price_bam === 'number'
        ? special.price_bam
        : 0;

  const validTimes = typeof special.valid_times === 'string' && special.valid_times
    ? special.valid_times
    : formatTimeRange(special.valid_time_start, special.valid_time_end);

  const venueName =
    special.venue_name ??
    special.venues?.name ??
    special.venue?.name ??
    '';

  return {
    ...special,
    menu_title: title,
    title_bs: special.title_bs ?? title,
    title_en: special.title_en ?? title,
    description,
    price,
    price_bam: special.price_bam ?? price,
    valid_times: validTimes,
    venue_name: venueName,
  };
}

export function normalizeDailySpecialRows<T extends RawRecord>(specials: T[] | null | undefined, language: Language) {
  return (specials ?? []).map((special) => normalizeDailySpecial(special, language));
}

// Auto-initialize logging when this module is imported
// Only run in development mode - production apps don't need log forwarding
if (__DEV__) {
  setupErrorLogging();
}
