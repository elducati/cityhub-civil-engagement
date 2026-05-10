'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/atoms/Button';

export function NavBar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CH</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                CityHub
              </span>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              <Link
                href="/proposals"
                className="px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-primary hover:bg-primary/5 transition-colors"
              >
                Proposals
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    href="/proposals/create"
                    className="px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-primary hover:bg-primary/5 transition-colors"
                  >
                    Create
                  </Link>
                  <Link
                    href="/dashboard"
                    className="px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-primary hover:bg-primary/5 transition-colors"
                  >
                    Dashboard
                  </Link>
                  {user?.role === 'ADMIN' && (
                    <Link
                      href="/admin/proposals"
                      className="px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-primary hover:bg-primary/5 transition-colors"
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
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-text-primary font-medium">{user?.email}</span>
                </div>
                <Button variant="outline" size="sm" onClick={logout}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}