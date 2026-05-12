'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import {
  LayoutDashboard,
  FileText,
  Users,
  ScrollText,
  ChevronLeft,
  Shield,
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MODERATOR'] },
  { href: '/admin/proposals', label: 'Proposals', icon: FileText, roles: ['ADMIN', 'MODERATOR'] },
  { href: '/admin/users', label: 'Users', icon: Users, roles: ['ADMIN'] },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText, roles: ['ADMIN'] },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!isLoading && isAuthenticated && user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'MODERATOR')) {
    return null;
  }

  const visibleNavItems = navItems.filter(item => item.roles.includes(user?.role as 'ADMIN' | 'MODERATOR'));

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <aside className="w-64 bg-surface-container border-r border-outline flex flex-col">
        <div className="p-6 border-b border-outline">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-on-surface">Admin Panel</h2>
              <p className="text-xs text-on-surface-variant capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-container text-primary shadow-elevation-1'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-outline">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
