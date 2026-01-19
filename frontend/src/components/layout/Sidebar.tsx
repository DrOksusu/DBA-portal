'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSidebarStore, useAuthStore } from '@/lib/store';
import {
  LayoutDashboard,
  Receipt,
  Users,
  Package,
  Megaphone,
  Settings,
  ChevronLeft,
  LogOut,
} from 'lucide-react';

const menuItems = [
  {
    title: '대시보드',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: '매출 관리',
    href: '/dashboard/revenue',
    icon: Receipt,
    children: [
      { title: '일계표 입력', href: '/dashboard/revenue/daily' },
      { title: '월별 분석', href: '/dashboard/revenue/monthly' },
      { title: '연간 분석', href: '/dashboard/revenue/yearly' },
    ],
  },
  {
    title: '직원 관리',
    href: '/dashboard/hr',
    icon: Users,
    children: [
      { title: '직원 목록', href: '/dashboard/hr/employees' },
      { title: '급여 관리', href: '/dashboard/hr/salaries' },
      { title: '인센티브', href: '/dashboard/hr/incentives' },
    ],
  },
  {
    title: '재고 관리',
    href: '/dashboard/inventory',
    icon: Package,
    children: [
      { title: '제품 목록', href: '/dashboard/inventory/products' },
      { title: '재고 현황', href: '/dashboard/inventory/stock' },
      { title: '입출고', href: '/dashboard/inventory/movements' },
    ],
  },
  {
    title: '마케팅',
    href: '/dashboard/marketing',
    icon: Megaphone,
    children: [
      { title: '캠페인', href: '/dashboard/marketing/campaigns' },
      { title: '비용 관리', href: '/dashboard/marketing/expenses' },
      { title: '성과 분석', href: '/dashboard/marketing/analytics' },
    ],
  },
  {
    title: '설정',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, toggle } = useSidebarStore();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    logout();
    window.location.href = '/auth/login';
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40',
        isOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {isOpen && (
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary-600">VIBE</span>
          </Link>
        )}
        <button
          onClick={toggle}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft
            className={cn(
              'h-5 w-5 text-gray-500 transition-transform',
              !isOpen && 'rotate-180'
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-md transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {isOpen && <span className="font-medium">{item.title}</span>}
              </Link>

              {/* Sub menu */}
              {isOpen && item.children && isActive && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        'block px-3 py-2 text-sm rounded-md transition-colors',
                        pathname === child.href
                          ? 'text-primary-600 font-medium'
                          : 'text-gray-500 hover:text-gray-700'
                      )}
                    >
                      {child.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
        {isOpen ? (
          <div className="flex items-center justify-between">
            <div className="truncate">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex justify-center p-2 text-gray-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>
    </aside>
  );
}
