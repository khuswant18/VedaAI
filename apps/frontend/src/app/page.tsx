'use client';
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { useSidebarContext } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { getAssignments, deleteAssignment } from '@/services/api';
import { formatDate } from '@/lib/utils';
import { useToastStore } from '@/store/toastStore';
import {
  Sparkles,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Plus,
  MoreVertical,
  Search,
  Filter,
  Eye,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import type { AssignmentListItem } from '@vedaai/shared';
const statusConfig = {
  pending: { variant: 'warning' as const, icon: Clock, label: 'Pending' },
  processing: { variant: 'info' as const, icon: Loader2, label: 'Processing' },
  completed: { variant: 'success' as const, icon: CheckCircle2, label: 'Completed' },
  failed: { variant: 'danger' as const, icon: XCircle, label: 'Failed' },
};
function AssignmentMenu({
  assignment,
  onDelete,
}: {
  assignment: AssignmentListItem;
  onDelete: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="More options"
      >
        <MoreVertical className="h-4 w-4 text-gray-500" />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-gray-200 shadow-lg z-40 py-1 animate-in slide-in-from-right">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(false);
              if (assignment.status === 'completed') {
                router.push(`/papers/${assignment._id}`);
              }
            }}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Eye className="h-4 w-4 text-gray-400" />
            View Assignment
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(false);
              onDelete(assignment._id);
            }}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
export default function DashboardPage() {
  const [assignments, setAssignments] = useState<AssignmentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const { addToast } = useToastStore();
  const router = useRouter();
  const filterRef = useRef<HTMLDivElement>(null);
  const { activeNav, setActiveNav, setAssignmentCount } = useSidebarContext();
  useEffect(() => {
    async function loadAssignments() {
      try {
        const data = await getAssignments();
        setAssignments(data);
        setAssignmentCount(data.length);
      } catch (error) {
        console.error('Failed to load assignments:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadAssignments();
  }, [setAssignmentCount]);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    if (filterOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterOpen]);
  const handleDelete = async (id: string) => {
    try {
      await deleteAssignment(id);
      setAssignments((prev) => {
        const updated = prev.filter((a) => a._id !== id);
        setAssignmentCount(updated.length);
        return updated;
      });
      addToast('Assignment deleted', 'success');
    } catch {
      addToast('Failed to delete assignment', 'error');
    }
  };
  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
  ];
  const placeholderSections: Record<string, { title: string; description: string; icon: string }> = {
    Home: {
      title: 'Welcome to VedaAI',
      description: 'Your AI-powered teaching assistant. Select a section from the sidebar to get started.',
      icon: '🏠',
    },
    'My Groups': {
      title: 'My Groups',
      description: 'Manage your student groups and classes. This feature is coming soon.',
      icon: '👥',
    },
    'AI Toolkit': {
      title: "AI Teacher's Toolkit",
      description: 'Access advanced AI tools for lesson planning, grading, and more. Coming soon.',
      icon: '✨',
    },
    'My Library': {
      title: 'My Library',
      description: 'Your saved question papers, templates, and resources. Coming soon.',
      icon: '📚',
    },
  };
  if (activeNav !== 'Assignments') {
    const section = placeholderSections[activeNav] || placeholderSections['Home'];
    return (
      <div className="min-h-screen">
        <Header />
        <div className="px-3 sm:px-4 md:px-8 py-4 sm:py-6 max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20 sm:py-32 text-center">
            <div className="text-5xl sm:text-6xl mb-6">{section.icon}</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              {section.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-500 max-w-md mb-8">
              {section.description}
            </p>
            <Button
              onClick={() => setActiveNav('Assignments')}
              icon={<Sparkles className="h-4 w-4" />}
            >
              Go to Assignments
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen">
      <Header title="Assignments" />
      <div className="px-3 sm:px-4 md:px-8 py-4 sm:py-6 max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Assignments
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            Manage and create assignments for your classes.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border transition-colors ${
                statusFilter !== 'all'
                  ? 'border-orange-300 bg-orange-50 text-orange-700'
                  : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>
                Filter{statusFilter !== 'all' ? `: ${filterOptions.find((f) => f.value === statusFilter)?.label}` : ' By'}
              </span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </button>
            {filterOpen && (
              <div className="absolute left-0 top-full mt-1 w-44 bg-white rounded-xl border border-gray-200 shadow-lg z-40 py-1">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setStatusFilter(option.value);
                      setFilterOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 text-sm transition-colors ${
                      statusFilter === option.value
                        ? 'bg-orange-50 text-orange-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                    {statusFilter === option.value && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-orange-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search Assignment"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Spinner size="lg" />
            <p className="text-sm text-gray-500 animate-pulse text-center max-w-sm px-4">
              Render backend is starting up, this might take up to a minute...
            </p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 max-w-md mx-auto text-center px-4">
            <div className="mb-6">
              <img
                src="/assets/empty_illustration.png"
                alt="No assignments"
                className="w-64 h-auto hidden sm:block"
              />
              <img
                src="/assets/empty_illustration_mobile.png"
                alt="No assignments"
                className="w-48 h-auto sm:hidden"
              />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              No assignments yet
            </h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
            </p>
            <Link href="/assignments/new" className="w-full sm:w-auto">
              <button className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 bg-[#1C1C1C] text-white rounded-full font-medium text-sm hover:bg-black transition-colors shadow-sm">
                <Plus className="h-5 w-5" />
                Create Your First Assignment
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pb-20">
            {filteredAssignments.map((assignment) => {
              const status = statusConfig[assignment.status];
              const StatusIcon = status.icon;
              return (
                <div
                  key={assignment._id}
                  onClick={() => {
                    if (assignment.status === 'completed') {
                      router.push(`/papers/${assignment._id}`);
                    }
                  }}
                  className={`group bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200 ${assignment.status === 'completed' ? 'cursor-pointer' : ''
                    }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 flex-1 min-w-0">
                      {assignment.title}
                    </h3>
                    <AssignmentMenu
                      assignment={assignment}
                      onDelete={handleDelete}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 sm:mt-4 gap-2 sm:gap-4">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-500">
                      <span>Assigned: {formatDate(assignment.createdAt)}</span>
                      <span>Due: {formatDate(assignment.dueDate)}</span>
                    </div>
                    <Badge variant={status.variant}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="fixed bottom-24 lg:bottom-8 right-4 sm:right-8 z-30">
          <Link href="/assignments/new">
            <button className="flex items-center justify-center w-14 h-14 bg-white rounded-full shadow-lg text-[#ff5623] hover:bg-gray-50 transition-colors">
              <Plus className="h-6 w-6" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
