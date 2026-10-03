import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

export default function ThemeSwitcher({ currentTheme, onThemeChange, onSelectTheme }) {
  const isDark = currentTheme === 'dark';

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    const callback = onThemeChange || onSelectTheme;
    if (callback) {
      callback(nextTheme);
    }
  };

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      className="flex items-center gap-2 px-3.5 py-2 rounded-full border shadow-xl backdrop-blur-xl transition-all cursor-pointer select-none"
      style={{
        background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        borderColor: isDark ? 'rgba(245, 158, 11, 0.4)' : 'rgba(2, 132, 199, 0.4)',
        color: isDark ? '#f59e0b' : '#0284c7',
        boxShadow: isDark 
          ? '0 8px 24px -4px rgba(245, 158, 11, 0.25)' 
          : '0 8px 24px -4px rgba(2, 132, 199, 0.2)',
      }}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      aria-label="Toggle Light and Dark Theme"
    >
      <motion.div
        key={currentTheme}
        initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="flex items-center justify-center"
      >
        {isDark ? (
          <Moon className="w-4 h-4 fill-amber-400/20" />
        ) : (
          <Sun className="w-4 h-4 fill-sky-400/20" />
        )}
      </motion.div>

      <span className="font-mono text-xs font-bold uppercase tracking-wider">
        {isDark ? 'Dark' : 'Light'}
      </span>
    </motion.button>
  );
}
