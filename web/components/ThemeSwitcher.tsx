"use client";

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/lib/ThemeContext';
import { Palette, Check, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

// Preview colors for each theme (shown in the switcher)
const themePreviewColors: Record<string, { primary: string; secondary: string; accent: string }> = {
  ocean: {
    primary: 'bg-blue-500',
    secondary: 'bg-cyan-500',
    accent: 'bg-teal-500',
  },
  earth: {
    primary: 'bg-amber-500',
    secondary: 'bg-orange-500',
    accent: 'bg-green-600',
  },
  slate: {
    primary: 'bg-slate-700',
    secondary: 'bg-slate-500',
    accent: 'bg-teal-500',
  },
};

export default function ThemeSwitcher() {
  const { themeName, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div ref={dropdownRef} className="fixed bottom-6 right-6 z-50">
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="font-bold text-gray-900">Choose Theme</h3>
            <p className="text-xs text-gray-500 mt-1">Select a color palette for the dashboard</p>
          </div>

          <div className="p-2">
            {availableThemes.map((t) => {
              const isActive = themeName === t.name;
              const colors = themePreviewColors[t.name];

              return (
                <button
                  key={t.name}
                  onClick={() => {
                    setTheme(t.name);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    'w-full p-3 rounded-xl text-left transition-all duration-200 flex items-center gap-3',
                    isActive
                      ? 'bg-gradient-to-r from-gray-100 to-gray-50 ring-2 ring-gray-300'
                      : 'hover:bg-gray-50'
                  )}
                >
                  {/* Color Preview Dots */}
                  <div className="flex -space-x-1">
                    <div className={clsx('w-5 h-5 rounded-full border-2 border-white shadow-sm', colors.primary)} />
                    <div className={clsx('w-5 h-5 rounded-full border-2 border-white shadow-sm', colors.secondary)} />
                    <div className={clsx('w-5 h-5 rounded-full border-2 border-white shadow-sm', colors.accent)} />
                  </div>

                  {/* Theme Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{t.label}</span>
                      {isActive && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{t.description}</p>
                  </div>

                  {/* Check Icon */}
                  {isActive && (
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400 text-center">
              Theme preference is saved automatically
            </p>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-300',
          'bg-white border border-gray-200 hover:shadow-xl hover:scale-105',
          'focus:outline-none focus:ring-4 focus:ring-gray-200',
          isOpen && 'ring-4 ring-gray-200'
        )}
        aria-label="Toggle theme switcher"
        aria-expanded={isOpen}
      >
        <Palette className="w-5 h-5 text-gray-700" />
        <span className="text-sm font-medium text-gray-700 hidden sm:inline">Theme</span>
        <ChevronUp
          className={clsx(
            'w-4 h-4 text-gray-400 transition-transform duration-200',
            !isOpen && 'rotate-180'
          )}
        />
      </button>
    </div>
  );
}
