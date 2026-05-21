import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { canAdmin, hasAccess, isSuperAdmin, ROLE_LABELS } from '../hooks/useAuth';
import type { UserRole } from '../hooks/useAuth';

export type Page = 'dashboard' | 'venues' | 'events' | 'series' | 'notes' | 'review' | 'audit' | 'stats' | 'users';

interface NavItem {
  id: Page;
  label: string;
  icon: string;
  badge?: number;
}

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  role: UserRole;
  email: string | undefined;
  currentUserId: string | null;
  onSignOut: () => void;
}

export function Sidebar({ activePage, onNavigate, role, email, currentUserId, onSignOut }: SidebarProps) {
  const [reviewCount, setReviewCount] = useState(0);
  const [revertedCount, setRevertedCount] = useState(0);

  // Polled counters for "Za reviziju" (admin+) and "Promjene" (everyone).
  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      if (canAdmin(role)) {
        const venues = await supabase
          .from('venues')
          .select('*', { count: 'exact', head: true })
          .eq('needs_review', true);
        const events = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('needs_review', true);
        if (!cancelled) setReviewCount((venues.count ?? 0) + (events.count ?? 0));
      }
      // Reverted-in-last-24h badge: show when any of THIS user's changes were
      // reverted by someone else. Editor sees own work being undone, admin
      // sees admin's own changes being undone (super_admin never appears in
      // audit_log so this is always 0 for haris).
      if (currentUserId) {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count } = await supabase
          .from('audit_log')
          .select('*', { count: 'exact', head: true })
          .eq('actor_id', currentUserId)
          .not('reverted_at', 'is', null)
          .gte('reverted_at', since);
        if (!cancelled) setRevertedCount(count ?? 0);
      }
    }
    refresh();
    const interval = setInterval(refresh, 60_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [role, currentUserId]);

  const items: NavItem[] = [
    { id: 'dashboard', label: 'Pregled', icon: '▦' },
    { id: 'venues', label: 'Lokacije', icon: '⊙' },
    ...(hasAccess(role) ? [{ id: 'events' as Page, label: 'Događaji', icon: '◈' }] : []),
    ...(hasAccess(role) ? [{ id: 'series' as Page, label: 'Serije', icon: '◇' }] : []),
    ...(hasAccess(role) ? [{ id: 'notes' as Page, label: 'Bilješke', icon: '✎' }] : []),
    ...(canAdmin(role) ? [{ id: 'review' as Page, label: 'Za reviziju', icon: '⚠', badge: reviewCount }] : []),
    ...(canAdmin(role) ? [{ id: 'audit' as Page, label: 'Promjene', icon: '⌖', badge: revertedCount }] : []),
    ...(isSuperAdmin(role) ? [{ id: 'stats' as Page, label: 'Statistike', icon: '▤' }] : []),
    ...(isSuperAdmin(role) ? [{ id: 'users' as Page, label: 'Korisnici', icon: '◎' }] : []),
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="sidebar-logo-mark">L</span>
        <div>
          <div className="sidebar-logo-name">Look</div>
          <div className="sidebar-logo-sub">Admin Panel</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map(item => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            style={{ position: 'relative' }}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {item.label}
            {item.badge !== undefined && item.badge > 0 && (
              <span
                style={{
                  marginLeft: 'auto',
                  background: item.id === 'review' ? '#F59E0B' : '#EF4444',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  borderRadius: 10,
                  padding: '1px 7px',
                  minWidth: 20,
                  textAlign: 'center',
                }}
              >
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-email">{email ?? '—'}</div>
          <div className="sidebar-user-role">{ROLE_LABELS[role]}</div>
        </div>
        <button className="sidebar-signout" onClick={onSignOut}>Odjava</button>
      </div>
    </aside>
  );
}
