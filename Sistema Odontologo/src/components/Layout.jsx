import React, { useContext } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { LayoutDashboard, Users, Calendar, FileText, Sun, Moon, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/pacientes', name: 'Pacientes', icon: Users },
    { path: '/citas', name: 'Agenda', icon: Calendar },
    { path: '/facturas', name: 'Facturación', icon: FileText },
  ];

  return (
    <div style={{ width: 'var(--sidebar-width)', backgroundColor: 'var(--surface-color)', borderRight: '1px solid var(--border-color)', height: '100vh', position: 'fixed', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '24px', flexShrink: 0 }}>
        <h2 style={{ color: 'var(--primary-color)', fontSize: '24px', fontWeight: 'bold' }}>Surazo Dental</h2>
      </div>
      
      <nav style={{ flexGrow: 1, padding: '0 16px' }}>
        {menuItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({isActive}) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              marginBottom: '8px',
              color: isActive ? 'white' : 'var(--text-primary)',
              backgroundColor: isActive ? 'var(--primary-color)' : 'transparent',
              transition: 'all 0.2s ease',
              fontWeight: isActive ? '600' : '400'
            })}
          >
            <item.icon size={20} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '24px' }}>
        <button className="btn btn-danger" style={{ width: '100%' }}>
          <LogOut size={16} /> Salir
        </button>
      </div>
    </div>
  );
};

const Header = () => {
  const { isDark, setIsDark } = useContext(ThemeContext);

  return (
    <header style={{ height: '70px', backgroundColor: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
      <h3 style={{ color: 'var(--text-secondary)' }}>Consultorio Odontológico</h3>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button 
          onClick={() => setIsDark(!isDark)}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '50%' }}
        >
          {isDark ? <Sun size={24} /> : <Moon size={24} />}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            DR
          </div>
          <span style={{ fontWeight: '500' }}>Dr. Admin</span>
        </div>
      </div>
    </header>
  );
};

const Layout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <Sidebar />
      <div style={{ marginLeft: 'var(--sidebar-width)', width: `calc(100% - var(--sidebar-width))`, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main className="animate-fade-in" style={{ padding: '32px', flexGrow: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
