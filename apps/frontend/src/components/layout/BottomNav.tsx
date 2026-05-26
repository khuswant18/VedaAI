'use client';
import React from 'react';
import Link from 'next/link';
import { useSidebarContext } from './AppShell';
import { cn } from '@/lib/utils';
import {
  LayoutGrid,
  Calendar,
  BookOpen,
  Sparkles,
} from 'lucide-react';
const navItems = [
  { id: 'Home', href: '/', label: 'Home', icon: LayoutGrid },
  { id: 'Assignments', href: '/', label: 'Assignments', icon: Calendar, badge: true },
  { id: 'My Library', href: '/', label: 'Library', icon: BookOpen },
  { id: 'AI Toolkit', href: '/', label: 'AI Toolkit', icon: Sparkles },
];
export function BottomNav() {
  const { activeNav, setActiveNav, assignmentCount } = useSidebarContext();
  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden">
      <nav className="flex items-center justify-between px-6 py-4 bg-[#1C1C1C] rounded-[32px] shadow-2xl">
        {navItems.map((item) => {
          const isActive = activeNav === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={cn(
                'flex flex-col items-center gap-1.5 transition-all duration-200 relative',
                isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'h-6 w-6',
                    isActive ? 'text-white' : 'text-gray-500'
                  )}
                  fill={isActive ? 'currentColor' : 'none'}
                />
                {item.badge && assignmentCount > 0 && (
                  <span className="absolute -top-1 -right-2 flex items-center justify-center min-w-[16px] h-4 rounded-full bg-orange-500 text-white text-[10px] font-bold px-1 ring-2 ring-[#1C1C1C]">
                    {assignmentCount}
                  </span>
                )}
              </div>
              <span className={cn("text-xs font-medium", isActive ? "text-white" : "text-gray-500")}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
