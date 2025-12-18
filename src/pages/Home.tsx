import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook,
  faComment,
  faClipboard,
  faPenToSquare,
  faPaperPlane,
  faFolderOpen,
} from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';

function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleMenuClick = () => {
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const menuOptions = [
    {
      title: 'Casos Asignados',
      icon: (
        <FontAwesomeIcon
          icon={faBook}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[10rem]"
        />
      ),
      path: '/casos',
    },
    {
      title: 'Citas Pendientes',
      icon: (
        <FontAwesomeIcon
          icon={faComment}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[10rem]"
        />
      ),
      path: '/citas-pendientes',
    },
    {
      title: 'Indicadores y Reportes',
      icon: (
        <FontAwesomeIcon
          icon={faClipboard}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[10rem]"
        />
      ),
      path: '/indicadores-reportes',
    },
    {
      title: 'Registro',
      icon: (
        <FontAwesomeIcon
          icon={faPenToSquare}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[10rem]"
        />
      ),
      path: '/registro',
    },
    {
      title: 'Tareas Pendientes',
      icon: (
        <FontAwesomeIcon
          icon={faPaperPlane}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[10rem]"
        />
      ),
      path: '/tareas-pendientes',
    },
    {
      title: 'Expedientes',
      icon: (
        <FontAwesomeIcon
          icon={faFolderOpen}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[10rem]"
        />
      ),
      path: '/expedientes',
    },
  ];

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col">
      <Header title="INICIO" onMenuClick={handleMenuClick} />
      <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />

      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
        {/* Grid de tarjetas - Ocupa todo el espacio disponible */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full w-full px-2">
          {menuOptions.map((option, index) => (
            <Card
              key={index}
              title={option.title}
              icon={option.icon}
              onClick={() => navigate(option.path)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default Home;
