import { useState } from 'react';
import type { ReactNode } from 'react';
import Header from '../Header';
import Sidebar from '../Sidebar';

interface MainLayoutProps {
  title: string;
  children: ReactNode;
  className?: string;
}

function MainLayout({ title, children, className = '' }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col">
      <Header title={title} onMenuClick={handleMenuClick} />
      <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />

      <main
        className={`flex-1 overflow-y-auto bg-gray-50 px-6 py-4 md:px-8 md:py-6 lg:px-14 lg:py-8 ${className}`}
      >
        {children}
      </main>
    </div>
  );
}

export default MainLayout;
