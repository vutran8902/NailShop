"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const type = searchParams.get('type');
  const redirectTo = searchParams.get('redirect_to');
  const token = searchParams.get('token');
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        // Log all parameters for debugging
        console.log('Callback Parameters:', {
          code,
          type,
          redirectTo,
          token
        });

        if (type === 'recovery' && token) {
          // Explicitly verify the recovery token
          const { data, error } = await supabase.auth.updateUser({
            password: 'newTemporaryPassword123!',
            nonce: token
          });

          if (error) {
            console.error('Password recovery verification error:', error);
            router.push('/?error=recovery_verification');
            return;
          }

          // Redirect to password reset page
          router.push('/reset-password');
        } else if (code) {
          // Handle regular authentication code exchange
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('Code exchange error:', error);
            router.push('/?error=code_exchange');
            return;
          }

          router.push(redirectTo || '/dashboard');
        } else {
          // No valid authentication method found
          console.error('No valid authentication method');
          router.push('/?error=no_auth_method');
        }
      } catch (error) {
        console.error('Authentication callback error:', error);
        router.push('/?error=unexpected');
      }
    }

    handleAuthCallback();
  }, [code, type, redirectTo, token, router, supabase]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Processing authentication...</h1>
        <p>Please wait while we verify your request.</p>
        <p className="text-sm text-gray-500 mt-4">
          If this takes too long, please try again or contact support.
        </p>
      </div>
    </div>
  );
}

export default AuthCallbackPage;
