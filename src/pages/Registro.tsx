import { useState } from 'react';

import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import SolicitanteForm from '../components/forms/SolicitanteForm';



function Registro() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleSuccess = (data: any) => {
    console.log('Registro exitoso:', data);
    alert('Beneficiario registrado exitosamente');
    // Aquí podrías redirigir o limpiar el formulario si es necesario
  };

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col">
      <Header title="REGISTRO DE SOLICITANTE" onMenuClick={handleMenuClick} />
      <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />

      <main className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Botones de navegación superiores */}

          <div className="bg-white/90 backdrop-blur-md border border-white/20 rounded-lg shadow-xl p-6 md:p-8 transition-all hover:shadow-2xl animate-slide-up-page">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Registro de Beneficiarios</h2>
            <SolicitanteForm onSuccess={handleSuccess} embedded={true} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Registro;
