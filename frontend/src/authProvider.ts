import { AuthProvider } from 'react-admin';
import { API_URL } from './config';

// Storage key helpers - allows admin and dealer sessions to coexist
const getStoragePrefix = (): 'admin' | 'dealer' => {
  // Check URL to determine which portal we're in
  const path = window.location.pathname;
  
  // Dealer portal paths
  if (path.startsWith('/dealer')) {
    return 'dealer';
  }
  
  // All other paths are backoffice/admin (including /backoffice, /dealers, /users, etc.)
  return 'admin';
};

// Get storage keys based on login type or current portal
const getStorageKeys = (loginType?: string) => {
  const prefix = loginType || getStoragePrefix();
  return {
    token: `${prefix}_auth_token`,
    refresh: `${prefix}_refresh_token`,
    user: `${prefix}_user`,
  };
};

// Helper to get current token (exported for dataProvider)
export const getCurrentToken = (): string | null => {
  const keys = getStorageKeys();
  return localStorage.getItem(keys.token);
};

// Helper to get current user
export const getCurrentUser = (): any | null => {
  const keys = getStorageKeys();
  const user = localStorage.getItem(keys.user);
  return user ? JSON.parse(user) : null;
};

export const authProvider: AuthProvider = {
  login: async ({ username, password, loginType }) => {
    console.log('[AUTH] login called with:', username, 'type:', loginType);
    
    // Determine endpoint based on login type
    let endpoint = `${API_URL}/auth/token/`;
    if (loginType === 'admin') {
      endpoint = `${API_URL}/auth/admin/token/`;
    } else if (loginType === 'dealer') {
      endpoint = `${API_URL}/auth/dealer/token/`;
    }
    
    const request = new Request(endpoint, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
    
    try {
      const response = await fetch(request);
      
      if (response.status < 200 || response.status >= 300) {
        // Try to get error message from response
        try {
          const errorData = await response.json();
          const errorMessage = errorData.detail || errorData.non_field_errors?.[0] || 'Email veya şifre hatalı';
          throw new Error(errorMessage);
        } catch (parseError) {
          throw new Error('Email veya şifre hatalı');
        }
      }
      
      const data = await response.json();
      console.log('[AUTH] login success, user data:', data.user);
      
      // Use login type specific storage keys
      const storageType = loginType || (data.user.role === 'bayi' ? 'dealer' : 'admin');
      const keys = getStorageKeys(storageType);
      
      localStorage.setItem(keys.token, data.access);
      localStorage.setItem(keys.refresh, data.refresh);
      localStorage.setItem(keys.user, JSON.stringify(data.user));
      
      console.log('[AUTH] stored with prefix:', storageType);
      
      // Role-based redirect
      const role = data.user.role;
      console.log('[AUTH] login returning redirect for role:', role);
      if (role === 'bayi') {
        return '/dealer';
      } else {
        // Admin, Moderator and Creative Agency go to backoffice
        return '/backoffice';
      }
    } catch (err: any) {
      console.log('[AUTH] login error:', err);
      throw new Error(err.message || 'Email veya şifre hatalı');
    }
  },

  logout: () => {
    const keys = getStorageKeys();
    console.log('[AUTH] logout called, clearing:', keys);
    localStorage.removeItem(keys.token);
    localStorage.removeItem(keys.refresh);
    localStorage.removeItem(keys.user);
    
    // Determine redirect based on which portal we're logging out from
    const prefix = getStoragePrefix();
    return Promise.resolve(prefix === 'dealer' ? '/dealer-login' : '/backoffice-login');
  },

  checkError: (error) => {
    console.log('[AUTH] checkError called with:', error);
    const status = error.status;
    if (status === 401 || status === 403) {
      const keys = getStorageKeys();
      console.log('[AUTH] checkError - unauthorized, clearing storage');
      localStorage.removeItem(keys.token);
      localStorage.removeItem(keys.refresh);
      localStorage.removeItem(keys.user);
      
      const prefix = getStoragePrefix();
      return Promise.reject(prefix === 'dealer' ? '/dealer-login' : '/backoffice-login');
    }
    return Promise.resolve();
  },

  checkAuth: () => {
    const keys = getStorageKeys();
    const token = localStorage.getItem(keys.token);
    console.log('[AUTH] checkAuth called, token exists:', !!token, 'keys:', keys);
    
    if (token) {
      return Promise.resolve();
    }
    
    const prefix = getStoragePrefix();
    return Promise.reject(prefix === 'dealer' ? '/dealer-login' : '/backoffice-login');
  },

  getPermissions: () => {
    const keys = getStorageKeys();
    const user = localStorage.getItem(keys.user);
    console.log('[AUTH] getPermissions called, user exists:', !!user);
    if (user) {
      try {
        const role = JSON.parse(user).role;
        console.log('[AUTH] getPermissions returning role:', role);
        return Promise.resolve(role);
      } catch (e) {
        console.log('[AUTH] getPermissions parse error:', e);
        return Promise.resolve(null);
      }
    }
    console.log('[AUTH] getPermissions returning null (no user)');
    return Promise.resolve(null);
  },

  getIdentity: () => {
    try {
      const keys = getStorageKeys();
      const user = localStorage.getItem(keys.user);
      if (!user) {
        return Promise.reject();
      }
      
      const userData = JSON.parse(user);
      return Promise.resolve({
        id: userData.id,
        fullName: `${userData.first_name} ${userData.last_name}`.trim() || userData.username,
        avatar: undefined,
        dealer_id: userData.dealer?.id,
        role: userData.role,
      });
    } catch (error) {
      return Promise.reject(error);
    }
  },
};

