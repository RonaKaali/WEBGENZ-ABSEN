import { NavLink } from 'react-router-dom';
import { useAuth } from './AuthProvider';

const navItems = [
  { path: '/', label: 'Dasbor', icon: '📊' },
  { path: '/absensi', label: 'Absensi', icon: '📋' },
  { path: '/izin', label: 'Persetujuan Izin', icon: '📝' },
  { path: '/karyawan', label: 'Karyawan', icon: '👥' },
  { path: '/laporan', label: 'Laporan', icon: '📈' },
  { path: '/pengaturan', label: 'Pengaturan', icon: '⚙️' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        background: 'var(--color-sidebar)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{
          padding: '1.5rem 1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <img
            src="/LOGO.png"
            alt="WEBGENZ"
            style={{ height: 36, width: 'auto', borderRadius: 8 }}
          />
          <div>
            <h1 style={{
              color: 'white',
              fontSize: '1rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}>
              WEBGENZ
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '0.1rem' }}>Absensi Manager</p>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span style={{ fontSize: '1.125rem' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Profile */}
        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#14b8a6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}>
              {profile?.avatar_initials || 'A'}
            </div>
            <div>
              <p style={{ color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 600 }}>{profile?.nama || 'Admin'}</p>
              <p style={{ color: '#64748b', fontSize: '0.75rem' }}>{profile?.jabatan || 'Administrator'}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: 'rgba(239,68,68,0.1)',
              color: '#fca5a5',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
          >
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: '260px', padding: '2rem', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
