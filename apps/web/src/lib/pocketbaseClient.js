// Real API client for authentication
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class AuthStore {
  constructor() {
    this.token = localStorage.getItem('auth_token');
    this.user = JSON.parse(localStorage.getItem('auth_user') || 'null');
    this.isValid = !!this.token && !!this.user;
  }
  
  save(token, user) {
    this.token = token;
    this.user = user;
    this.isValid = true;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  }
  
  clear() {
    this.token = null;
    this.user = null;
    this.isValid = false;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
  
  get model() {
    return this.user;
  }
}

const authStore = new AuthStore();

const apiClient = {
  authStore,
  
  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (authStore.token) {
      headers['Authorization'] = authStore.token;
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    
    return response.json();
  },
  
  async authWithPassword(email, password) {
    try {
      const result = await this.request('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      if (result.success) {
        authStore.save(result.data.token, result.data.user);
        return result.data.user;
      } else {
        throw new Error(result.error || 'Authentication failed');
      }
    } catch (error) {
      throw new Error(error.message || 'Authentication failed');
    }
  },
  
  async authRefresh() {
    try {
      const result = await this.request('/users/me');
      if (result.success) {
        authStore.save(authStore.token, result.data.user);
        return result.data.user;
      } else {
        throw new Error('Session expired');
      }
    } catch (error) {
      authStore.clear();
      throw new Error('Session expired');
    }
  },
  
  async logout() {
    try {
      await this.request('/users/logout', {
        method: 'POST',
      });
    } catch (error) {
      // Ignore logout errors
    } finally {
      authStore.clear();
    }
  },
  
  async getCurrentUser() {
    if (!authStore.isValid) {
      return null;
    }
    
    try {
      const result = await this.request('/users/me');
      if (result.success) {
        return result.data.user;
      }
    } catch (error) {
      // Ignore errors, user will need to login again
    }
    
    return null;
  },
  
  async getAllUsers() {
    const result = await this.request('/users');
    return result.success ? result.data : [];
  },
  
  async getDashboard() {
    const result = await this.request('/users/dashboard');
    return result.success ? result.data : null;
  },
  
  async getSessions() {
    const result = await this.request('/users/sessions');
    return result.success ? result.data : [];
  },
  
  async getLoginHistory() {
    const result = await this.request('/users/login-history');
    return result.success ? result.data : [];
  },
  
  // For backward compatibility
  collection(collectionName) {
    return {
      getList: () => ({ items: [] }),
      getOne: () => ({}),
      create: () => ({}),
      update: () => ({}),
    };
  },
};

export default apiClient;