import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useLocalStorage } from '../hooks/useLocalStorage';

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
  const navigate = useNavigate();
  
  // Usar el hook personalizado para manejar localStorage
  const [formData, setFormData, clearFormData] = useLocalStorage<any>(
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Registro de caso enviado', formData);
    // Aquí irá la lógica para enviar los datos a la API
    
    // Limpiar datos guardados después de enviar exitosamente
    // TODO: Descomentar cuando la API responda exitosamente
    // clearFormData();
  };

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col">
      <Header title="REGISTRO DE CASOS" onMenuClick={handleMenuClick} />
      <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />

      <main className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Botones de navegación superiores */}
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => navigate('/registro')}
              className="flex-1 py-4 rounded-lg font-bold text-lg transition-all duration-200 bg-white text-gray-700 hover:bg-gray-100 shadow"
            >
              Registro de Beneficiarios
            </button>
            <button
              type="button"
              className="flex-1 py-4 rounded-lg font-bold text-lg transition-all duration-200 bg-red-900 text-white shadow-lg"
            >
              Registro de Casos
            </button>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <h2 className="text-3xl font-bold mb-8 text-center">Registro de Casos</h2>

            {/* Placeholder para campos del formulario */}
            <div className="text-center text-gray-600 py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-xl mb-4">📋 Formulario de Registro de Casos</p>
              <p className="text-sm mb-2">
                Por favor, especifica qué campos necesitas para el registro de casos.
              </p>
              <p className="text-xs text-gray-500">
                Ejemplo: Número de caso, Tipo de caso, Cliente, Abogado asignado, etc.
              </p>
            </div>

            {/* Botón de enviar */}
            <div className="flex justify-end mt-8">
              <button
                type="submit"
                className="px-8 py-3 bg-red-900 text-white rounded-lg font-semibold hover:bg-red-800 transition-colors duration-200"
              >
                Registrar Caso
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default RegistroCaso;
