"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { themes, ThemeName, ThemeColors, defaultTheme } from './themes';

interface ThemeContextType {
  theme: ThemeColors;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  availableThemes: { name: ThemeName; label: string; description: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'qld-water-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Load saved theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeName | null;
    if (saved && themes[saved]) {
      setThemeName(saved);
    }
  }, []);

  // Save theme to localStorage when it changes
  const setTheme = (name: ThemeName) => {
    setThemeName(name);
    localStorage.setItem(THEME_STORAGE_KEY, name);
  };

  const availableThemes = Object.entries(themes).map(([key, value]) => ({
    name: key as ThemeName,
    label: value.name,
    description: value.description,
  }));

  const value: ThemeContextType = {
    theme: themes[themeName],
    themeName,
    setTheme,
    availableThemes,
  };

  // Prevent hydration mismatch by rendering children only after mount
  // But still render with default theme to avoid layout shift
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ ...value, theme: themes[defaultTheme], themeName: defaultTheme }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
