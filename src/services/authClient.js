// ==========================================
// TaskFlow Pro — Client Authentication Service
// ==========================================

const API_BASE = '/api/auth';

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  // Attach stored token in Authorization header as fallback if cookies are restricted
  try {
    const token = localStorage.getItem('taskflow_auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {}

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include' // Sends HTTP-only cookies
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = { success: false, error: response.status >= 500 ? 'Server error occurred. Please try again in a moment.' : 'Network error. Please check your connection.' };
  }

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const AuthClient = {
  // 1. Register new account
  async register({ name, email, password }) {
    const data = await request('/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    if (data.token) {
      try {
        localStorage.setItem('taskflow_auth_token', data.token);
      } catch {}
    }
    if (data.user) {
      try {
        localStorage.setItem('taskflow_auth_user', JSON.stringify(data.user));
      } catch {}
    }
    return data;
  },

  // 2. Login
  async login({ email, password }) {
    const data = await request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token) {
      try {
        localStorage.setItem('taskflow_auth_token', data.token);
      } catch {}
    }
    if (data.user) {
      try {
        localStorage.setItem('taskflow_auth_user', JSON.stringify(data.user));
      } catch {}
    }
    return data;
  },

  // 3. Logout
  async logout() {
    try {
      await request('/logout', { method: 'POST' });
    } catch {}
    try {
      localStorage.removeItem('taskflow_auth_token');
      localStorage.removeItem('taskflow_auth_user');
    } catch {}
    return { success: true };
  },

  // 4. Get Current User (/me)
  async getCurrentUser() {
    // 1. Instant fallback from localStorage
    let cachedUser = null;
    try {
      const saved = localStorage.getItem('taskflow_auth_user');
      if (saved) cachedUser = JSON.parse(saved);
    } catch {}

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const data = await request('/me', { method: 'GET', signal: controller.signal });
      clearTimeout(timeoutId);

      if (data?.user) {
        try {
          localStorage.setItem('taskflow_auth_user', JSON.stringify(data.user));
        } catch {}
        return data.user;
      }
      return cachedUser;
    } catch {
      return cachedUser;
    }
  },

  // 4.1 Update Profile
  async updateProfile({ name }) {
    const res = await request('/profile', {
      method: 'PUT',
      body: JSON.stringify({ name })
    });
    if (res?.user) {
      try {
        localStorage.setItem('taskflow_auth_user', JSON.stringify(res.user));
      } catch {}
    }
    return res;
  },

  // 5. Change Password
  async changePassword({ currentPassword, newPassword }) {
    return request('/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  // 6. Forgot Password
  async forgotPassword(email) {
    return request('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  // 7. Reset Password
  async resetPassword({ token, newPassword }) {
    return request('/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword })
    });
  }
};
