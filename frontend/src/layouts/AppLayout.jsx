import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/products', label: 'Products' },
  { to: '/stock', label: 'Stock Movements' },
  { to: '/suppliers', label: 'Suppliers' },
  { to: '/purchase-orders', label: 'Purchase Orders' },
  { to: '/warehouses', label: 'Warehouses' },
  { to: '/reports', label: 'Reports' },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">Z</div>
          <div>
            <strong>Venky Warehouse</strong>
            <small>Quick commerce operations</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Warehouse operations</p>
            <h1>Venky Fulfillment Center</h1>
          </div>
          <div className="topbar-actions">
            <span className="status-pill">System online</span>
            <button className="secondary-button" type="button" onClick={handleLogout}>Log out</button>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}
