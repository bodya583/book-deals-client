import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../api/axiosInstance';
import { useAuthStore } from '../store/authStore';
import { BookOpenIcon } from '../components/icons';
import { APP_CONFIG } from '../config/app';
import { useTranslation } from '../i18n';
import './auth.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { t, tApiError } = useTranslation();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { username, email, password });
      setAuth(data.user, data.accessToken);
      navigate('/');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(tApiError(err.response?.data?.message || t('auth.registerError')));
      } else {
        setError(t('auth.registerError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <BookOpenIcon size={32} />
          <div className="auth-brand-badge">{APP_CONFIG.name}</div>
        </div>
        <h1 className="auth-title">{t('auth.createAccount')}</h1>
        <p className="auth-subtitle">{t('auth.joinSubtitle')}</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>{t('auth.username')}</label>
            <input type="text" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={30} required />
          </div>
          <div className="auth-field">
            <label>{t('auth.email')}</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="auth-field">
            <label>{t('auth.password')}</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : t('auth.signUpBtn')}
          </button>
        </form>
        <p className="auth-link">
          {t('auth.haveAccount')} <Link to="/login">{t('auth.signInBtn')}</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;