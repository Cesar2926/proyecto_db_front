import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import casoService from '../services/casoService';
import solicitanteService from '../services/solicitanteService';
import catalogoService from '../services/catalogoService';
import Modal from '../components/common/Modal';
import CustomSelect from '../components/common/CustomSelect';
import Button from '../components/common/Button';
// import AddBeneficiarioModal from '../components/modals/AddBeneficiarioModal'; 
import AddAccionModal from '../components/modals/AddAccionModal';
// import AddBeneficiarioModal from '../components/modals/AddBeneficiarioModal';
import SolicitanteForm from '../components/forms/SolicitanteForm';
import { Plus, Search, UserPlus, Pencil } from 'lucide-react';

import type {
  CasoDetalleResponse,
  CasoResponse,
  BeneficiarioResponse,
  CasoUpdateRequest,
} from '../types/caso';
import type { Tribunal } from '../types/catalogo';

import type { SolicitanteResponse } from '../types/solicitante';
import { getFullAmbitoPath } from '../utils/ambitoUtils';

function CasoDetalle() {
  const { numCaso } = useParams<{ numCaso: string }>();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data State
  const [casoDetalle, setCasoDetalle] = useState<CasoDetalleResponse | null>(null);
  const [nombreSolicitante, setNombreSolicitante] = useState<string>('');
  const [solicitante, setSolicitante] = useState<SolicitanteResponse | null>(null);
  const [materiaNombre, setMateriaNombre] = useState<string>('');

  // Catalogs
  const [tribunales, setTribunales] = useState<Tribunal[]>([]);

  // UI State
  const [activeTab, setActiveTab] = useState<
    'general' | 'beneficiarios' | 'historial' | 'documentos' | 'pruebas'
  >('general');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddBeneficiarioModalOpen, setIsAddBeneficiarioModalOpen] = useState(false);

  // Beneficiario Add State (Inline)
  const [cedulaSearch, setCedulaSearch] = useState('');
  const [foundPerson, setFoundPerson] = useState<any>(null); // Persona encontrada (SolicitanteResponse)
  const [newBenParentesco, setNewBenParentesco] = useState('');
  const [newBenTipo, setNewBenTipo] = useState('');
  const [showSolicitanteForm, setShowSolicitanteForm] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Accion State
  const [isAddAccionModalOpen, setIsAddAccionModalOpen] = useState(false);

  // Edit Form State
  const [editFormData, setEditFormData] = useState<CasoUpdateRequest>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!numCaso) return;
      setLoading(true);
      try {
        // 1. Fetch Case Details and Catalogs
        const [detalle, listaTribunales] = await Promise.all([
          casoService.getById(numCaso),
          catalogoService.getTribunales().catch(() => []), // Silent fail for catalogs
        ]);

        console.log('📋 Detalle del caso completo:', detalle);
        console.log('📊 Estructura del caso:', {
          caso: detalle.caso,
          beneficiarios: detalle.beneficiarios,
          totalBeneficiarios: detalle.beneficiarios?.length || 0,
        });

        setCasoDetalle(detalle);
        setTribunales(listaTribunales);

        // 2. Fetch Solicitante Name (Parallel if possible, but dependent on cedula)
        if (detalle.caso.cedula) {
          try {
            const sol = await solicitanteService.getByCedula(detalle.caso.cedula);
            setSolicitante(sol);
            // Usamos 'apellido' opcionalmente o solo nombre
            const nombreCompleto = `${sol.nombre} ${sol.apellido || ''}`.trim();
            setNombreSolicitante(nombreCompleto || detalle.caso.cedula);
          } catch (err) {
            console.warn('No se pudo cargar info del solicitante', err);
            setNombreSolicitante(detalle.caso.cedula);
          }
        }

        // 3. Resolve Materia Name using Tree Search (Full Path)
        const materiaPath = await getFullAmbitoPath(detalle.caso.comAmbLegal);
        setMateriaNombre(materiaPath);
      } catch (err) {
        console.error('Error cargando caso:', err);
        setError('No se pudo cargar el caso. Verifique que exista.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [numCaso]);

  const handleMenuClick = () => setIsSidebarOpen(true);
  const handleCloseSidebar = () => setIsSidebarOpen(false);

  // Helper to calculate age if needed (though backend might send it)
  const calculateAge = (birthDateString: string) => {
    if (!birthDateString) return 'N/A';
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const openEditModal = () => {
    if (!casoDetalle) return;
    setEditFormData({
      sintesis: casoDetalle.caso.sintesis,
      idTribunal: casoDetalle.caso.idTribunal,
      codCasoTribunal: casoDetalle.caso.codCasoTribunal || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!numCaso || !casoDetalle) return;
    try {
      await casoService.update(numCaso, editFormData);
      // Refresh data locally
      const updatedCaso = { ...casoDetalle.caso, ...editFormData };
      // If Tribunal changed, update Name too
      if (editFormData.idTribunal) {
        const trib = tribunales.find((t) => t.idTribunal === editFormData.idTribunal);
        if (trib) updatedCaso.nombreTribunal = trib.nombreTribunal;
      }
      setCasoDetalle({ ...casoDetalle, caso: updatedCaso as CasoResponse });
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Error updating caso', err);
      alert('Error al actualizar el caso');
    }
  };

  /* --- Funciones de Editar Beneficiario --- */
  const [editingBeneficiario, setEditingBeneficiario] = useState<SolicitanteResponse | null>(null);
  const [editingRelacion, setEditingRelacion] = useState({ parentesco: '', tipoBeneficiario: '' });
  const [isEditBeneficiarioModalOpen, setIsEditBeneficiarioModalOpen] = useState(false);

  const handleEditBeneficiario = async (cedula: string) => {
    try {
      setLoading(true);
      const [solicitanteData, casoData] = await Promise.all([
        solicitanteService.getByCedula(cedula),
        // We need current relationship data. We can find it in 'beneficiarios' state
        Promise.resolve(casoDetalle?.beneficiarios?.find((b) => b.cedula === cedula)),
      ]);

      setEditingBeneficiario(solicitanteData);
      if (casoData) {
        setEditingRelacion({
          parentesco: casoData.parentesco,
          tipoBeneficiario: casoData.tipoBeneficiario,
        });
      }
      setIsEditBeneficiarioModalOpen(true);
    } catch (e) {
      console.error('Error cargando beneficiario', e);
      alert('No se pudo cargar la información del beneficiario');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBeneficiarioSuccess = () => {
    setIsEditBeneficiarioModalOpen(false);
    setEditingBeneficiario(null);
    // Refresh parent data to show updated names if changed
    // We can just call fetchData() if we refactor it out of useEffect or force re-render
    // Simulating refresh by re-fetching
    const refresh = async () => {
      if (!numCaso) return;
      const updatedCaso = await casoService.getById(numCaso);
      setCasoDetalle(updatedCaso);
    };
    refresh();
  };

  /* --- Funciones de Beneficiario Inline --- */

  const handleAddBeneficiarioInternal = async (newBen: any) => {
    if (!numCaso || !casoDetalle) return;
    await casoService.addBeneficiario(numCaso, newBen);

    const addedBen: BeneficiarioResponse = {
      cedula: newBen.cedula,
      nombre: newBen.nombre || '',
      parentesco: newBen.parentesco,
      tipoBeneficiario: newBen.tipoBeneficiario,
      numCaso: numCaso,
    };

    const newBeneficiarios = casoDetalle.beneficiarios
      ? [...casoDetalle.beneficiarios, addedBen]
      : [addedBen];
    setCasoDetalle({ ...casoDetalle, beneficiarios: newBeneficiarios });

    // Reset modal state
    setFoundPerson(null);
    setCedulaSearch('');
    setNewBenParentesco('');
    setNewBenTipo('');
    setIsAddBeneficiarioModalOpen(false);
  };

  const handleSearchPerson = async () => {
    setSearchError('');
    setFoundPerson(null);
    if (!cedulaSearch) return;

    try {
      const persona = await solicitanteService.getByCedula(cedulaSearch);
      if (persona) {
        setFoundPerson(persona);
      } else {
        setSearchError('Persona no encontrada. Puede registrarla.');
      }
    } catch (e) {
      setSearchError('Persona no encontrada o error al buscar.');
    }
  };

  const handleAddBeneficiarioClick = async () => {
    if (!foundPerson || !newBenParentesco || !newBenTipo) return;

    const newBen = {
      cedula: foundPerson.cedula,
      nombre: foundPerson.nombre, // Se envía para UI optimista, backend lo saca de DB
      parentesco: newBenParentesco,
      tipoBeneficiario: newBenTipo,
    };
    await handleAddBeneficiarioInternal(newBen);
  };

  const handleNewPersonSuccess = (newPerson: any) => {
    // Al crear persona, volvemos al modo de "persona encontrada"
    setShowSolicitanteForm(false);
    setFoundPerson(newPerson);
    setCedulaSearch(newPerson.cedula);
    setSearchError('');
  };

  const handleAddAccion = async (data: AccionCreateRequest) => {
    if (!numCaso || !casoDetalle) return;
    try {
      await casoService.createAccion(numCaso, data);
      // Refresh data
      const updated = await casoService.getById(numCaso);
      setCasoDetalle(updated);
      // setIsAddAccionModalOpen(false); // Handled by onSuccess in Modal if logic matches, but Modal usually just calls this.
      // Actually, Modal calls onSuccess and closes itself? No, Modal closes itself in its handleSubmit usually if we passed it onClose.
      // My AddAccionModal calls onSuccess then onClose.
    } catch (err) {
      console.error("Error adding accion", err);
      alert("Error al registrar la acción");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-900"></div>
      </div>
    );
  }

  if (error || !casoDetalle) {
    return (
      <div className="flex h-screen flex-col bg-gray-50">
        <Header title="Error" onMenuClick={handleMenuClick} />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <p className="text-red-600 text-xl font-semibold mb-4">
              {error || 'Caso no encontrado'}
            </p>
            <button
              onClick={() => navigate('/casos')}
              className="px-6 py-2 bg-red-900 text-white rounded hover:bg-red-800 transition-colors"
            >
              Volver a la lista
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { caso, beneficiarios, acciones, encuentros, documentos } = casoDetalle;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <Header title={`Caso ${caso.numCaso}`} onMenuClick={handleMenuClick} />
      <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Top Bar with Back & Actions */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/casos')}
              className="flex items-center text-gray-600 hover:text-red-900 transition-colors font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Volver
            </button>
            <div className="flex gap-2">
              <span
                className={`px-4 py-1 rounded-full text-sm font-semibold border ${caso.estatus === 'ABIERTO' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}
              >
                {caso.estatus}
              </span>
            </div>
          </div>

          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{nombreSolicitante}</h1>
                <p className="text-sm text-gray-500">Solicitante (CI: {caso.cedula})</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-red-900 text-right">{materiaNombre}</div>
                <div className="text-sm text-gray-500">Materia</div>
              </div>
            </div>

            {/* Información del Solicitante Expandida */}
            {solicitante && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Datos del Solicitante
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="block text-xs text-gray-500">Teléfono</span>
                    <span className="text-sm font-medium text-gray-900">
                      {solicitante.telfCelular || solicitante.telfCasa || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Correo</span>
                    <span
                      className="text-sm font-medium text-gray-900 truncate"
                      title={solicitante.email}
                    >
                      {solicitante.email || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Edad / Estado Civil</span>
                    <span className="text-sm font-medium text-gray-900">
                      {calculateAge(solicitante.fechaNacimiento)} años, {solicitante.estadoCivil}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
              <div>
                <span className="block text-xs text-gray-500 uppercase tracking-wide">
                  Fecha Recepción
                </span>
                <span className="text-sm font-medium">
                  {new Date(caso.fechaRecepcion).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 uppercase tracking-wide">Trámite</span>
                <span className="text-sm font-medium">{caso.tramite}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 uppercase tracking-wide">
                  Asignado a
                </span>
                <span className="text-sm font-medium">{caso.username || 'Sin asignar'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 uppercase tracking-wide">Término</span>
                <span className="text-sm font-medium">{caso.termino}</span>
              </div>
            </div>

            {(caso.nombreTribunal || caso.codCasoTribunal) && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs text-gray-500 uppercase tracking-wide">
                      Tribunal
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {caso.nombreTribunal || 'No asignado'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 uppercase tracking-wide">
                      N° Expediente / Causa
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {caso.codCasoTribunal || 'No registrado'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {[
                { id: 'general', label: 'General' },
                { id: 'beneficiarios', label: 'Beneficiarios' },
                { id: 'historial', label: 'Historial' },
                { id: 'pruebas', label: 'Pruebas' },
                ...(caso.codCasoTribunal ? [{ id: 'documentos', label: 'Documentos' }] : []),
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                                py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors
                                ${
                                  activeTab === tab.id
                                    ? 'border-red-900 text-red-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[400px]">
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Síntesis del Caso</h3>
                  <button
                    onClick={openEditModal}
                    className="px-3 py-1 text-sm font-medium text-red-900 border border-red-900 rounded-md hover:bg-red-50 transition-colors"
                  >
                    Editar Informacion
                  </button>
                </div>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                  {caso.sintesis || 'No hay síntesis registrada.'}
                </p>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Información de Tribunal
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-xs text-gray-500">Tribunal</div>
                      <div className="font-medium">{caso.nombreTribunal || 'N/A'}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-xs text-gray-500">Causa / Expediente</div>
                      <div className="font-medium">{caso.codCasoTribunal || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BENEFICIARIES TAB */}
            {activeTab === 'beneficiarios' && (
              <div className="p-6">
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Beneficiarios ({beneficiarios?.length || 0})
                  </h3>
                  <Button
                    onClick={() => setIsAddBeneficiarioModalOpen(true)}
                    variant="primary"
                    size="sm"
                  >
                    <Plus size={16} className="mr-2" /> Agregar
                  </Button>
                </div>
                {!beneficiarios || beneficiarios.length === 0 ? (
                  <p className="text-gray-500 italic">No hay beneficiarios registrados.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cédula
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Parentesco
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {beneficiarios.map((ben) => (
                          <tr key={ben.cedula}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {ben.cedula}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {ben.parentesco}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {ben.tipoBeneficiario}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <button
                                onClick={() => handleEditBeneficiario(ben.cedula)}
                                className="text-gray-400 hover:text-red-900 transition-colors"
                                title="Editar información del beneficiario"
                              >
                                <Pencil size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* HISTORIAL TAB */}
            {activeTab === 'historial' && (
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Línea de Tiempo del Caso</h3>

                {(() => {
                  // Combinar todas las actividades en un solo array
                  const timeline: Array<{
                    id: string;
                    type: 'accion' | 'encuentro' | 'inicio';
                    fecha: Date;
                    titulo: string;
                    descripcion?: string;
                    observacion?: string;
                  }> = [];

                  // Agregar acciones
                  if (acciones && acciones.length > 0) {
                    acciones.forEach((acc) => {
                      timeline.push({
                        id: `accion-${acc.idAccion}`,
                        type: 'accion',
                        fecha: new Date(acc.fechaRegistro),
                        titulo: acc.titulo,
                        descripcion: acc.descripcion,
                      });
                    });
                  }

                  // Agregar encuentros
                  if (encuentros && encuentros.length > 0) {
                    encuentros.forEach((enc) => {
                      timeline.push({
                        id: `encuentro-${enc.idEncuentro}`,
                        type: 'encuentro',
                        fecha: new Date(enc.fechaAtencion),
                        titulo: enc.orientacion,
                        observacion: enc.observacion,
                      });
                    });
                  }

                  // Agregar evento inicial del caso
                  timeline.push({
                    id: 'inicio-caso',
                    type: 'inicio',
                    fecha: new Date(caso.fechaRecepcion),
                    titulo: 'Caso Registrado',
                    descripcion: `Caso ${caso.numCaso} ingresado al sistema`,
                  });

                  // Ordenar por fecha (más reciente primero)
                  timeline.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

                  // Si no hay eventos, mostrar mensaje
                  if (timeline.length === 0) {
                    return (
                      <p className="text-gray-500 italic text-center py-12">
                        No hay eventos registrados en el historial.
                      </p>
                    );
                  }

                  return (
                    <div className="relative">
                      {/* Línea vertical */}
                      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-linear-to-b from-red-900 via-red-600 to-gray-300"></div>

                      {/* Eventos de la línea de tiempo */}
                      <div className="space-y-6">
                        {timeline.map((evento, index) => {
                          const isLast = index === timeline.length - 1;

                          // Colores y estilos según tipo
                          const typeStyles = {
                            accion: {
                              bgColor: 'bg-red-900',
                              borderColor: 'border-green-200',
                              textColor: 'text-green-700',
                              badgeBg: 'bg-green-50',
                              badgeText: 'text-green-700',
                              label: 'Acción Legal',
                            },
                            encuentro: {
                              bgColor: 'bg-red-900',
                              borderColor: 'border-blue-200',
                              textColor: 'text-blue-700',
                              badgeBg: 'bg-blue-50',
                              badgeText: 'text-blue-700',
                              label: 'Encuentro / Cita',
                            },
                            inicio: {
                              bgColor: 'bg-red-900',
                              borderColor: 'border-red-200',
                              textColor: 'text-red-900',
                              badgeBg: 'bg-red-50',
                              badgeText: 'text-red-900',
                              label: 'Inicio del Caso',
                            },
                          };

                          const style = typeStyles[evento.type];
                          const isFirst = index === 0;

                          return (
                            <div
                              key={evento.id}
                              className={`relative ${isFirst ? 'pl-20' : 'pl-16'} pb-6`}
                            >
                              {/* Círculo en la línea */}
                              <div
                                className={`absolute top-8 ${
                                  isFirst ? 'w-12 h-12 left-2' : 'w-8 h-8 left-4'
                                } rounded-full ${style.bgColor} border-4 border-white shadow-lg flex items-center justify-center z-10 transition-all`}
                              ></div>

                              {/* Tarjeta de contenido */}
                              <div
                                className={`bg-white rounded-lg shadow-md border-l-4 ${style.borderColor} p-5 hover:shadow-lg transition-shadow ${
                                  isLast ? 'opacity-80' : ''
                                }`}
                              >
                                {/* Header */}
                                <div className="flex justify-between items-start mb-3">
                                  <span
                                    className={`text-xs font-bold ${style.badgeBg} ${style.badgeText} px-3 py-1 rounded-full uppercase tracking-wide`}
                                  >
                                    {style.label}
                                  </span>
                                  <span className="text-sm text-gray-500 font-medium">
                                    {evento.fecha.toLocaleDateString('es-ES', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric',
                                    })}
                                  </span>
                                </div>

                                {/* Título */}
                                <h4 className={`font-bold text-lg ${style.textColor} mb-2`}>
                                  {evento.titulo}
                                </h4>

                                {/* Descripción */}
                                {evento.descripcion && (
                                  <p className="text-gray-700 text-sm leading-relaxed">
                                    {evento.descripcion}
                                  </p>
                                )}

                                {/* Observación */}
                                {evento.observacion && (
                                  <div className="mt-3 bg-gray-50 border border-gray-200 rounded p-3">
                                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                      Observación:
                                    </p>
                                    <p className="text-sm text-gray-700">{evento.observacion}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* PRUEBAS TAB */}
            {activeTab === 'pruebas' && (
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Pruebas del Caso</h3>
                </div>
                {!casoDetalle.pruebas || casoDetalle.pruebas.length === 0 ? (
                  <p className="text-gray-500 italic">No hay pruebas registradas.</p>
                ) : (
                  <ul className="space-y-4">
                    {casoDetalle.pruebas.map((prueba) => (
                      <li
                        key={prueba.idPrueba}
                        className="bg-white p-4 border rounded-lg shadow-sm"
                      >
                        <h4 className="font-medium text-gray-900">{prueba.titulo}</h4>
                        <p className="text-sm text-gray-600 mt-1">{prueba.documento}</p>
                        {prueba.observacion && (
                          <p className="text-xs text-gray-500 italic mt-2">
                            Nota: {prueba.observacion}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* DOCUMENTS TAB */}
            {activeTab === 'documentos' && caso.codCasoTribunal && (
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Documentos del Expediente en Tribunal
                  </h3>
                </div>
                {!documentos || documentos.length === 0 ? (
                  <p className="text-gray-500 italic">No hay documentos cargados.</p>
                ) : (
                  <ul className="divide-y divide-gray-200 border rounded-lg overflow-hidden">
                    {documentos.map((doc) => (
                      <li
                        key={doc.idDocumento}
                        className="p-4 bg-white hover:bg-gray-50 flex items-center justify-between"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-red-50 text-red-700 rounded-lg">
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{doc.titulo}</p>
                            <div className="flex gap-2 text-xs text-gray-500 mt-1">
                              <span>
                                Registrado: {new Date(doc.fechaRegistro).toLocaleDateString()}
                              </span>
                              {doc.folioIni && (
                                <span>
                                  Folios: {doc.folioIni} - {doc.folioFin}
                                </span>
                              )}
                            </div>
                            {doc.observacion && (
                              <p className="text-xs text-gray-500 mt-1 italic">
                                "{doc.observacion}"
                              </p>
                            )}
                          </div>
                        </div>
                        {/* Action buttons could go here */}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* EDIT BENEFICIARIO MODAL */}
      <Modal
        isOpen={isEditBeneficiarioModalOpen}
        onClose={() => setIsEditBeneficiarioModalOpen(false)}
        title={`Editar Información de Beneficiario${editingBeneficiario ? `: ${editingBeneficiario.nombre}` : ''}`}
      >
        <div className="p-0">
          <div className="p-0">
            {editingBeneficiario && (
              <div className="flex flex-col gap-4">
                {/*  Relationship Form Section - Only shown here */}
                <div className="px-6 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parentesco
                    </label>
                    <CustomSelect
                      options={[
                        { value: '', label: 'Seleccione...' },
                        { value: 'Hijo', label: 'Hijo/a' },
                        { value: 'Padre', label: 'Padre/Madre' },
                        { value: 'Esposo', label: 'Esposo/a' },
                        { value: 'Hermano', label: 'Hermano/a' },
                        { value: 'Otro', label: 'Otro' },
                      ]}
                      value={editingRelacion.parentesco}
                      onChange={(val) =>
                        setEditingRelacion({ ...editingRelacion, parentesco: String(val) })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo Beneficiario
                    </label>
                    <CustomSelect
                      options={[
                        { value: 'Directo', label: 'Directo' },
                        { value: 'Indirecto', label: 'Indirecto' },
                      ]}
                      value={editingRelacion.tipoBeneficiario}
                      onChange={(val) =>
                        setEditingRelacion({ ...editingRelacion, tipoBeneficiario: String(val) })
                      }
                    />
                  </div>
                </div>

                <div className="pb-2">
                  <SolicitanteForm
                    initialData={editingBeneficiario as any}
                    formMode="edit"
                    onSuccess={async (updatedSolicitante) => {
                      // 1. SolicitanteForm already updated the personal info via solicitanteService.update
                      // 2. Now we update the relationship info via casoService
                      if (numCaso && updatedSolicitante.cedula) {
                        try {
                          await casoService.updateBeneficiario(numCaso, updatedSolicitante.cedula, {
                            tipoBeneficiario: editingRelacion.tipoBeneficiario,
                            parentesco: editingRelacion.parentesco,
                          });
                          handleEditBeneficiarioSuccess();
                        } catch (err) {
                          console.error('Error updating relationship', err);
                          alert(
                            'Datos personales guardados, pero hubo un error actualizando la relación con el caso.'
                          );
                        }
                      }
                    }}
                    onCancel={() => setIsEditBeneficiarioModalOpen(false)}
                    isModal={true}
                    simplifiedMode={true} // Solo datos mínimos obligatorios
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      <AddAccionModal
        isOpen={isAddAccionModalOpen}
        onClose={() => setIsAddAccionModalOpen(false)}
        onSuccess={handleAddAccion}
        defaultUsername={casoDetalle.caso.username}
      />

      {/* EDIT MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Información del Caso"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Síntesis</label>
            <textarea
              className="w-full border rounded-lg p-2 focus:ring-red-900 focus:border-red-900"
              rows={4}
              value={editFormData.sintesis || ''}
              onChange={(e) => setEditFormData({ ...editFormData, sintesis: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tribunal Asignado
              </label>
              <CustomSelect
                options={[
                  { value: '', label: 'Sin Asignar' },
                  ...tribunales.map((t) => ({ value: t.idTribunal, label: t.nombreTribunal })),
                ]}
                value={editFormData.idTribunal || ''}
                onChange={(val) =>
                  setEditFormData({ ...editFormData, idTribunal: val ? Number(val) : undefined })
                }
                placeholder="Seleccione tribunal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                N° Expediente / Causa
              </label>
              <input
                type="text"
                className="w-full border rounded-lg p-2 focus:ring-red-900 focus:border-red-900"
                value={editFormData.codCasoTribunal || ''}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, codCasoTribunal: e.target.value })
                }
                placeholder="Ej: ABC-123456"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button onClick={() => setIsEditModalOpen(false)} variant="secondary">
              Cancelar
            </Button>
            <Button onClick={handleUpdate} variant="primary">
              Guardar Cambios
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isAddBeneficiarioModalOpen}
        onClose={() => {
          setIsAddBeneficiarioModalOpen(false);
          setShowSolicitanteForm(false);
          setFoundPerson(null);
          setCedulaSearch('');
          setSearchError('');
        }}
        title="Agregar Beneficiario"
      >
        {/* Usamos un contenedor con padding condicional: Si mostramos el form completo de Solicitante, este ya tiene padding interno (p-6/p-8), 
            así que podríamos reducir el padding del contenedor padre si quisiéramos. 
            Pero SolicitanteForm tiene estilos de tarjeta (bg-white shadow p-6). 
            Al estar dentro de un modal blank, queremos que se vea integrado.
            Mejor opción: container simple p-6 para búsqueda, y para form quizás p-0 y dejar que el form se encargue.
        */}
        <div className={!showSolicitanteForm ? 'p-6 space-y-4' : ''}>
          {!showSolicitanteForm ? (
            <>
              {/* Search Section */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Buscar por Cédula"
                  className="flex-1 border p-2 rounded focus:ring-red-900 focus:border-red-900 outline-none"
                  value={cedulaSearch}
                  onChange={(e) => setCedulaSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchPerson()}
                />
                <Button onClick={handleSearchPerson} variant="primary">
                  <Search size={18} />
                </Button>
              </div>

              {searchError && (
                <div className="text-red-500 text-sm flex justify-between items-center text-center p-2 bg-red-50 rounded border border-red-100">
                  <span>{searchError}</span>
                  <Button
                    onClick={() => setShowSolicitanteForm(true)}
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  >
                    <UserPlus size={16} className="mr-1" /> Registrar Nuevo
                  </Button>
                </div>
              )}

              {/* Found Person & Form */}
              {foundPerson && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-100 shadow-sm animate-fade-in">
                  <p className="font-semibold text-green-900 mb-2">
                    Persona encontrada: {foundPerson.nombre} ({foundPerson.cedula})
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Parentesco con solicitante
                      </label>
                      <CustomSelect
                        options={[
                          { value: '', label: 'Seleccione...' },
                          { value: 'Hijo', label: 'Hijo/a' },
                          { value: 'Padre', label: 'Padre/Madre' },
                          { value: 'Esposo', label: 'Esposo/a' },
                          { value: 'Hermano', label: 'Hermano/a' },
                          { value: 'Otro', label: 'Otro' },
                        ]}
                        value={newBenParentesco}
                        onChange={(val) => setNewBenParentesco(val)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tipo de Beneficiario
                      </label>
                      <CustomSelect
                        options={[
                          { value: '', label: 'Seleccione...' },
                          { value: 'Directo', label: 'Directo' },
                          { value: 'Indirecto', label: 'Indirecto' },
                        ]}
                        value={newBenTipo}
                        onChange={(val) => setNewBenTipo(val)}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={handleAddBeneficiarioClick}
                      disabled={!newBenParentesco || !newBenTipo}
                      variant="primary" // Keeping project color (Red)
                    >
                      Agregar al Caso
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Create New Person Form */
            <div>
              <div className="flex justify-between items-center mb-0 p-4 border-b bg-gray-50">
                <h4 className="font-semibold text-gray-800">Registrar Nueva Persona</h4>
                <button
                  onClick={() => setShowSolicitanteForm(false)}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                >
                  Volver
                </button>
              </div>
              <div className="p-0">
                {' '}
                {/* SolicitanteForm has its own padding but inside a card. We might want to strip card styles if possible or just let it be. */}
                <SolicitanteForm
                  onSuccess={handleNewPersonSuccess}
                  onCancel={() => setShowSolicitanteForm(false)}
                  isModal={true}
                  simplifiedMode={true}
                  formMode="create"
                  initialData={{ cedula: cedulaSearch }}
                />
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default CasoDetalle;
