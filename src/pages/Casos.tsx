import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faTh, faList } from '@fortawesome/free-solid-svg-icons';
import MainLayout from '../components/layout/MainLayout';
import CaseCard from '../components/CaseCard';
import CustomSelect from '../components/common/CustomSelect'; // Importar CustomSelect
import casoService from '../services/casoService';
import catalogoService from '../services/catalogoService';
import type { CasoSummary } from '../types/caso';
import type { AmbitoLegal, Semestre } from '../types/catalogo';

function CasosPage() {
  const [casos, setCasos] = useState<CasoSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState('');

  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOption, setSortOption] = useState<string>('fecha_desc'); // fecha_asc, fecha_desc, nombre_asc, nombre_desc

  // Catálogos
  const [ambitosLegales, setAmbitosLegales] = useState<Record<number, string>>({});
  const [semestres, setSemestres] = useState<Semestre[]>([]);

  // Filtros de API
  const [selectedStatus, setSelectedStatus] = useState<string>('ABIERTO');
  const [selectedSemestre, setSelectedSemestre] = useState<string>('');
  const [onlyMyCases, setOnlyMyCases] = useState<boolean>(true);


  const casosPerPage = 12;
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || '';

  const handleCasoClick = (numCaso: string) => {
    navigate(`/casos/${numCaso}`);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const buildAmbitoMap = (ambitos: AmbitoLegal[], map: Record<number, string> = {}) => {
    ambitos.forEach(ambito => {
      map[ambito.id] = ambito.descripcion;
      if (ambito.children && ambito.children.length > 0) {
        buildAmbitoMap(ambito.children, map);
      }
    });
    return map;
  };

  // Cargar Catálogos Iniciales
  useEffect(() => {
    const fetchCatalogos = async () => {
      try {
        const [ambitosData, semestresData] = await Promise.all([
          catalogoService.getAmbitosLegales(),
          catalogoService.getSemestres()
        ]);
        setAmbitosLegales(buildAmbitoMap(ambitosData));
        setSemestres(semestresData);
      } catch (error) {
        console.error('Error cargando catálogos:', error);
      }
    };
    fetchCatalogos();
  }, []);

  // Cargar Casos cuando cambian los filtros
  useEffect(() => {
    const fetchCasos = async () => {
      setLoading(true);
      try {
        const userFilter = onlyMyCases ? username : undefined;
        // Si el estatus es 'TODOS', mandamos undefined al service
        const statusFilter = selectedStatus === 'TODOS' ? undefined : selectedStatus;
        const terminoFilter = selectedSemestre === '' ? undefined : selectedSemestre;

        const data = await casoService.getAll(statusFilter, userFilter, terminoFilter);
        setCasos(data);
        setCurrentPage(1); // Reset page only when API data changes
      } catch (error) {
        console.error('Error al cargar casos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCasos();
  }, [selectedStatus, selectedSemestre, onlyMyCases, username]);

  // Filtrado local por Buscador (Texto)
  const casosFiltrados = casos.filter((caso) => {
    if (!searchText) return true;
    const search = searchText.trim().toLowerCase();

    // Validaciones seguras contra nulos/undefined
    const matchNum = caso.numCaso?.toLowerCase().includes(search) || false;
    const matchNombre = caso.nombreSolicitante?.toLowerCase().includes(search) || false;
    const matchCedula = caso.cedula?.toLowerCase().includes(search) || false;
    const matchSintesis = caso.sintesis?.toLowerCase().includes(search) || false;

    // Búsqueda por Materia (resolviendo el ID con el mapa)
    const nombreMateria = ambitosLegales[caso.comAmbLegal] || '';
    const matchMateria = nombreMateria.toLowerCase().includes(search);

    return matchNum || matchNombre || matchCedula || matchSintesis || matchMateria;
  });

  // Ordenamiento
  const casosOrdenados = [...casosFiltrados].sort((a, b) => {
    if (sortOption === 'fecha_desc') {
      return new Date(b.fechaRecepcion).getTime() - new Date(a.fechaRecepcion).getTime();
    } else if (sortOption === 'fecha_asc') {
      return new Date(a.fechaRecepcion).getTime() - new Date(b.fechaRecepcion).getTime();
    } else if (sortOption === 'nombre_asc') {
      return (a.nombreSolicitante || '').localeCompare(b.nombreSolicitante || '');
    } else if (sortOption === 'nombre_desc') {
      return (b.nombreSolicitante || '').localeCompare(a.nombreSolicitante || '');
    }
    return 0;
  });


  const indexOfLastCaso = currentPage * casosPerPage;
  const indexOfFirstCaso = indexOfLastCaso - casosPerPage;
  const casosActuales = casosOrdenados.slice(indexOfFirstCaso, indexOfLastCaso);
  const totalPages = Math.ceil(casosOrdenados.length / casosPerPage);

  // Opciones para CustomSelect
  const statusOptions = [
    { value: 'ABIERTO', label: 'Abiertos' },
    { value: 'EN TRÁMITE', label: 'En Trámite' },
    { value: 'EN PAUSA', label: 'En Pausa' },
    { value: 'CERRADO', label: 'Cerrados' },
    { value: 'TODOS', label: 'Todos los Estatus' }
  ];

  const sortOptions = [
    { value: 'fecha_desc', label: 'Recientes primero' },
    { value: 'fecha_asc', label: 'Antiguos primero' },
    { value: 'nombre_asc', label: 'Solicitante (A-Z)' },
    { value: 'nombre_desc', label: 'Solicitante (Z-A)' }
  ];

  const semesterOptions = [
    { value: '', label: 'Todos los Semestres' },
    ...semestres.map(s => ({ value: s.termino, label: s.nombre }))
  ];

  return (
    <MainLayout title="GESTIÓN DE CASOS">
      <div className="w-full mx-auto">

        {/* Controles de Filtros y Búsqueda */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">

            {/* Buscador de Texto */}
            <div className="relative w-full md:w-1/3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-1 focus:ring-red-900 focus:border-red-900 sm:text-sm transition-all"
                placeholder="Buscar en resultados..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            {/* Filtros Dropdowns y Toggles */}
            <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">

              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200 h-[46px] items-center">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow text-red-900' : 'text-gray-400 hover:text-gray-600'}`}
                  title="Vista Cuadrícula"
                >
                  <FontAwesomeIcon icon={faTh} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow text-red-900' : 'text-gray-400 hover:text-gray-600'}`}
                  title="Vista Lista"
                >
                  <FontAwesomeIcon icon={faList} />
                </button>
              </div>

              {/* Ordenamiento - CustomSelect */}
              <div className="w-48">
                <CustomSelect
                  value={sortOption}
                  options={sortOptions}
                  onChange={setSortOption}
                  placeholder="Ordenar por..."
                />
              </div>

              {/* Filtro Semestre - CustomSelect */}
              <div className="w-75">
                <CustomSelect
                  value={selectedSemestre}
                  options={semesterOptions}
                  onChange={setSelectedSemestre}
                  placeholder="Semestre"
                />
              </div>

              {/* Filtro Estatus - CustomSelect */}
              <div className="w-48">
                <CustomSelect
                  value={selectedStatus}
                  options={statusOptions}
                  onChange={setSelectedStatus}
                  placeholder="Estatus"
                />
              </div>

              {/* Toggle Mis Casos */}
              <button
                onClick={() => setOnlyMyCases(!onlyMyCases)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors h-[48px] ${onlyMyCases
                  ? 'bg-red-900 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <FontAwesomeIcon icon={faFilter} className={onlyMyCases ? 'text-white' : 'text-gray-500'} />
                {onlyMyCases ? 'Mis Casos' : 'Todos'}
              </button>

            </div>
          </div>
        </div>

        {/* Resumen de Resultados */}
        {!loading && (
          <div className="mb-4 text-sm text-gray-600">
            Mostrando {casosActuales.length} de {casosOrdenados.length} casos encontrados
            {(selectedStatus !== 'TODOS' || selectedSemestre || onlyMyCases || searchText) &&
              <span className="ml-2 italic text-gray-500">(filtros activos)</span>
            }
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-900 mb-4"></div>
              <p className="text-gray-600">Cargando casos...</p>
            </div>
          </div>
        ) : (
          <>
            {casosOrdenados.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500 text-lg">No se encontraron casos con los criterios seleccionados.</p>
                <button
                  onClick={() => {
                    setSearchText('');
                    setSelectedStatus('TODOS');
                    setSelectedSemestre('');
                    setOnlyMyCases(false);
                    setSortOption('fecha_desc');
                  }}
                  className="mt-4 text-red-900 hover:underline font-medium"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <>
                {viewMode === 'list' ? (
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Caso</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitante</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Materia</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatus</th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Ver</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {casosActuales.map((caso) => (
                          <tr key={caso.numCaso} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {caso.numCaso}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="font-medium text-gray-900">{caso.nombreSolicitante}</div>
                              <div className="text-xs text-gray-500">{caso.cedula}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {ambitosLegales[caso.comAmbLegal] || 'DESCONOCIDO'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(caso.fechaRecepcion).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${caso.estatus === 'ABIERTO' ? 'bg-green-100 text-green-800' :
                                caso.estatus === 'CERRADO' ? 'bg-red-100 text-red-800' :
                                  caso.estatus === 'EN PAUSA' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                }`}>
                                {caso.estatus}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button onClick={() => handleCasoClick(caso.numCaso)} className="text-red-900 hover:text-red-700">Ver Detalles</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div
                    className="grid gap-6 mb-8"
                    style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}
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
              </>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pb-8 mt-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="text-gray-600 text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
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
