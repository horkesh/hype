import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    'Missing Supabase config. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
  );
}

// In-memory mutex with timeout — replaces Web Locks API which causes
// orphaned-lock AbortErrors. Serializes auth operations (token refresh)
// so concurrent queries don't race and invalidate each other's tokens.
const locks = new Map<string, Promise<void>>();

export const supabase = createClient(url, key, {
  auth: {
    lock: async <R>(name: string, acquireTimeout: number, fn: () => Promise<R>): Promise<R> => {
      const prev = locks.get(name) ?? Promise.resolve();
      let release: () => void;
      const current = new Promise<void>((r) => { release = r; });
      locks.set(name, current);

      // Wait for previous holder, but give up after timeout
      const timeout = Math.max(acquireTimeout, 5000);
      try {
        await Promise.race([
          prev,
          new Promise<void>((_, reject) =>
            setTimeout(() => reject(new Error('lock timeout')), timeout)
          ),
        ]);
      } catch {
        // Previous lock timed out — proceed anyway (equivalent to Web Locks "steal")
      }

      try {
        return await fn();
      } finally {
        release!();
        if (locks.get(name) === current) locks.delete(name);
      }
    },
  },
});
