import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import LogoDerecho from '../assets/LogoDerecho.png';
import LogoModoOscuro from '../assets/LogoModoOscuro.png';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from './ThemeProvider';

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

function Header({ title, onMenuClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      setIsDark(true);
    } else if (theme === 'light') {
      setIsDark(false);
    } else {
      // theme === 'system'
      if (typeof window !== 'undefined') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDark(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
      }
    }
  }, [theme]);

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
    if (onMenuClick) {
      onMenuClick();
    }
  };

  const currentLogo = isDark ? LogoModoOscuro : LogoDerecho;

  return (
    <header className="relative w-full h-14 md:h-16 lg:h-20 bg-background border-b border-border flex items-center justify-between px-3 md:px-6 lg:px-8 shadow-sm transition-colors">
      {/* Botón de menú (izquierda) */}
      <button
        onClick={handleMenuClick}
        className="w-7 h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 flex items-center justify-center hover:bg-accent rounded transition-colors text-foreground"
        aria-label="Menú"
      >
        <FontAwesomeIcon icon={faBars} className="text-lg md:text-xl lg:text-2xl" />
      </button>

      {/* Título central */}
      <h1 className="absolute left-1/2 transform -translate-x-1/2 text-sm md:text-lg lg:text-2xl font-bold text-foreground pointer-events-none">
        {title}
      </h1>

      {/* Controles derecha: Theme Toggle + Logo */}
      <div className="flex items-center gap-2 md:gap-3 relative z-20">
        <ThemeToggle />
        <img
          src={currentLogo}
          alt="Logo"
          className="h-4 md:h-8 lg:h-10 xl:h-14 w-auto object-contain cursor-pointer hover:scale-105 hover:opacity-90 transition-all duration-200"
          onClick={() => navigate('/home')}
        />
      </div>
    </header>
  );
}

export default Header;
