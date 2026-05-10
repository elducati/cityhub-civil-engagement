'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';

export function NavBar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-surface-container-low/80 backdrop-blur-md border-b border-outline shadow-elevation-1 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-on-surface">
                CityHub
              </span>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              <Link
                href="/proposals"
                className="px-4 py-2 rounded-full text-sm font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
              >
                Proposals
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    href="/proposals/create"
                    className="px-4 py-2 rounded-full text-sm font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
                  >
                    Create
                  </Link>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 rounded-full text-sm font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
                  >
                    Dashboard
                  </Link>
                  {user?.role === 'ADMIN' && (
                    <Link
                      href="/admin/proposals"
                      className="px-4 py-2 rounded-full text-sm font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-primary-container rounded-full">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-on-surface font-medium">{user?.email}</span>
                </div>
                <Button variant="outline" size="sm" onClick={logout} className="rounded-full">
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="rounded-full">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="rounded-full">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}