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
      className={`theme-toggle ${isDarkMode ? 'dark' : ''}`} 
      onClick={toggleTheme}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="toggle-icon sun-icon" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="toggle-icon moon-icon" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    </button>
  );
}
