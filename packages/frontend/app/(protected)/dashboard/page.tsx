'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, FileText, Vote, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-base">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface-base py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-on-surface mb-8">Dashboard</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-surface-container rounded-3xl border-none shadow-elevation-1 hover:shadow-elevation-2 transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-on-surface">Welcome, {user?.email?.split('@')[0]}</h3>
              </div>
              <p className="text-on-surface-variant">Your role: <span className="font-medium text-primary capitalize">{user?.role}</span></p>
            </CardContent>
          </Card>
          
          <Card className="bg-surface-container rounded-3xl border-none shadow-elevation-1 hover:shadow-elevation-2 transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
                    <FileText className="w-5 h-5 text-secondary" />
                  </div>
                  <h3 className="text-lg font-semibold text-on-surface">Your Proposals</h3>
                </div>
              </div>
              <p className="text-on-surface-variant mb-4">View and manage your proposals</p>
              <Link href="/proposals">
                <Button variant="outline" size="sm" className="rounded-full">
                  View Proposals <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="bg-surface-container rounded-3xl border-none shadow-elevation-1 hover:shadow-elevation-2 transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center">
                    <Vote className="w-5 h-5 text-tertiary" />
                  </div>
                  <h3 className="text-lg font-semibold text-on-surface">Your Votes</h3>
                </div>
              </div>
              <p className="text-on-surface-variant mb-4">Track your voting activity</p>
              <Link href="/proposals">
                <Button variant="outline" size="sm" className="rounded-full">
                  View Activity <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}