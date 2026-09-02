import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const USERS_KEY = 'threattrace_registered_users_v1';
const SESSION_KEY = 'threattrace_auth_session_v1';

const defaultUsers = [];

function getStoredUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load registered users:', e);
  }
  return [];
}

function saveStoredUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save registered users:', e);
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = !!user;

  const login = useCallback((email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = getStoredUsers();
        const trimmedEmail = email.trim().toLowerCase();
        const matched = users.find(
          (u) => u.email.toLowerCase() === trimmedEmail && u.password === password
        );

        if (matched) {
          const authUser = {
            id: matched.id || `usr-${Date.now()}`,
            name: matched.name,
            email: matched.email,
            role: matched.role || 'Security Analyst',
          };
          setUser(authUser);
          localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
          resolve({ success: true, user: authUser });
        } else {
          reject(new Error('Invalid email or password. Please verify your credentials or create an account.'));
        }
      }, 500);
    });
  }, []);

  const register = useCallback((data) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = getStoredUsers();
        const trimmedEmail = data.email.trim().toLowerCase();
        const existing = users.find((u) => u.email.toLowerCase() === trimmedEmail);

        if (existing) {
          reject(new Error('An account with this email already exists. Please sign in instead.'));
          return;
        }

        const newUser = {
          id: `usr-${Date.now()}`,
          name: data.name.trim(),
          email: trimmedEmail,
          password: data.password,
          role: 'Lead Threat Analyst',
          createdDate: new Date().toISOString(),
        };

        const updatedUsers = [...users, newUser];
        saveStoredUsers(updatedUsers);

        const authUser = {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        };

        setUser(authUser);
        localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
        resolve({ success: true, user: authUser });
      }, 500);
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
