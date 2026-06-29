'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { isFirebaseConfigured, auth } from '../lib/firebase';
import { 
  onAuthStateChanged, signInWithEmailAndPassword, signOut as fbSignOut, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { UserProfile } from '../types';

interface AuthContextProps {
  user: UserProfile | null;
  isLoading: boolean;
  loginMockUser: (role: 'owner' | 'admin' | 'employee' | 'receptionist' | 'client', tenantId: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          // In a real application, you would fetch user profile from Firestore:
          // const doc = await getDoc(doc(db, 'users', fbUser.uid));
          // For now, we mock the profile mapping from Firebase auth user
          setUser({
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
            email: fbUser.email || '',
            role: fbUser.email?.includes('owner') ? 'owner' : 'admin', // simple domain rule
            tenantId: 'calixto', // default
            createdAt: new Date().toISOString(),
          });
        } else {
          setUser(null);
        }
        setIsLoading(false);
      });
      return unsubscribe;
    } else {
      // Local Storage mock authentication
      const stored = localStorage.getItem('petflow_current_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
      setIsLoading(false);
    }
  }, []);

  const loginMockUser = (
    role: 'owner' | 'admin' | 'employee' | 'receptionist' | 'client', 
    tenantId: string
  ) => {
    let name = 'Administrador';
    let email = 'admin@petflow.com';

    if (role === 'owner') {
      name = 'Carlos Calixto (Dono)';
      email = 'owner@calixtopet.com.br';
    } else if (role === 'employee') {
      name = 'Ana Souza (Tosa)';
      email = 'ana@calixtopet.com.br';
    } else if (role === 'receptionist') {
      name = 'Bruno Recepção';
      email = 'bruno@calixtopet.com.br';
    } else if (role === 'client') {
      name = 'João Silva (Cliente)';
      email = 'joao.silva@gmail.com';
    }

    const mockProfile: UserProfile = {
      id: `mock-${role}-${Date.now()}`,
      name,
      email,
      role,
      tenantId,
      createdAt: new Date().toISOString(),
    };

    setUser(mockProfile);
    localStorage.setItem('petflow_current_user', JSON.stringify(mockProfile));
  };

  const logout = async () => {
    setIsLoading(true);
    if (isFirebaseConfigured && auth) {
      await fbSignOut(auth);
    } else {
      localStorage.removeItem('petflow_current_user');
      setUser(null);
    }
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginMockUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
