
"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { Admin, Keyword } from '@/lib/types';
import { admins as initialAdmins, keywords as initialKeywords } from '@/lib/data';

interface AppContextType {
  admins: Admin[];
  keywords: Keyword[];
  addAdmin: (admin: Admin) => void;
  addKeyword: (keyword: Keyword) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [admins, setAdmins] = useState<Admin[]>(initialAdmins);
  const [keywords, setKeywords] = useState<Keyword[]>(initialKeywords);

  const addAdmin = (newAdmin: Admin) => {
    setAdmins(prev => [newAdmin, ...prev]);
  };

  const addKeyword = (newKeyword: Keyword) => {
    setKeywords(prev => [newKeyword, ...prev]);
  };

  return (
    <AppContext.Provider value={{ admins, keywords, addAdmin, addKeyword }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
