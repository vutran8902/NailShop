"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/AuthModal';

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset'>('login');
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-16 md:p-24">
      {/* Auth Modal */}
      <AuthModal 
        show={showAuthModal}
        mode={authMode}
        onClose={() => setShowAuthModal(false)}
          onSwitchMode={() => {
            switch (authMode) {
              case 'login':
                setAuthMode('reset');
                break;
              case 'signup':
                setAuthMode('login');
                break;
              case 'reset':
                setAuthMode('login');
                break;
            }
          }}
      />

      {/* Hero Section */}
      <section className="w-full max-w-4xl text-center py-16 md:py-24">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
          Stop Managing, Start Growing Your Salon
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8">
          The all-in-one platform designed for nail salon owners. Automate tasks, boost revenue, and reclaim your time.
        </p>
        {session ? (
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300"
          >
            Go to Dashboard
          </button>
        ) : (
          <button 
            onClick={() => {
              setAuthMode('login');
              setShowAuthModal(true);
            }}
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300"
          >
            Get Started Free
          </button>
        )}
      </section>

      {/* Placeholder for future sections */}
      
      <section id="features-automation" className="w-full max-w-4xl py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Automate Your Day, Reclaim Your Time</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1: Smart Inventory */}
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Smart Inventory</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Track stock, get low-stock & expiry alerts, and auto-generate purchase orders. Never run out of OPI Red #123 again!
            </p>
          </div>
          {/* Feature 2: Auto-Blocking */}
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">No-Show Auto-Blocking</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Automatically flag and block repeat no-show clients until they pay a deposit. Protect your schedule.
            </p>
          </div>
          {/* Feature 3: Staff Efficiency */}
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Staff Efficiency Tools</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Track service times and auto-assign appointments based on expertise to optimize your team's performance.
            </p>
          </div>
        </div>
      </section>
      
      <section id="features-revenue" className="w-full max-w-4xl py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Boost Your Bottom Line Effortlessly</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1: Dynamic Pricing */}
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Dynamic Pricing</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get smart suggestions to adjust prices based on demand. Maximize profit during peak times.
            </p>
          </div>
          {/* Feature 2: Upsell Alerts */}
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Smart Upsell Alerts</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Prompt staff with relevant add-on suggestions during booking or checkout. Increase average ticket value.
            </p>
          </div>
          {/* Feature 3: Client Retention */}
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Client Retention Engine</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Automatically identify at-risk clients and send targeted promotions. Keep your regulars coming back.
            </p>
          </div>
        </div>
      </section>
      
      <section id="features-analytics" className="w-full max-w-4xl py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Data-Driven Decisions Made Simple</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1: Profitability */}
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Profitability Dashboard</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Track revenue per service, staff performance, and client value - all in one real-time dashboard.
            </p>
          </div>
          {/* Feature 2: Waste Reduction */}
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Waste Reduction</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get alerts for expiring products and calculate exactly how much waste is costing your business.
            </p>
          </div>
          {/* Feature 3: Client Risk */}
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Client Risk Analysis</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Identify at-risk clients automatically and take action before they stop coming.
            </p>
          </div>
        </div>
      </section>
      {/*
      <section id="pricing" className="w-full max-w-4xl py-16">
        <h2 className="text-3xl font-bold text-center mb-8">Simple Pricing</h2>
        { Pricing tiers go here }
      </section>
      */}
    </main>
  );
}
