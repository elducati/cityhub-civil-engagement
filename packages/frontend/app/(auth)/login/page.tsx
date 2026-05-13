'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Building2 } from 'lucide-react';

export default function LoginPage() {
  usePageTitle('Sign In');
  const router = useRouter();
  const { login, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData);
      router.push('/dashboard');
    } catch {
      // Error handled by useAuth hook
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-base px-4 py-12">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-on-surface">CityHub</span>
          </Link>
          <h2 className="text-3xl font-bold text-on-surface">Welcome back</h2>
          <p className="mt-2 text-on-surface-variant">
            Sign in to continue making a difference
          </p>
        </div>

        <Card className="bg-surface-container rounded-3xl border-none shadow-elevation-2">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-on-surface">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="rounded-xl border-outline bg-surface-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-on-surface">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="rounded-xl border-outline bg-surface-base"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-error-container text-on-error text-sm text-center">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full rounded-full h-12 text-base" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-on-surface-variant">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                Create one
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-on-surface-variant">
          Secure • Transparent • Community Driven
        </p>
      </div>
    </div>
  );
}