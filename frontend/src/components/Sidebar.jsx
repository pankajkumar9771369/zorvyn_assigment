import { NavLink } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { LayoutDashboard, Receipt, LogOut, ShieldAlert } from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const initials = user?.name?.slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <span>◆</span> Zorvyn
      </div>

      <nav className="nav-links">
        {(user.role === 'Admin' || user.role === 'Analyst') && (
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
        )}
        <NavLink to="/records" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <Receipt size={18} /> Records
        </NavLink>
        {user.role === 'Admin' && (
          <NavLink to="/users" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <ShieldAlert size={18} /> Users
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar">{initials}</div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={logout}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
}
