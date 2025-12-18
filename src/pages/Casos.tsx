import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import CaseCard from '../components/CaseCard';
//import api from '../services/api';
import type { Caso } from '../types/tipos';

type FiltroType = 'asignados' | 'todos';

function CasosPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [casos, setCasos] = useState<Caso[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  // Recuperar el filtro guardado o usar 'asignados' por defecto
  const [filtro, setFiltro] = useState<FiltroType>(
    () => (localStorage.getItem('filtro_casos') as FiltroType) || 'asignados'
  );
  const casosPerPage = 12; // Número de casos por página
  const navigate = useNavigate();

  const handleMenuClick = () => {
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleCasoClick = (numCaso: string) => {
    navigate(`/casos/${numCaso}`);
  };

  const handleFiltroChange = (nuevoFiltro: FiltroType) => {
    setFiltro(nuevoFiltro);
    localStorage.setItem('filtro_casos', nuevoFiltro); // Guardar preferencia
    setCurrentPage(1); // Resetear a página 1 al cambiar filtro
  };

  // Obtener el ID del usuario logueado
  const userId = localStorage.getItem('userId') || '';

  // Filtrar casos según la opción seleccionada
  const casosFiltrados =
    filtro === 'asignados'
      ? casos.filter((caso) => {
          return caso.usuarios_asignados.includes(userId);
        })
      : casos;

  // Calcular casos para la página actual (de los filtrados)
  const indexOfLastCaso = currentPage * casosPerPage;
  const indexOfFirstCaso = indexOfLastCaso - casosPerPage;
  const casosActuales = casosFiltrados.slice(indexOfFirstCaso, indexOfLastCaso);
  const totalPages = Math.ceil(casosFiltrados.length / casosPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll al inicio al cambiar de página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cargar casos desde la API
  useEffect(() => {
    const fetchCasos = async () => {
      try {
        // Descomentar cuando tengas el endpoint real
        // const response = await api.get('/casos');
        // setCasos(response.data);

        // Datos de ejemplo (eliminar cuando uses la API real)
        const casosEjemplo: Caso[] = [
          {
            numCaso: 'GY-2024-25-0001',
            materia: 'Civil',
            cedula: 'CLI_190',
            nombre: 'Yolanda Lledó Almeida',
            fecha: '2024-03-25',
            estatus: 'CERRADO',
            usuarios_asignados: ['USER_123', 'USER_456'], // Asignado a USER_123 y otro
          },
          {
            numCaso: 'GY-2024-25-0002',
            materia: 'Penal',
            cedula: 'CLI_191',
            nombre: 'Carlos Méndez García',
            fecha: '2024-04-15',
            estatus: 'EN PROGRESO',
            usuarios_asignados: ['USER_123'], // Solo asignado a USER_123 (usuario actual)
          },
          {
            numCaso: 'GY-2024-25-0003',
            materia: 'Laboral',
            cedula: 'CLI_192',
            nombre: 'María Fernández López',
            fecha: '2024-05-10',
            estatus: 'PENDIENTE',
            usuarios_asignados: ['USER_789'], // Asignado a otro usuario (no al actual)
          },
          {
            numCaso: 'GY-2024-25-0004',
            materia: 'Comercial',
            cedula: 'CLI_193',
            nombre: 'Juan Pérez Sánchez',
            fecha: '2024-06-01',
            estatus: 'EN PROGRESO',
            usuarios_asignados: ['USER_123', 'USER_789'], // Asignado a USER_123 y otro
          },
        ];
        setCasos(casosEjemplo);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar casos:', error);
        setLoading(false);
      }
    };

    fetchCasos();
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col">
      <Header title="CASOS ASIGNADOS" onMenuClick={handleMenuClick} />
      <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />

      <main className="flex-1 overflow-y-auto bg-gray-50 px-6 py-4 md:px-8 md:py-6 lg:px-14 lg:py-8">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600 text-lg">Cargando casos...</p>
          </div>
        ) : (
          <div className="w-full mx-auto">
            {/* Barra superior con filtro */}
            <div className="flex justify-between items-center mb-6">
              {/* Información de paginación */}
              <div className="text-gray-600 text-sm">
                Mostrando {indexOfFirstCaso + 1} -{' '}
                {Math.min(indexOfLastCaso, casosFiltrados.length)} de {casosFiltrados.length} casos
              </div>

              {/* Filtro desplegable */}
              <div className="relative">
                <select
                  value={filtro}
                  onChange={(e) => handleFiltroChange(e.target.value as FiltroType)}
                  className="appearance-none bg-white border-2 border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 font-medium hover:border-red-900 focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="asignados">Casos Asignados</option>
                  <option value="todos">Todos los Casos</option>
                </select>
                {/* Ícono de flecha */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-700">
                  <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
                </div>
              </div>
            </div>

            {/* Grid de tarjetas - Se adapta automáticamente según el espacio disponible */}
            <div
              className="grid gap-4 mb-8"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
            >
              {casosActuales.map((caso) => (
                <CaseCard
                  key={caso.numCaso}
                  {...caso}
                  onClick={() => handleCasoClick(caso.numCaso)}
                />
              ))}
            </div>

            {/* Controles de paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pb-8">
                {/* Botón Anterior */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  ← Anterior
                </button>

                {/* Números de página */}
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all ${
                        currentPage === pageNum
                          ? 'bg-red-900 text-white scale-110'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                {/* Botón Siguiente */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default CasosPage;
