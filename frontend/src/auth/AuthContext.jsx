import { createContext, useContext, useEffect, useState } from 'react';
import { api, clearToken, getToken, setToken } from '../api';

const AuthContext = createContext(null);

let restoreToken = null;
let restorePromise = null;

function restoreUser(token) {
  if (restoreToken !== token || !restorePromise) {
    restoreToken = token;
    restorePromise = api.me();
  }

  return restorePromise;
}

function resetRestoreRequest() {
  restoreToken = null;
  restorePromise = null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(getToken()));

  useEffect(() => {
    const token = getToken();
    let isMounted = true;

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    setIsLoading(true);
    restoreUser(token)
      .then((data) => {
        if (isMounted) setUser(data.user || null);
      })
      .catch((error) => {
        if (!isMounted) return;
        if (error?.status === 401 || error?.status === 403) {
          clearToken();
          resetRestoreRequest();
        }
        setUser(null);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const authenticate = (authenticatedUser, token) => {
    resetRestoreRequest();
    setToken(token);
    setUser(authenticatedUser);
    setIsLoading(false);
  };

  const logout = async () => {
    try {
      if (getToken()) await api.logout();
    } catch {
      // Always clear local access, even if the API is unavailable.
    } finally {
      clearToken();
      resetRestoreRequest();
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role || null,
      isAuthenticated: Boolean(user),
      isLoading,
      authenticate,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider.');
  return context;
}