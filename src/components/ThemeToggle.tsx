"use client";

import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      applyDarkMode();
    } else {
      setIsDarkMode(false);
      applyLightMode();
    }
  }, []);

  const applyDarkMode = () => {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
  };

  const applyLightMode = () => {
    document.documentElement.classList.remove('dark');
    document.body.classList.add('light-theme');
    document.body.classList.remove('dark-theme');
  };

  const toggleTheme = () => {
    if (isDarkMode) {
      // Switch to light mode
      applyLightMode();
      localStorage.setItem('theme', 'light');
    } else {
      // Switch to dark mode
      applyDarkMode();
      localStorage.setItem('theme', 'dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  return (
    <button 
      className={`
        theme-toggle p-2 rounded-full backdrop-blur-3xl
        bg-gradient-to-r from-pink-100/40 to-purple-100/40 
        dark:from-purple-900/40 dark:to-pink-900/40 
        border-2 border-white/30 dark:border-black/30
        shadow-lg hover:shadow-xl transition-all duration-300
        hover:scale-110 active:scale-95
        ${isDarkMode ? 'dark' : ''}
      `}
      style={{
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: isDarkMode 
          ? '0 0 15px 2px rgba(147, 51, 234, 0.3), inset 0 0 10px rgba(147, 51, 234, 0.2)' 
          : '0 0 15px 2px rgba(236, 72, 153, 0.3), inset 0 0 10px rgba(236, 72, 153, 0.2)',
      }}
      onClick={toggleTheme}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-7 h-7 flex items-center justify-center transition-transform duration-300" style={{ transform: isDarkMode ? 'translateX(20px)' : 'translateX(0)' }}>
        {/* Sun icon */}
        <div 
          className={`
            absolute inset-0 flex items-center justify-center transition-all duration-500
            ${isDarkMode ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}
          `}
        >
          <div className="w-5 h-5 bg-amber-400 rounded-full shadow-lg" style={{
            boxShadow: '0 0 20px 5px rgba(251, 191, 36, 0.7)'
          }}></div>
        </div>
        
        {/* Moon icon */}
        <div 
          className={`
            absolute inset-0 flex items-center justify-center transition-all duration-500
            ${isDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}
          `}
        >
          <div className="w-5 h-5 bg-indigo-200 rounded-full shadow-lg overflow-hidden" style={{
            boxShadow: '0 0 20px 5px rgba(129, 140, 248, 0.7)'
          }}>
            <div className="w-3 h-3 bg-indigo-900 rounded-full relative -top-1 -right-3"></div>
          </div>
        </div>
      </div>
    </button>
  );
}
