import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'consultorio-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Intentar leer del localStorage solo en el cliente
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey) as Theme;
        if (stored && ['light', 'dark', 'system'].includes(stored)) {
          return stored;
        }
      } catch (error) {
        console.warn('Error reading theme from localStorage:', error);
      }
    }
    return defaultTheme;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;

    // Limpiar clases anteriores
    root.classList.remove('light', 'dark');

    let effectiveTheme: 'light' | 'dark' = 'light';

    if (theme === 'system') {
      try {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
        effectiveTheme = systemTheme;
      } catch (error) {
        console.warn('Error detecting system theme:', error);
        effectiveTheme = 'light';
      }
    } else {
      effectiveTheme = theme;
    }

    root.classList.add(effectiveTheme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(storageKey, newTheme);
        }
        setTheme(newTheme);
      } catch (error) {
        console.warn('Error saving theme to localStorage:', error);
        setTheme(newTheme); // Actualizar estado aunque falle localStorage
      }
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
