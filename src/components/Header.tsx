import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import LogoDerecho from '../assets/LogoDerecho.png';

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

function Header({ title, onMenuClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
    if (onMenuClick) {
      onMenuClick();
    }
  };

  return (
    <header className="relative w-full h-14 md:h-16 lg:h-20 bg-white border-b border-gray-200 flex items-center justify-between px-3 md:px-6 lg:px-8 shadow-sm">
      {/* Botón de menú (izquierda) */}
      <button
        onClick={handleMenuClick}
        className="w-7 h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 flex items-center justify-center hover:bg-gray-100 rounded transition-colors text-black"
        aria-label="Menú"
      >
        <FontAwesomeIcon icon={faBars} className="text-lg md:text-xl lg:text-2xl" />
      </button>

      {/* Título central */}
      <h1 className="absolute left-1/2 transform -translate-x-1/2 text-sm md:text-lg lg:text-2xl font-bold text-black">
        {title}
      </h1>

      {/* Logo (derecha) */}
      <div className="flex items-center">
        <img
          src={LogoDerecho}
          alt="Logo Derecho"
          className="h-4 md:h-8 lg:h-10   xl:h-14 w-auto object-contain cursor-pointer hover:scale-105 hover:opacity-90 transition-all duration-200"
          onClick={() => navigate('/home')}
        />
      </div>
    </header>
  );
}

export default Header;
