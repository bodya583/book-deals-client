import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/axiosInstance';
import { BookOpenIcon, UserIcon, LogOutIcon, GlobeIcon, TradeIcon } from './icons';
import { Avatar } from './ui';
import { getTradeCounts } from '../api/tradesApi';
import type { TradeCounts } from '../types/trade';
import { queryClient } from '../utils/queryClient';
import { APP_CONFIG } from '../config/app';
import { useTranslation } from '../i18n';
import { LanguageSwitcher } from './LanguageSwitcher/LanguageSwitcher';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [incomingCount, setIncomingCount] = React.useState<number>(0);

  React.useEffect(() => {
    if (!user) return;
    let active = true;

    const loadCounts = () => {
      queryClient
        .fetch<TradeCounts>('trades:counts', (signal) => getTradeCounts({ signal }), undefined, 15_000)
        .then((data) => {
          if (active) setIncomingCount(data.incoming || 0);
        })
        .catch(() => {
        });
    };

    loadCounts();

    const unsubscribe = queryClient.subscribe((event) => {
      if (event.type === 'set' && event.key === 'trades:counts') {
        const data = event.data as TradeCounts;
        if (active) setIncomingCount(data.incoming || 0);
      } else if (
        event.type === 'invalidate' &&
        (event.key === '*' || event.key === 'trades' || event.key === 'trades:counts')
      ) {
        loadCounts();
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [user, location.pathname]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
    } finally {
      logout();
      navigate('/login');
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/catalog" className="navbar-brand">
          <div className="navbar-brand-icon">
            <BookOpenIcon size={22} />
          </div>
          <span className="navbar-brand-text">{APP_CONFIG.name}</span>
        </Link>

        <nav className="navbar-nav">
          <Link
            to="/catalog"
            className={`navbar-link ${location.pathname === '/catalog' || location.pathname === '/all-books' ? 'active' : ''}`}
          >
            <GlobeIcon size={18} />
            <span>{t('nav.catalog')}</span>
          </Link>

          <Link
            to="/trades"
            className={`navbar-link ${location.pathname.startsWith('/trades') ? 'active' : ''}`}
          >
            <TradeIcon size={18} />
            <span>{t('nav.trades')}</span>
            {incomingCount > 0 && (
              <span className="navbar-badge" title={t('nav.incomingOffersTitle', { count: incomingCount })}>
                {incomingCount}
              </span>
            )}
          </Link>
          <Link
            to="/profile"
            className={`navbar-link ${location.pathname === '/profile' ? 'active' : ''}`}
          >
            <UserIcon size={18} />
            <span>{t('nav.profile')}</span>
          </Link>
        </nav>

        <div className="navbar-actions">
          <LanguageSwitcher />

          <div className="navbar-user-chip" onClick={() => navigate('/profile')} title={t('nav.goToProfile')}>
            <Avatar photoURL={user?.photoURL} username={user?.username} size={32} />
            <span className="navbar-username">{user?.username || t('common.user')}</span>
          </div>

          <button
            id="logout-btn"
            type="button"
            className="navbar-btn-logout"
            onClick={handleLogout}
            title={t('nav.logout')}
          >
            <LogOutIcon size={18} />
            <span className="logout-text">{t('nav.logout')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
