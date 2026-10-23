import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../api/axiosInstance';
import { getMyProfile } from '../../../api/usersApi';

export const useProfilePage = () => {
  const { user, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();

  // Sync full profile (including lat/lng) from server on mount
  useEffect(() => {
    if (!user) return;
    getMyProfile()
      .then((profile) => {
        updateUser({
          latitude: profile.latitude,
          longitude: profile.longitude,
          photoURL: profile.photoURL,
        });
      })
      .catch(() => {
        // silently ignore — user still sees cached data
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Не указано';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.slice(0, 2).toUpperCase();
  };

  return {
    user,
    userId: user?.id,
    handleLogout,
    formatDate,
    getInitials,
  };
};

export default useProfilePage;
