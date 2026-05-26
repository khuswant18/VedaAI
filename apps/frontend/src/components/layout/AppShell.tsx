'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { ToastContainer } from '@/components/ui/Toast';

interface SidebarContextType {
  open: () => void;
  close: () => void;
  activeNav: string;
  setActiveNav: (label: string) => void;
  assignmentCount: number;
  setAssignmentCount: (count: number) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  open: () => {},
  close: () => {},
  activeNav: 'Assignments',
  setActiveNav: () => {},
  assignmentCount: 0,
  setAssignmentCount: () => {},
});

export function useSidebarContext() {
  return useContext(SidebarContext);
}

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('Assignments');
  const [assignmentCount, setAssignmentCount] = useState(0);
  const pathname = usePathname();

  // Auto-set activeNav based on URL changes (e.g. navigating to /assignments/new)
  useEffect(() => {
    if (pathname.startsWith('/assignments') || pathname.startsWith('/papers')) {
      setActiveNav('Assignments');
    }
  }, [pathname]);

  const contextValue: SidebarContextType = {
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    activeNav,
    setActiveNav,
    assignmentCount,
    setAssignmentCount,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      <div className="flex min-h-screen">
        <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
        <main className="flex-1 min-w-0 pb-24 lg:pb-0">{children}</main>
        <BottomNav />
      </div>
      <ToastContainer />
    </SidebarContext.Provider>
  );
}
