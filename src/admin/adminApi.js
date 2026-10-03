// Admin API Client & Session Manager

const TOKEN_KEY = 'portfolio_admin_token';
const ADMIN_USER_KEY = 'portfolio_admin_user';
const LAST_ACTIVITY_KEY = 'portfolio_admin_last_activity';

// Clean up any legacy localStorage tokens
try {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
  localStorage.removeItem(LAST_ACTIVITY_KEY);
} catch {}

export const adminAuth = {
  getToken() {
    try {
      return sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  getUser() {
    try {
      const u = sessionStorage.getItem(ADMIN_USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  setSession(token, user) {
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
      sessionStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    } catch {}
  },
  clearSession() {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(ADMIN_USER_KEY);
      sessionStorage.removeItem(LAST_ACTIVITY_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);
      localStorage.removeItem(LAST_ACTIVITY_KEY);
    } catch {}
  },
  recordActivity() {
    try {
      sessionStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    } catch {}
  },
  getLastActivity() {
    try {
      return parseInt(sessionStorage.getItem(LAST_ACTIVITY_KEY) || '0', 10);
    } catch {
      return 0;
    }
  },
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    const last = this.getLastActivity();
    // Default 30 min inactivity limit
    const thirtyMinutes = 30 * 60 * 1000;
    if (last && Date.now() - last > thirtyMinutes) {
      this.clearSession();
      return false;
    }
    return true;
  }
};

// Generic fetch with auth header
async function authFetch(url, options = {}) {
  const token = adminAuth.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  adminAuth.recordActivity();

  const res = await fetch(url, {
    ...options,
    headers
  });

  if (res.status === 401) {
    adminAuth.clearSession();
    window.dispatchEvent(new CustomEvent('admin-session-expired'));
    throw new Error('Session expired or unauthorized');
  }

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || `Request failed with status ${res.status}`);
  }
  return json;
}

export function notifyPortfolioUpdated() {
  window.dispatchEvent(new CustomEvent('portfolio-data-updated'));
}

export const adminApi = {
  // Authentication
  async login(username, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Login failed');
    }
    adminAuth.setSession(json.token, json.admin);
    return json;
  },

  async logout() {
    try {
      await authFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      adminAuth.clearSession();
    }
  },

  async getMe() {
    return authFetch('/api/auth/me');
  },

  async changePassword(currentPassword, newPassword) {
    return authFetch('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  // Overview
  async getOverview() {
    return authFetch('/api/admin/overview');
  },

  // Profile
  async getProfile() {
    return authFetch('/api/admin/profile');
  },

  async updateProfile(profileData) {
    const res = await authFetch('/api/admin/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    notifyPortfolioUpdated();
    return res;
  },

  // Website Settings
  async getSettings() {
    return authFetch('/api/admin/settings');
  },

  async updateSettings(settingsData) {
    const res = await authFetch('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData)
    });
    notifyPortfolioUpdated();
    return res;
  },

  // Entities CRUD: projects, achievements, positions, education, certifications, skills, gallery, blog_posts
  async getList(entity) {
    return authFetch(`/api/admin/${entity}`);
  },

  async getItem(entity, id) {
    return authFetch(`/api/admin/${entity}/${id}`);
  },

  async createItem(entity, data) {
    const res = await authFetch(`/api/admin/${entity}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    notifyPortfolioUpdated();
    return res;
  },

  async updateItem(entity, id, data) {
    const res = await authFetch(`/api/admin/${entity}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    notifyPortfolioUpdated();
    return res;
  },

  async deleteItem(entity, id) {
    const res = await authFetch(`/api/admin/${entity}/${id}`, {
      method: 'DELETE'
    });
    notifyPortfolioUpdated();
    return res;
  },

  async reorderItems(entity, orderedIds) {
    const res = await authFetch(`/api/admin/${entity}/reorder`, {
      method: 'POST',
      body: JSON.stringify({ orderedIds })
    });
    notifyPortfolioUpdated();
    return res;
  },

  async toggleField(entity, id, field) {
    const res = await authFetch(`/api/admin/${entity}/${id}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ field })
    });
    notifyPortfolioUpdated();
    return res;
  },

  // Media Management
  async getMedia() {
    return authFetch('/api/media');
  },

  async deleteMedia(id) {
    return authFetch(`/api/media/${id}`, { method: 'DELETE' });
  },

  async uploadFile(file, tags = ['upload']) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await authFetch('/api/upload', {
            method: 'POST',
            body: JSON.stringify({
              fileName: file.name,
              fileType: file.type,
              fileData: reader.result,
              tags
            })
          });
          resolve(res);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }
};
