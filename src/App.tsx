import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PrivateRoute from './components/PrivateRoute';
import { useAuthStore } from './store/authStore';

const HomePage = () => (
  <div style={{ color: "#1a1a1a", padding: "2rem", fontFamily: "Inter, sans-serif" }}>
    <h1>Home page</h1>
    <p>You are authenticated!</p>
  </div>
);

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
  }, []);

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f0' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #e0e0db', borderTopColor: '#2d6a4f', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<HomePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;