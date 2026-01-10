import { useTheme } from './ThemeProvider';
import { useEffect, useState } from 'react';

interface CardProps {
  title: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

function HomeCard({ title, icon, onClick }: CardProps) {
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

  /**
   * Las tarjetas del Home mantienen color vinotinto característico.
   * En modo claro: bg-[#000000] (color negro/vinotinto oscuro definido por el usuario)
   * En modo oscuro: bg-gradient-to-b from-red-900 to-red-950 (gradiente vinotinto para contraste)
   */
  return (
    <div
      onClick={onClick}
      className={`relative w-full h-full min-h-[200px] rounded-2xl p-6 flex flex-col items-start justify-between hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 group overflow-hidden cursor-pointer border-none shadow ${
        isDark
          ? 'bg-gradient-to-b from-red-900 to-red-950'
          : 'bg-gradient-to-br from-red-900 to-red-950'
      }`}
    >
      {/* Ícono decorativo (grande y con opacidad) - esquina superior derecha */}
      <div className="absolute top-4 right-4 text-[#2d0404]/40 dark:text-red-500/30 transform group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
        {icon}
      </div>

      {/* Título - esquina inferior izquierda */}
      <div className="relative z-10 mt-auto">
        <h3 className="text-white font-bold text-xl md:text-2xl lg:text-3xl text-left uppercase tracking-wide">
          {title}
        </h3>
      </div>
    </div>
  );
}

export default HomeCard;
