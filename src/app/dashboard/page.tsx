"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

// Define TypeScript interfaces for our data
interface DashboardStats {
  totalClients: number;
  totalServices: number;
  totalStaff: number;
  totalAppointments: number;
  clientGrowth: number;
  serviceGrowth: number;
  staffGrowth: number;
  appointmentGrowth: number;
}

interface RevenueData {
  totalRevenue: number;
  revenueGrowth: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalServices: 0,
    totalStaff: 0,
    totalAppointments: 0,
    clientGrowth: 0,
    serviceGrowth: 0,
    staffGrowth: 1.2,
    appointmentGrowth: 1.3
  });
  const [revenue, setRevenue] = useState<RevenueData>({
    totalRevenue: 0,
    revenueGrowth: 2.5
  });
  
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

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
                  onClick={() => tab === 'logout' ? handleLogout() : setActiveTab(tab)}
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
          <h1 className="text-2xl font-semibold">Hello {user?.email?.split('@')[0] || 'User'}, welcome back!</h1>
          {user && (
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
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium">{user.email.split('@')[0]}</div>
                  <div className="text-xs text-gray-500">Manager</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
        </div>

        {activeTab === 'dashboard' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Key Info</h3>
              <div className="flex space-x-2">
                <button className="glass-button px-4 py-2 text-sm flex items-center space-x-2 rounded-lg">
                  <span>Unhappy Cust.</span>
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button className="glass-button px-4 py-2 text-sm flex items-center space-x-2 rounded-lg">
                  <span>This Week</span>
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
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

            {/* Unhappy Feedbacks List */}
            <div className="glass-card p-6 rounded-lg mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Unhappy Feedbacks List</h3>
                <div className="flex space-x-2">
                  <button className="p-1 rounded hover:bg-gray-100">
                    <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                    </svg>
                  </button>
                  <button className="p-1 rounded hover:bg-gray-100">
                    <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'GUEST00AB0014', type: 'New Guest', date: '23rd April 22 · 02:30 PM', issue: "Didn't get expected results", staff: 'Kiran Rao', status: 'Resolved' },
                  { id: 'Seema K Rai', type: 'Member', date: '23rd April 22 · 02:30 PM', issue: "Haircut wasn't up to the mark", staff: 'Amit M', status: 'Unresolved' },
                  { id: 'Sameer Khan', type: 'Existing Guest', date: '23rd April 22 · 02:30 PM', issue: "Face facial was ineffective", staff: 'Rahul S', status: 'Resolved' },
                  { id: 'GUEST00PW0074', type: 'New Guest', date: '23rd April 22 · 02:30 PM', issue: "Cut my haircut too small", staff: 'Sima J', status: 'Escalated' }
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-start">
                        <div className="w-48">
                          <p className="font-medium">{item.id}</p>
                          <p className="text-sm text-gray-500">{item.type}</p>
                          <p className="text-xs text-gray-400 mt-1">{item.date}</p>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.issue}</p>
                          <p className="text-sm text-gray-500 mt-1">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          {item.staff.charAt(0)}
                        </div>
                        <span className="text-sm">{item.staff}</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === 'Resolved' ? 'bg-green-100 text-green-800' : 
                        item.status === 'Unresolved' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status}
                      </div>
                      <button className="text-gray-400">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Employee Performance */}
            <div className="glass-card p-6 rounded-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Employee Performance</h3>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search employee..." 
                    className="glass-input px-4 py-2 pl-10 text-sm rounded-lg"
                  />
                  <svg className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { name: 'Kiran Rao', resolved: 67, time: '3:4', photo: 'KR' },
                  { name: 'Amit M', resolved: 72, time: '3:3', photo: 'AM' },
                  { name: 'Sima J', resolved: 33, time: '2:4', photo: 'SJ' },
                  { name: 'Jack Mao', resolved: 47, time: '3:7', photo: 'JM' },
                  { name: 'Rahul S', resolved: 27, time: '2:6', photo: 'RS' },
                  { name: 'Rushmi S', resolved: 22, time: '2:7', photo: 'RS' }
                ].map((employee) => (
                  <div key={employee.name} className="glass-card p-4 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {employee.photo}
                      </div>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500">Resolved issues</p>
                        <p className="text-2xl font-bold">{employee.resolved}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">In Days:Hours</p>
                        <p className="text-2xl font-bold">{employee.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'dashboard' && (
          <div className="glass-card p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
            <p className="text-gray-600">This section is under development.</p>
          </div>
        )}
      </div>
    </div>
  );
}
