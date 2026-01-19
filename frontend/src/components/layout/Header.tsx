'use client';

import { useAuthStore, useSidebarStore } from '@/lib/store';
import { Bell, Menu, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const { user } = useAuthStore();
  const { isOpen } = useSidebarStore();

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 transition-all duration-300 z-30',
        isOpen ? 'left-64' : 'left-20'
      )}
    >
      <div className="flex items-center space-x-4">
        {title && <h1 className="text-xl font-semibold text-gray-900">{title}</h1>}
      </div>

      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="검색..."
            className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User info */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-600">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.clinicName || '클리닉'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
