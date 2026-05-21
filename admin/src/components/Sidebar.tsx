import { canAdmin, hasAccess, isSuperAdmin, ROLE_LABELS } from '../hooks/useAuth';
import type { UserRole } from '../hooks/useAuth';

export type Page = 'dashboard' | 'venues' | 'events' | 'audit' | 'users';

interface NavItem {
  id: Page;
  label: string;
  icon: string;
}

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  role: UserRole;
  email: string | undefined;
  onSignOut: () => void;
}

export function Sidebar({ activePage, onNavigate, role, email, onSignOut }: SidebarProps) {
  const items: NavItem[] = [
    { id: 'dashboard', label: 'Pregled', icon: '▦' },
    { id: 'venues', label: 'Lokacije', icon: '⊙' },
    ...(hasAccess(role) ? [{ id: 'events' as Page, label: 'Događaji', icon: '◈' }] : []),
    ...(canAdmin(role) ? [{ id: 'audit' as Page, label: 'Promjene', icon: '⌖' }] : []),
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
          >
            <span className="sidebar-icon">{item.icon}</span>
            {item.label}
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
