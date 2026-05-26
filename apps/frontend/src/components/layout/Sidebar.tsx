'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSidebarContext } from './AppShell';
import {
  LayoutGrid,
  FileText,
  Sparkles,
  BookOpen,
  Settings,
  Users,
  X,
  LogOut,
  User,
  HelpCircle,
} from 'lucide-react';
const navItems = [
  { id: 'Home', href: '/', label: 'Home', icon: LayoutGrid },
  { id: 'My Groups', href: '/', label: 'My Groups', icon: Users },
  { id: 'Assignments', href: '/', label: 'Assignments', icon: FileText, badge: true },
  { id: 'AI Toolkit', href: '/', label: "AI Teacher's Toolkit", icon: Sparkles },
  { id: 'My Library', href: '/', label: 'My Library', icon: BookOpen },
];
interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}
function SidebarContent({
  onClose,
  settingsOpen,
  setSettingsOpen,
}: {
  onClose?: () => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
}) {
  const { activeNav, setActiveNav, assignmentCount } = useSidebarContext();
  const settingsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    }
    if (settingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [settingsOpen, setSettingsOpen]);
  return (
    <>
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          onClick={() => {
            setActiveNav('Assignments');
            onClose?.();
          }}
        >
          <img 
            src="/main_logo.jpg" 
            alt="VedaAI Logo" 
            className="w-9 h-9 rounded-xl object-cover shadow-sm" 
          />
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            VedaAI
          </span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        )}
      </div>
      <div className="px-4 py-4">
        <Link
          href="/assignments/new"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full rounded-full bg-gray-900 hover:bg-gray-800 text-white font-medium px-4 py-3 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
        >
          <Sparkles className="h-4 w-4 text-orange-400" />
          Create Assignment
        </Link>
      </div>
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeNav === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveNav(item.id);
                onClose?.();
              }}
              className={cn(
                'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative text-left',
                isActive
                  ? 'bg-gray-100 text-gray-900 font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-orange-500 rounded-r-full" />
              )}
              <Icon
                className={cn(
                  'h-5 w-5 flex-shrink-0',
                  isActive ? 'text-gray-900' : 'text-gray-400'
                )}
              />
              <span className="flex-1">{item.label}</span>
              {item.badge && assignmentCount > 0 && (
                <span className="flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-orange-500 text-white text-[10px] font-bold px-1.5">
                  {assignmentCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="px-3 py-2 border-t border-gray-100 relative" ref={settingsRef}>
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
            settingsOpen
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
          )}
        >
          <Settings className="h-5 w-5" />
          Settings
        </button>
        {settingsOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
            <button className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <User className="h-4 w-4 text-gray-400" />
              Account Settings
            </button>
            <button className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <HelpCircle className="h-4 w-4 text-gray-400" />
              Help & Support
            </button>
            <div className="border-t border-gray-100 my-1" />
            <button className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-gray-50">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-sm flex-shrink-0 overflow-hidden">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=DPS"
              alt="School"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.textContent = 'DP';
              }}
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              Delhi Public School
            </p>
            <p className="text-xs text-gray-500 truncate">Bokaro Steel City</p>
          </div>
        </div>
      </div>
    </>
  );
}
export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        <SidebarContent settingsOpen={settingsOpen} setSettingsOpen={setSettingsOpen} />
      </aside>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col animate-slide-in-left">
            <SidebarContent
              onClose={onClose}
              settingsOpen={settingsOpen}
              setSettingsOpen={setSettingsOpen}
            />
          </aside>
        </div>
      )}
    </>
  );
}
export function useSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}
