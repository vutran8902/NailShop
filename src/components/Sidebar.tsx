"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Users, Settings, Package } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  
  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/salon-techs', icon: Users, label: 'Technicians' },
    { href: '/dashboard/schedule', icon: Calendar, label: 'Schedule' },
    { href: '/dashboard/services', icon: Package, label: 'Services' },
    { href: '/dashboard/profile', icon: Settings, label: 'Settings' },
  ];

  // Auto-collapse when mouse leaves after delay
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (!isHovering && !isCollapsed) {
      timeoutId = setTimeout(() => {
        setIsCollapsed(true);
      }, 1000);
    }

    return () => clearTimeout(timeoutId);
  }, [isHovering, isCollapsed]);

  return (
    <div 
      className="group/sidebar fixed left-0 top-0 bottom-0 flex flex-col p-4 backdrop-blur-3xl bg-pink-100/30 dark:bg-purple-900/30 border-r-2 border-white/30 dark:border-black/30 transition-all duration-300 rounded-r-3xl w-20 hover:w-64 z-40"
      onMouseEnter={() => {
        setIsHovering(true);
        setIsCollapsed(false);
      }}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        background: 'linear-gradient(135deg, rgba(255, 182, 193, 0.25) 0%, rgba(221, 160, 221, 0.25) 100%)',
        boxShadow: '0 8px 32px 0 rgba(255, 182, 193, 0.3)',
      }}
    >
      {/* Logo Space */}
      <div className="flex items-center justify-center h-20 mb-8">
        <div className="w-12 h-12 rounded-full bg-pink-200/50 dark:bg-purple-800/50 flex items-center justify-center">
          <span className="text-xl font-bold">N</span>
        </div>
      </div>
      
      <div className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center p-3 rounded-xl transition-all duration-300
              ${pathname === item.href 
                ? 'bg-pink-200/40 dark:bg-purple-800/40 border border-white/30 dark:border-black/30' 
                : 'hover:bg-pink-100/30 dark:hover:bg-purple-700/30'}
              group-hover/sidebar:justify-start justify-center
            `}
          >
            <item.icon className="h-5 w-5" />
            <span className="ml-3 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 absolute group-hover/sidebar:static">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
