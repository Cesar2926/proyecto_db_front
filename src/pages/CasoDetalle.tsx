import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
//import api from '../services/api';
import type { Caso } from '../types/tipos';

function CasoDetalle() {
  const { numCaso } = useParams<{ numCaso: string }>();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [caso, setCaso] = useState<Caso | null>(null);
  const [loading, setLoading] = useState(true);

  const handleMenuClick = () => {
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    const fetchCasoDetalle = async () => {
      try {
        // Descomentar cuando tengas el endpoint real
        // const response = await api.get(`/casos/${numCaso}`);
        // setCaso(response.data);

        // Datos de ejemplo (eliminar cuando uses la API real)
        const casoEjemplo: Caso = {
          numCaso: numCaso || 'GY-2024-25-0001',
          materia: 'Civil',
          cedula: 'CLI_190',
          nombre: 'Yolanda Lledó Almeida',
          fecha: '2024-03-25',
          estatus: 'EN PROGRESO',
          usuarios_asignados: ['USER_123', 'USER_456'],
        };
        setCaso(casoEjemplo);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar detalles del caso:', error);
        setLoading(false);
      }
    };

    if (numCaso) {
      fetchCasoDetalle();
    }
  }, [numCaso]);

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Cargando detalles del caso...</p>
      </div>
    );
  }

  if (!caso) {
    return (
      <div className="w-screen h-screen flex flex-col">
        <Header title="ERROR" onMenuClick={handleMenuClick} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 text-xl mb-4">Caso no encontrado</p>
            <button
              onClick={() => navigate('/casos')}
              className="px-6 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800"
            >
              Volver a Casos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col">
      <Header title={`CASO: ${caso.numCaso}`} onMenuClick={handleMenuClick} />
      <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />

      <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Botón volver */}
          <button
            onClick={() => navigate('/casos')}
            className="mb-6 flex items-center gap-2 text-red-900 hover:text-red-700 font-medium transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Volver a Casos
          </button>

          {/* Card con información del caso */}
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <div className="border-b border-gray-200 pb-6 mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{caso.nombre}</h1>
              <p className="text-xl text-gray-600">{caso.materia}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Número de Caso
                </h3>
                <p className="text-lg font-medium text-gray-900">{caso.numCaso}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Cédula</h3>
                <p className="text-lg font-medium text-gray-900">{caso.cedula}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Fecha</h3>
                <p className="text-lg font-medium text-gray-900">
                  {new Date(caso.fecha).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Estatus</h3>
                <span className="inline-block px-4 py-1 bg-green-600 text-white rounded-full text-sm font-semibold">
                  {caso.estatus}
                </span>
              </div>
            </div>

            {/* Aquí puedes agregar más detalles del caso */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Detalles adicionales</h3>
              <p className="text-gray-600">
                Aquí puedes agregar más información sobre el caso, documentos, historial, etc.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CasoDetalle;
