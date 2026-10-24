import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const isAdmin = user.role === 'admin';

  return (
    <div className="shell">
      <header className="topbar">
        <strong>🏠 Room Manager</strong>
        <nav>
          <NavLink to="/my">My Expenses</NavLink>
          {isAdmin && (
            <>
              <NavLink end to="/admin">Overview</NavLink>
              <NavLink to="/admin/expenses">All Expenses</NavLink>
              <NavLink to="/admin/rent">Rent Split</NavLink>
              <NavLink to="/admin/members">Members</NavLink>
            </>
          )}
        </nav>
        <span className="who">
          <NavLink to="/profile">{user.name}</NavLink> <em>({user.role})</em>
          <button className="btn small ghost" onClick={() => { logout(); nav('/login'); }}>Logout</button>
        </span>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}
