import { useState } from 'react';

import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';
import SolicitanteForm from '../components/forms/SolicitanteForm';
import solicitanteService from '../services/solicitanteService';

// ⏰ CONFIGURACIÓN DE EXPIRACIÓN: Cambia este valor para ajustar cuánto tiempo se guardan los datos
// Valores comunes:
// - 1 hora: 1 * 60 * 60 * 1000
// - 1 día: 1 * 24 * 60 * 60 * 1000
// - 3 días: 3 * 24 * 60 * 60 * 1000
// - 7 días: 7 * 24 * 60 * 60 * 1000
// - 30 días: 30 * 24 * 60 * 60 * 1000
// - Sin expiración: Infinity (no recomendado)
const EXPIRATION_TIME_MS = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos

function RegistroCaso() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Solicitante Search & Verification State
  const [cedulaSearch, setCedulaSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [solicitante, setSolicitante] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Toast State
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  // Usar el hook personalizado para manejar localStorage (Case data)
  const [formData] = useLocalStorage<any>(
    'formDataRegistroCasos',
    {},
    {
      expirationTimeMs: EXPIRATION_TIME_MS,
      autoSave: true, // Guardado automático activado
    }
  );

  const handleMenuClick = () => {
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleSearchSolicitante = async () => {
    if (!cedulaSearch.trim()) return;

    setIsSearching(true);
    setErrorMessage('');

    try {
      console.log(`Buscando solicitante con cédula: ${cedulaSearch}`);
      const data = await solicitanteService.getByCedula(cedulaSearch);
      if (data) {
        setSolicitante(data);
        setErrorMessage('');
        // ÉXITO: Solicitante encontrado, mostramos los datos en el div (automático por state)
        // NO abrimos el modal
        showNotification('Solicitante encontrado exitosamente', 'success');
      }
    } catch (error: any) {
      console.error('Error buscando solicitante:', error);
      if (error.response && error.response.status === 404) {
        // NO ENCONTRADO:
        // 1. Mostrar Toast "Solicitante no encontrado"
        showNotification('Solicitante no encontrado', 'error');
        // 2. Abrir Modal de registro
        setSolicitante(null);
        setIsModalOpen(true);
      } else {
        setErrorMessage('Error al buscar solicitante. Intente nuevamente.');
        showNotification('Error de conexión o servidor', 'error');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchResult = (newSolicitante: any) => {
    setSolicitante(newSolicitante);
    setIsModalOpen(false);
    // Optionally update the search input to match
    if (newSolicitante.cedula) {
      setCedulaSearch(newSolicitante.cedula);
    }
    showNotification('Solicitante registrado y seleccionado', 'success');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!solicitante) {
      alert("Debe seleccionar un solicitante primero.");
      return;
    }
    console.log('Registro de caso enviado', { ...formData, solicitanteId: solicitante.cedula });
    // Aquí irá la lógica para enviar los datos a la API incluyendo el ID del solicitante
  };

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col">
      <Header title="REGISTRO DE CASOS" onMenuClick={handleMenuClick} />
      <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />

      <main className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-8">
        <div className="max-w-6xl mx-auto">

          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Identificación del Solicitante</h2>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-sm font-semibold mb-2">Cédula del Solicitante</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={cedulaSearch}
                    onChange={(e) => setCedulaSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchSolicitante()}
                    placeholder="Ingrese Cédula"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleSearchSolicitante}
                    disabled={isSearching}
                    className="px-6 py-2 bg-red-900 text-white rounded-lg font-semibold hover:bg-red-800 transition-colors duration-200 disabled:bg-gray-400"
                  >
                    {isSearching ? 'Buscando...' : 'Buscar'}
                  </button>
                </div>
              </div>
            </div>

            {errorMessage && (
              <p className="mt-4 text-red-600">{errorMessage}</p>
            )}

            {solicitante && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
                <h3 className="font-semibold text-green-800 mb-2">Solicitante Verificado</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p><span className="font-medium">Nombre:</span> {solicitante.nombre}</p>
                  <p><span className="font-medium">Cédula:</span> {solicitante.cedula}</p>
                  <p><span className="font-medium">Teléfono:</span> {solicitante.telfCelular}</p>
                  <p><span className="font-medium">Correo:</span> {solicitante.email}</p>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className={`bg-white rounded-lg shadow-lg p-6 md:p-8 ${!solicitante ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
            <h2 className="text-3xl font-bold mb-8 text-center">Datos del Caso</h2>

            {/* Placeholder para campos del formulario */}
            <div className="text-center text-gray-600 py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-xl mb-4">📋 Campos del Caso</p>
              <p className="text-sm mb-2">
                (Este formulario se habilita una vez verificado el solicitante)
              </p>
            </div>

            {/* Botón de enviar */}
            <div className="flex justify-end mt-8">
              <button
                type="submit"
                disabled={!solicitante}
                className="px-8 py-3 bg-red-900 text-white rounded-lg font-semibold hover:bg-red-800 transition-colors duration-200 disabled:bg-gray-400"
              >
                Registrar Caso
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Modal para registro de solicitante */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={solicitante ? "Datos del Solicitante" : "Registrar Nuevo Solicitante"}
      >
        <SolicitanteForm
          isModal={true}
          initialData={solicitante ? { ...solicitante } : { cedula: cedulaSearch }}
          onSuccess={handleSearchResult}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}

export default RegistroCaso;
