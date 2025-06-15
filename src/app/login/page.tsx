"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await login(email, password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col xl:flex-row">
      {/* Background Image Section */}
      <div className="w-full xl:w-1/2 h-[50vh] xl:h-screen relative flex-1 bg-[#fbe2d2]">
        <div 
          className="absolute inset-0 bg-cover md:bg-contain bg-no-repeat bg-center"
          style={{ backgroundImage: 'url(/images/dooks.webp)' }}
        />
      </div>
      
      {/* Form Section */}
      <div className="w-full xl:w-1/2 flex items-center justify-center p-4 relative bg-[#fbe2d2]">
        <Card className="w-full max-w-md p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-4">Log In</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Logging in...' : 'Log In'}</Button>
          </form>
          <div className="mt-4 text-sm text-center">
            Don&apos;t have an account? <Link href="/signup" className="text-blue-600 hover:underline">Sign up</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
