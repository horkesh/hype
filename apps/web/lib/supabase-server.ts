// Thin Next.js cookie adapter on top of @look/shared/createServerSupabase.
// Server components and route handlers import from here, never from
// @look/shared directly — that way the next/headers dependency stays out
// of the universal package.

import { cookies as nextCookies } from 'next/headers';
import { createServerSupabase } from '@look/shared';

export async function getServerSupabase() {
  const store = await nextCookies();
  return createServerSupabase({
    getAll: () => store.getAll().map(({ name, value }) => ({ name, value })),
    set: (name, value, options) => {
      try { store.set({ name, value, ...options }); } catch { /* RSC: no-op */ }
    },
  });
}
