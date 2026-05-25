'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNotificationStore } from '@/store/notificationStore';
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  Menu,
  LayoutGrid,
  User,
  Settings,
  LogOut,
  Check,
} from 'lucide-react';
import { useSidebarContext } from './AppShell';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
}

// ── Notification Dropdown ─────────────────────────────────────────────────
function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markAllRead, markRead } =
    useNotificationStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const count = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {count > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[9px] font-bold px-1">
            {count}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {count > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors"
              >
                <Check className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notif) => (
              <button
                key={notif.id}
                onClick={() => {
                  markRead(notif.id);
                  setIsOpen(false);
                }}
                className={`flex gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                  !notif.read ? 'bg-orange-50/50' : ''
                }`}
              >
                <div
                  className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                    !notif.read ? 'bg-orange-500' : 'bg-transparent'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {notif.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {notif.message}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">{notif.time}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors w-full text-center"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Profile Dropdown ──────────────────────────────────────────────────────
function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pl-2 border-l border-gray-200 hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-semibold text-xs overflow-hidden">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=JohnDoe"
            alt="Profile"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).parentElement!.textContent = 'JD';
            }}
          />
        </div>
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
          John Doe
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 hidden sm:block transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-xl z-50 py-1 overflow-hidden">
          {/* Profile header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">John Doe</p>
            <p className="text-xs text-gray-500">john.doe@school.edu</p>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <User className="h-4 w-4 text-gray-400" />
            My Profile
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Settings className="h-4 w-4 text-gray-400" />
            Settings
          </button>
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Header ───────────────────────────────────────────────────────────
export function Header({
  title,
  showBack = false,
  backHref = '/',
}: HeaderProps) {
  const { open } = useSidebarContext();
  const pathname = usePathname();

  // Derive breadcrumb from pathname
  const getBreadcrumb = () => {
    if (pathname.startsWith('/assignments/new')) return 'Assignment';
    if (pathname.startsWith('/papers')) return 'Question Paper';
    return title || 'Assignment';
  };

  return (
    <header className="flex items-center justify-between h-14 px-3 sm:px-4 md:px-6 bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile hamburger — only when no back button */}
        {!showBack && (
          <button
            onClick={open}
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
        )}

        {showBack && (
          <Link
            href={backHref}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
        )}

        {/* Mobile logo (shown when no back button) */}
        {!showBack && (
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 text-white font-bold text-sm">
              V
            </div>
            <span className="text-lg font-bold text-gray-900">VedaAI</span>
          </div>
        )}

        {/* Breadcrumb with icon — matches Figma */}
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
          <LayoutGrid className="h-4 w-4" />
          <span className="font-medium">{getBreadcrumb()}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <NotificationDropdown />
        <ProfileDropdown />
      </div>
    </header>
  );
}
