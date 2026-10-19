import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BooksPage from './pages/BooksPage';
import ProfilePage from './pages/ProfilePage';
import PrivateRoute from './components/PrivateRoute';
import AppLayout from './layouts/AppLayout';
import { useAuthStore } from './store/authStore';

function App() {
  const [checking, setChecking] = useState(true);
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    axios
      .post('http://localhost:5000/api/auth/refresh', {}, { withCredentials: true })
      .then(({ data }) => {
        setAuth(data.user, data.accessToken);
      })
      .catch(() => {
        // No valid cookie — stay unauthenticated
      })
      .finally(() => {
        setChecking(false);
      });
  }, [setAuth]);

  if (checking) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f5f0',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: '3px solid #e0e0db',
            borderTopColor: '#2d6a4f',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected user routes with AppLayout */}
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<BooksPage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;