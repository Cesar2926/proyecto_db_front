import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faSearch } from '@fortawesome/free-solid-svg-icons';
import MainLayout from '../components/layout/MainLayout';
import CaseCard from '../components/CaseCard';
import casoService from '../services/casoService';
import catalogoService from '../services/catalogoService';
import type { CasoSummary } from '../types/caso';
import type { AmbitoLegal } from '../types/catalogo';

type FiltroType = 'asignados' | 'todos';

function CasosPage() {
  const [casos, setCasos] = useState<CasoSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState('');

  // Mapa de IDs de Ámbitos Legales a Nombres
  const [ambitosLegales, setAmbitosLegales] = useState<Record<number, string>>({});

  // Recuperar el filtro guardado o usar 'asignados' por defecto
  const [filtro, setFiltro] = useState<FiltroType>(
    () => (localStorage.getItem('filtro_casos') as FiltroType) || 'asignados'
  );
  const casosPerPage = 12; // Número de casos por página
  const navigate = useNavigate();

  // Obtener el ID del usuario logueado (username)
  const username = localStorage.getItem('username') || '';

  const handleCasoClick = (numCaso: string) => {
    navigate(`/casos/${numCaso}`);
  };

  const handleFiltroChange = (nuevoFiltro: FiltroType) => {
    setFiltro(nuevoFiltro);
    localStorage.setItem('filtro_casos', nuevoFiltro);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper para aplanar el árbol de ambitos
  const buildAmbitoMap = (ambitos: AmbitoLegal[], map: Record<number, string> = {}) => {
    ambitos.forEach(ambito => {
      map[ambito.id] = ambito.descripcion;
      if (ambito.children && ambito.children.length > 0) {
        buildAmbitoMap(ambito.children, map);
      }
    });
    return map;
  };

  // Cargar casos y catálogos desde la API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Cargar catálogo de Ámbitos Legales
        const ambitosData = await catalogoService.getAmbitosLegales();
        const ambitosMap = buildAmbitoMap(ambitosData);
        setAmbitosLegales(ambitosMap);

        // 2. Cargar Casos
        // Por defecto traemos solo casos ABIERTOS
        // Si el filtro es 'asignados', pasamos el username
        // Si es 'todos', no pasamos username (backend devuelve todos los filtrados por estatus)
        const userFilter = filtro === 'asignados' ? username : undefined;
        // El usuario pidió "listados todos los casos abiertos", así que fijamos estatus='ABIERTO' hoy.
        // Si se requiere ver cerrados, habría que cambiar esto o agregar opción UI.
        const data = await casoService.getAll('ABIERTO', userFilter);
        setCasos(data);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filtro, username]);

  // Filtrado local por Buscador
  const casosFiltrados = casos.filter((caso) => {
    const search = searchText.toLowerCase();
    const matchNum = caso.numCaso.toLowerCase().includes(search);
    const matchNombre = caso.nombreSolicitante?.toLowerCase().includes(search) || false;
    const matchCedula = caso.cedula.toLowerCase().includes(search);
    const matchSintesis = caso.sintesis?.toLowerCase().includes(search) || false;

    return matchNum || matchNombre || matchCedula || matchSintesis;
  });

  // Paginación
  const indexOfLastCaso = currentPage * casosPerPage;
  const indexOfFirstCaso = indexOfLastCaso - casosPerPage;
  const casosActuales = casosFiltrados.slice(indexOfFirstCaso, indexOfLastCaso);
  const totalPages = Math.ceil(casosFiltrados.length / casosPerPage);

  return (
    <MainLayout title="CASOS ASIGNADOS">
      <div className="w-full mx-auto">
        {/* Barra de Controles: Buscador y Filtro */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">

          {/* Buscador */}
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-900 focus:border-red-900 sm:text-sm transition duration-150 ease-in-out"
              placeholder="Buscar por código, nombre, cédula o síntesis..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1); // Reset page on search
              }}
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Información de paginación */}
            {!loading && (
              <div className="text-gray-600 text-sm hidden md:block">
                Mostrando {casosFiltrados.length > 0 ? indexOfFirstCaso + 1 : 0} -{' '}
                {Math.min(indexOfLastCaso, casosFiltrados.length)} de {casosFiltrados.length} casos
              </div>
            )}

            {/* Filtro desplegable */}
            <div className="relative">
              <select
                value={filtro}
                onChange={(e) => handleFiltroChange(e.target.value as FiltroType)}
                className="appearance-none bg-white border-2 border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 font-medium hover:border-red-900 focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent transition-all cursor-pointer"
              >
                <option value="asignados">Mis Casos Asignados</option>
                <option value="todos">Todos los Casos Abiertos</option>
              </select>
              {/* Ícono de flecha */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-700">
                <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-600 text-lg animate-pulse">Cargando casos...</p>
          </div>
        ) : (
          <>
            {casosFiltrados.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No se encontraron casos con los criterios de búsqueda.
              </div>
            ) : (
              <div
                className="grid gap-4 mb-8"
                style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
              >
                {casosActuales.map((caso) => (
                  <CaseCard
                    key={caso.numCaso}
                    numCaso={caso.numCaso}
                    cedula={caso.cedula}
                    nombre={caso.nombreSolicitante}
                    materia={ambitosLegales[caso.comAmbLegal] || 'DESCONOCIDO'}
                    sintesis={caso.sintesis}
                    fecha={caso.fechaRecepcion}
                    estatus={caso.estatus}
                    onClick={() => handleCasoClick(caso.numCaso)}
                    usuarios_asignados={[]}
                  />
                ))}
              </div>
            )}

            {/* Controles de paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pb-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  ← Anterior
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    // Mostrar solo un rango de páginas si hay muchas (opcional, por ahora simple)
                    if (totalPages > 7) {
                      if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 rounded-lg font-medium transition-all ${currentPage === pageNum
                              ? 'bg-red-900 text-white scale-110'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                        return <span key={pageNum} className="self-end px-1">...</span>;
                      } else {
                        return null;
                      }
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${currentPage === pageNum
                          ? 'bg-red-900 text-white scale-110'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}

export default CasosPage;
