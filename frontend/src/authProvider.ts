import { AuthProvider } from 'react-admin';
import { API_URL } from './config';
import { detectBrand, buildBrandUrl, persistBrand, clearPersistedBrand } from './utils/brandUtils';
import { BrandKey } from './config/brands';

// JWT token'dan brand claim'i oku (decode without verification - backend verified)
const getBrandFromToken = (token: string): BrandKey | null => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    if (decoded.brand === 'ford' || decoded.brand === 'tofas') {
      return decoded.brand;
    }
    return null;
  } catch {
    return null;
  }
};

// URL'den brand'i al
const getBrandFromUrl = (): BrandKey => {
  const pathname = window.location.pathname;
  if (pathname.startsWith('/ford')) return 'ford';
  if (pathname.startsWith('/tofas')) return 'tofas';
  return 'tofas'; // default
};

// Storage key helpers - allows admin and dealer sessions to coexist
const getStoragePrefix = (): 'admin' | 'dealer' => {
  // Check URL to determine which portal we're in
  const path = window.location.pathname;
  
  // Dealer portal paths (supports /:brand/dealer and /dealer)
  // Use regex to match /dealer or /dealer/ but NOT /dealers
  if (/\/(ford|tofas)?\/dealer(\/|$)/.test(path) || /^\/dealer(\/|$)/.test(path)) {
    return 'dealer';
  }
  
  // All other paths are backoffice/admin
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
    
    // Login request'inde brand'i de gönder (backend DB seçimi için)
    const currentBrand = detectBrand();
    
    const request = new Request(endpoint, {
      method: 'POST',
      body: JSON.stringify({ username, password, brand: currentBrand }),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
    
    try {
      const response = await fetch(request);
      
      if (response.status < 200 || response.status >= 300) {
        // Try to get error message from response
        const errorData = await response.json().catch(() => ({}));
        
        // Handle different Django REST Framework error formats
        let errorMessage = 'Giriş başarısız';
        
        if (errorData.detail) {
          // detail can be string or array
          errorMessage = Array.isArray(errorData.detail) 
            ? errorData.detail[0] 
            : errorData.detail;
        } else if (errorData.non_field_errors) {
          errorMessage = Array.isArray(errorData.non_field_errors)
            ? errorData.non_field_errors[0]
            : errorData.non_field_errors;
        } else if (typeof errorData === 'object') {
          // Field-specific errors: {"username": ["Bu alan gereklidir."]}
          const firstKey = Object.keys(errorData)[0];
          if (firstKey && Array.isArray(errorData[firstKey])) {
            errorMessage = errorData[firstKey][0];
          }
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('[AUTH] login success, user data:', data.user);
      
      // Use login type specific storage keys
      const storageType = loginType || (data.user.role === 'bayi' ? 'dealer' : 'admin');
      const keys = getStorageKeys(storageType);
      
      localStorage.setItem(keys.token, data.access);
      localStorage.setItem(keys.refresh, data.refresh);
      localStorage.setItem(keys.user, JSON.stringify(data.user));
      
      // Token'dan brand'i al ve persist et
      const tokenBrand = getBrandFromToken(data.access);
      if (tokenBrand) {
        persistBrand(tokenBrand);
        console.log('[AUTH] persisted brand from token:', tokenBrand);
      }
      
      console.log('[AUTH] stored with prefix:', storageType);
      
      // Role-based redirect with brand-aware URL building
      const role = data.user.role;
      console.log('[AUTH] login returning redirect for role:', role);
      if (role === 'bayi') {
        return buildBrandUrl('/dealer');
      } else {
        // Admin, Moderator and Creative Agency go to backoffice
        return buildBrandUrl('/backoffice');
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
    const redirectPath = prefix === 'dealer' ? '/dealer-login' : '/backoffice-login';
    return Promise.resolve(buildBrandUrl(redirectPath));
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
      const redirectPath = prefix === 'dealer' ? '/dealer-login' : '/backoffice-login';
      return Promise.reject(buildBrandUrl(redirectPath));
    }
    return Promise.resolve();
  },

  checkAuth: () => {
    const keys = getStorageKeys();
    const token = localStorage.getItem(keys.token);
    console.log('[AUTH] checkAuth called, token exists:', !!token, 'keys:', keys);
    
    if (!token) {
      const prefix = getStoragePrefix();
      const redirectPath = prefix === 'dealer' ? '/dealer-login' : '/backoffice-login';
      return Promise.reject(buildBrandUrl(redirectPath));
    }
    
    // Token'daki brand ile URL'deki brand'i karşılaştır
    const tokenBrand = getBrandFromToken(token);
    const urlBrand = getBrandFromUrl();
    
    console.log('[AUTH] checkAuth - tokenBrand:', tokenBrand, 'urlBrand:', urlBrand);
    
    if (tokenBrand && tokenBrand !== urlBrand) {
      // Brand mismatch! Kullanıcı farklı brand'e geçmek istiyor
      console.warn('[AUTH] Brand mismatch! Token:', tokenBrand, 'URL:', urlBrand);
      
      // Mevcut session'ı temizle (farklı brand için yeniden login gerekli)
      localStorage.removeItem(keys.token);
      localStorage.removeItem(keys.refresh);
      localStorage.removeItem(keys.user);
      clearPersistedBrand();
      
      // Yeni brand'in login sayfasına yönlendir
      const prefix = getStoragePrefix();
      const loginPath = prefix === 'dealer' ? '/dealer-login' : '/backoffice-login';
      const newBrandLoginUrl = `/${urlBrand}${loginPath}`;
      
      console.log('[AUTH] Redirecting to new brand login:', newBrandLoginUrl);
      window.location.href = newBrandLoginUrl;
      return Promise.reject(); // Redirect olana kadar bekle
    }
    
    return Promise.resolve();
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
