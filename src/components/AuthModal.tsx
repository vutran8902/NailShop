"use client";

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface AuthModalProps {
  show: boolean;
  mode: 'login' | 'signup' | 'reset';
  onClose: () => void;
  onSwitchMode: () => void;
}

export default function AuthModal({ show, mode, onClose, onSwitchMode }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.refresh();
        onClose();
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setSuccessMessage('Please check your email to confirm your account.');
      } else if (mode === 'reset') {
        // Use signInWithPassword to verify email exists
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: 'dummy_password_to_check_email' // This won't actually log in
        });
        
        if (error && error.message !== 'Invalid login credentials') {
          throw new Error('Error verifying email');
        }

        // If error is 'Invalid login credentials', it means the email exists
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${location.origin}/auth/callback?type=recovery`,
        });
        
        if (resetError) throw resetError;
        setSuccessMessage('Password reset link sent. Please check your email.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-card p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {mode === 'login' ? 'Login' : mode === 'signup' ? 'Sign Up' : 'Reset Password'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 glass-badge error rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input w-full p-3 focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {mode !== 'reset' && (
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input w-full p-3 focus:ring-2 focus:ring-primary"
                required
                minLength={6}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="glass-button primary w-full py-3 px-4 font-medium rounded-lg transition-all duration-300 disabled:opacity-50"
          >
            {loading 
              ? 'Processing...' 
              : mode === 'login' 
                ? 'Login' 
                : mode === 'signup' 
                  ? 'Sign Up' 
                  : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          {mode === 'login' && (
            <button
              type="button"
              onClick={() => {
                setPassword('');  // Clear password field
                onSwitchMode();
              }}
              className="text-sm text-primary hover:text-primary-dark mr-4"
            >
              Forgot Password?
            </button>
          )}
          <button
            onClick={onSwitchMode}
            className="text-primary hover:text-primary-dark"
          >
            {mode === 'login' 
              ? "Don't have an account? Sign up" 
              : mode === 'signup'
                ? "Already have an account? Login"
                : "Back to Login"}
          </button>
        </div>

        {successMessage && (
          <div className="mt-6 p-3 glass-badge success rounded-lg text-center">
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
}
