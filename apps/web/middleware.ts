// Edge middleware. Two jobs:
//   1) Refresh Supabase auth tokens (server components can't write cookies,
//      so token refresh has to happen here per @supabase/ssr's pattern).
//   2) Honor production noindex on preview deployments.
//
// Keep this file lean — runs on every request.

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key) {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll().map(({ name, value }) => ({ name, value })),
        setAll: (items) => {
          response = NextResponse.next({ request });
          for (const { name, value, options } of items) {
            response.cookies.set({ name, value, ...options });
          }
        },
      },
    });
    // Touch the session so an expiring access token gets refreshed and the
    // new cookie is written back on the response.
    await supabase.auth.getUser();
  }

  // Preview/branch deployments should never get indexed by Google. Vercel
  // exposes VERCEL_ENV=preview on non-production deploys.
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') {
    response.headers.set('x-robots-tag', 'noindex, nofollow');
  }

  // Optional language hint: if the user lands on / with an English Accept-
  // Language and no explicit lang cookie, set a one-shot header so the
  // client can offer a /en switcher. We don't 302 — Google + Sarajevo
  // diaspora both expect the canonical BS URL to load directly.
  const acceptLang = request.headers.get('accept-language') ?? '';
  if (acceptLang.startsWith('en') && !request.cookies.get('look_lang')) {
    response.headers.set('x-suggest-lang', 'en');
  }

  return response;
}

export const config = {
  // Skip static assets + Next internals — only run on user-facing requests.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|tamagui.css|.*\\.(?:png|jpg|jpeg|gif|svg|webp)).*)'],
};
