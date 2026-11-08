import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, passwordPlain: string) => Promise<void>;
  logout: () => void;
  switchPersona: (personaKey: 'admin' | 'teacher' | 'guardian' | 'student') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_PERSONAS = {
  admin: {
    label: 'Admin (Dr. Vance)',
    role: 'ADMIN' as Role,
    email: 'admin@school.demo',
    password: 'Password@123',
    description: 'Full school administration, classes, teachers, ledger reconciliation, audit trail',
  },
  teacher: {
    label: 'Teacher (Sarah Connor)',
    role: 'TEACHER' as Role,
    email: 'teacher@school.demo',
    password: 'Password@123',
    description: 'Assigned to Grade 10-A and 9-B Mathematics. Attendance recording & marks entry',
  },
  guardian: {
    label: 'Guardian (Robert Stark)',
    role: 'GUARDIAN' as Role,
    email: 'guardian@school.demo',
    password: 'Password@123',
    description: 'Parent of Arya Stark (10-A) & Bran Stark (9-B). Reports, attendance & fee payments',
  },
  student: {
    label: 'Student (Arya Stark)',
    role: 'STUDENT' as Role,
    email: 'student.arya@school.edu',
    password: 'Password@123',
    description: 'Grade 10-A Student. View personal attendance, report card and fee status',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('algions_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('algions_token');
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('algions_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
            localStorage.setItem('algions_user', JSON.stringify(res.data.data));
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, passwordPlain: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password: passwordPlain });
      if (res.data.success) {
        const { token: receivedToken, user: receivedUser } = res.data.data;
        setToken(receivedToken);
        setUser(receivedUser);
        localStorage.setItem('algions_token', receivedToken);
        localStorage.setItem('algions_user', JSON.stringify(receivedUser));
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('algions_token');
    localStorage.removeItem('algions_user');
  };

  const switchPersona = async (personaKey: 'admin' | 'teacher' | 'guardian' | 'student') => {
    const persona = DEMO_PERSONAS[personaKey];
    await login(persona.email, persona.password);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, switchPersona }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
