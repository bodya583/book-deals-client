import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/axiosInstance';
import { BookOpenIcon, UserIcon, LogOutIcon, GlobeIcon, TradeIcon } from './icons';
import { getTradeCounts } from '../api/tradesApi';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [incomingCount, setIncomingCount] = React.useState<number>(0);

  React.useEffect(() => {
    if (!user) return;
    getTradeCounts()
      .then((data) => {
        setIncomingCount(data.incoming || 0);
      })
      .catch(() => {
        // ignore
      });
  }, [user, location.pathname]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      logout();
      navigate('/login');
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <Link to="/catalog" className="navbar-brand">
          <div className="navbar-brand-icon">
            <BookOpenIcon size={22} />
          </div>
          <span className="navbar-brand-text">BookShelf</span>
        </Link>

        {/* Navigation items */}
        <nav className="navbar-nav">
          <Link
            to="/catalog"
            className={`navbar-link ${location.pathname === '/catalog' || location.pathname === '/all-books' ? 'active' : ''}`}
          >
            <GlobeIcon size={18} />
            <span>Все книги</span>
          </Link>

          <Link
            to="/trades"
            className={`navbar-link ${location.pathname.startsWith('/trades') ? 'active' : ''}`}
          >
            <TradeIcon size={18} />
            <span>Трейды</span>
            {incomingCount > 0 && (
              <span className="navbar-badge" title={`${incomingCount} входящих предложений`}>
                {incomingCount}
              </span>
            )}
          </Link>
          <Link
            to="/profile"
            className={`navbar-link ${location.pathname === '/profile' ? 'active' : ''}`}
          >
            <UserIcon size={18} />
            <span>Профиль</span>
          </Link>
        </nav>

        {/* Actions & User menu */}
        <div className="navbar-actions">
          <div className="navbar-user-chip" onClick={() => navigate('/profile')} title="Перейти в профиль">
            <div className="navbar-avatar">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.username} onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
              ) : null}
              <span className="navbar-avatar-initials">{getInitials(user?.username)}</span>
            </div>
            <span className="navbar-username">{user?.username || 'Пользователь'}</span>
          </div>

          <button
            id="logout-btn"
            type="button"
            className="navbar-btn-logout"
            onClick={handleLogout}
            title="Выйти из системы"
          >
            <LogOutIcon size={18} />
            <span className="logout-text">Выйти</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
