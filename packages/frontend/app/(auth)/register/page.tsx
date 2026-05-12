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
import { Building2, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  usePageTitle('Create Account');
  const router = useRouter();
  const { register, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });
      router.push('/dashboard');
    } catch (err) {}
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-surface-base">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-on-surface">
                CityHub
              </span>
            </Link>
            <h2 className="text-3xl font-bold text-on-surface">Create Account</h2>
            <p className="mt-2 text-on-surface-variant">Join your local community today</p>
          </div>
          
          <Card className="bg-surface-container rounded-3xl border-none shadow-elevation-2">
            <CardContent className="pt-6">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-on-surface">Full name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="rounded-xl border-outline bg-surface-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-on-surface">Email address</Label>
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
                      autoComplete="new-password"
                      required
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="rounded-xl border-outline bg-surface-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-on-surface">Confirm password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="rounded-xl border-outline bg-surface-base"
                    />
                  </div>
                </div>

                {(passwordError || error) && (
                  <div className="p-3 rounded-xl bg-error-container text-on-error text-sm text-center">
                    {passwordError || error}
                  </div>
                )}

                <Button type="submit" className="w-full rounded-full h-12 text-base" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>

              <p className="mt-6 text-center text-on-surface-variant">
                Already have an account?{' '}
                <Link href="/login" className="text-primary font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-secondary via-secondary-light to-primary items-center justify-center p-12">
        <div className="max-w-lg text-center text-white">
          <div className="mb-6">
            <Sparkles className="w-24 h-24 mx-auto text-white/90" />
          </div>
          <h3 className="text-3xl font-bold mb-4">Make Your Voice Heard</h3>
          <p className="text-xl text-white/80">
            Connect with your community, propose solutions, and vote on what matters most.
          </p>
        </div>
      </div>
    </div>
  );
}