import { NavLink, Outlet } from 'react-router-dom';

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
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">SI</div>
          <div>
            <strong>Smart Inventory</strong>
            <small>Warehouse Suite</small>
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
            <p className="eyebrow">Operations overview</p>
            <h1>Warehouse Control Center</h1>
          </div>
          <div className="topbar-actions">
            <span className="status-pill">System online</span>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}
