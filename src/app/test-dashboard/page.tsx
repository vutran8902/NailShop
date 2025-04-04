"use client";

import { useState, useRef } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

export default function TestDashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const sidebarRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className="sidebar text-white w-64"
      >
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="text-lg font-medium text-white"
            >
              SALON
            </button>
          </div>
          
          <nav className="space-y-2">
            {[
              { tab: 'dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'Dashboard' },
              { tab: 'appointments', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', label: 'Appointments' },
              { tab: 'inventory', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', label: 'Inventory' },
              { tab: 'newMember', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z', label: 'New Member' },
              { tab: 'allMembers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', label: 'All Members' },
              { tab: 'logout', icon: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1', label: 'Log Out' }
            ].map(({ tab, icon, label }) => (
              <div key={tab}>
                <button 
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center space-x-3 w-full p-3 rounded-lg sidebar-item ${activeTab === tab ? 'active' : ''}`}
                >
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                  </svg>
                  <span>{label}</span>
                </button>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="glass-card p-4 mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Hello User, welcome back!</h1>
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <div className="mr-2">
              <ThemeToggle />
            </div>
            <div className="relative">
              <svg className="h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 01-3 3H6a3 3 0 01-3-3v-1" />
              </svg>
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">1</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-full bg-accent1 text-white flex items-center justify-center">
                U
              </div>
              <div>
                <div className="text-sm font-medium">TestUser</div>
                <div className="text-xs text-gray-500">Manager</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { label: 'Total Feedback', value: 884, icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z', cardClass: 'stat-card-pink' },
            { label: 'Resolved', value: 782, icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', cardClass: 'stat-card-purple' },
            { label: 'Open Issues', value: 90, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', cardClass: 'stat-card-orange' },
            { label: 'Avg Resolving time', value: '3 days', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', cardClass: 'stat-card-green' }
          ].map(({ label, value, icon, cardClass }) => (
            <div key={label} className={`glass-card p-6 rounded-lg ${cardClass}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-white text-sm opacity-90">{label}</p>
                  <h3 className="text-4xl font-bold mt-1">{value}</h3>
                </div>
                <div className="p-2 rounded-full bg-white bg-opacity-20">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
