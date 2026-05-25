import { create } from 'zustand';
import api from '../lib/api';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'student' | 'admin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  profile: any | null;
  notifications: any[];
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  profile: null,
  notifications: [],
  isLoading: true,

  login: (userData, token) => {
    localStorage.setItem('token', token);
    set({ user: userData, token, isLoading: false });
    get().fetchProfile();
    get().fetchNotifications();
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout error', e);
    }
    localStorage.removeItem('token');
    set({ user: null, token: null, profile: null, notifications: [] });
  },

  fetchProfile: async () => {
    try {
      const res = await api.get('/profiles');
      if (res.data.success) {
        set({ profile: res.data.profile });
      }
    } catch (e) {
      console.error('Fetch profile error', e);
    }
  },

  fetchNotifications: async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        set({ notifications: res.data.notifications });
      }
    } catch (e) {
      console.error('Fetch notifications error', e);
    }
  },

  initialize: async () => {
    set({ isLoading: true });
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          // Token exists, verify it by loading profile
          const res = await api.get('/profiles');
          if (res.data.success) {
            const userObj = res.data.profile.user;
            set({
              token: savedToken,
              profile: res.data.profile,
              user: {
                id: userObj._id,
                username: userObj.username,
                email: userObj.email,
                role: userObj.role,
              },
            });
            await get().fetchNotifications();
          }
        } catch (e) {
          console.error('Session restore failed. Clearing tokens.', e);
          localStorage.removeItem('token');
          set({ user: null, token: null, profile: null });
        }
      }
    }
    set({ isLoading: false });
  },
}));
