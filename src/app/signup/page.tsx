"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function SignupPage() {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    const { error } = await signup(email, password, name);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      setSuccess('Check your email for confirmation link.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col xl:flex-row">
      {/* Background Image Section */}
      <div className="hidden xl:block xl:w-1/2 relative min-h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/dook.webp)' }}
        />
      </div>
      
      {/* Form Section */}
      <div className="w-full xl:w-1/2 flex items-center justify-center p-4 relative min-h-screen">
        {/* Mobile Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center xl:hidden -z-10"
          style={{ backgroundImage: 'url(/images/dook.webp)' }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <Card className="w-full max-w-md p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Signing up...' : 'Sign Up'}</Button>
          </form>
          <div className="mt-4 text-sm text-center">
            Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Log in</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
