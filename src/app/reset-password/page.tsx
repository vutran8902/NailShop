"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Verify the recovery token on page load
    async function verifyRecoveryToken() {
      const token = searchParams.get('token');
      
      if (!token) {
        setError('No recovery token found');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.auth.getUser(token);
        
        if (error || !data.user) {
          setError('Invalid or expired recovery token');
          setIsLoading(false);
          return;
        }

        setIsLoading(false);
      } catch (err) {
        setError('Error verifying recovery token');
        setIsLoading(false);
        console.error(err);
      }
    }

    verifyRecoveryToken();
  }, [searchParams, supabase]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic password validation
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      const token = searchParams.get('token');
      
      if (!token) {
        setError('Recovery token is missing');
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
        nonce: token
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-4">Verifying recovery token...</h1>
          <p>Please wait while we process your request.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Password Reset Successful
          </h2>
          <p className="mb-4">
            You will be redirected to the dashboard shortly.
          </p>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-green-500 h-1.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="glass-card w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Reset Your Password</h2>
        {error && (
          <div className="glass-badge error p-3 rounded-lg text-center mb-6">
            {error}
          </div>
        )}
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="glass-input w-full p-3 focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="glass-input w-full p-3 focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="glass-button primary w-full py-3 px-4 font-medium rounded-lg transition-all duration-300"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}
