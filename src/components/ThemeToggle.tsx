import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  // Evitar flash de contenido incorrecto en hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calcular el tema efectivo cuando cambia el theme
  useEffect(() => {
    if (!mounted) return;
    
    if (theme === 'system') {
      if (typeof window !== 'undefined') {
        try {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
          setEffectiveTheme(systemTheme);
        } catch (error) {
          console.warn('Error detecting system theme:', error);
          setEffectiveTheme('light');
        }
      }
    } else {
      setEffectiveTheme(theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    const newTheme = effectiveTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Renderizar placeholder durante hidratación
  if (!mounted) {
    return (
      <button
        className="h-9 w-9 rounded-md border border-input bg-background hover:bg-accent transition-colors"
        aria-label="Toggle theme"
      >
        <div className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="h-9 w-9 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center"
      title={effectiveTheme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      aria-label="Toggle theme"
      type="button"
    >
      {effectiveTheme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  );
}
