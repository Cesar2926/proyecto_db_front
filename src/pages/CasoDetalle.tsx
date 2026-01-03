import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import casoService from '../services/casoService';
import solicitanteService from '../services/solicitanteService';

import type { CasoDetalleResponse, CasoResponse, AccionResponse, EncuentroResponse, DocumentoResponse, BeneficiarioResponse } from '../types/caso';

import type { SolicitanteResponse } from '../types/solicitante';
import { getFullAmbitoPath } from '../utils/ambitoUtils';
// Using type import removes runtime dependency, fixing unused errors implicitly in some linters, 
// else we just ensure they are referenced in types only.

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

  // UI State
  const [activeTab, setActiveTab] = useState<'general' | 'beneficiarios' | 'historial' | 'documentos' | 'pruebas'>('general');

  useEffect(() => {
    const fetchData = async () => {
      if (!numCaso) return;
      setLoading(true);
      try {
        // 1. Fetch Case Details
        const detalle = await casoService.getById(numCaso);
        setCasoDetalle(detalle);

        // 2. Fetch Solicitante Name (Parallel if possible, but dependent on cedula)
        if (detalle.caso.cedula) {
          try {
            const sol = await solicitanteService.getByCedula(detalle.caso.cedula);
            setSolicitante(sol);
            // Usamos 'apellido' opcionalmente o solo nombre
            const nombreCompleto = `${sol.nombre} ${sol.apellido || ''}`.trim();
            setNombreSolicitante(nombreCompleto || detalle.caso.cedula);
          } catch (err) {
            console.warn("No se pudo cargar info del solicitante", err);
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
            <p className="text-red-600 text-xl font-semibold mb-4">{error || 'Caso no encontrado'}</p>
            <button onClick={() => navigate('/casos')} className="px-6 py-2 bg-red-900 text-white rounded hover:bg-red-800 transition-colors">
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
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Volver
            </button>
            <div className="flex gap-2">
              <span className={`px-4 py-1 rounded-full text-sm font-semibold border ${caso.estatus === 'ABIERTO' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
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
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Datos del Solicitante</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="block text-xs text-gray-500">Teléfono</span>
                    <span className="text-sm font-medium text-gray-900">{solicitante.telfCelular || solicitante.telfCasa || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Correo</span>
                    <span className="text-sm font-medium text-gray-900 truncate" title={solicitante.email}>{solicitante.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Edad / Estado Civil</span>
                    <span className="text-sm font-medium text-gray-900">
                      {calculateAge(solicitante.fechaNacimiento)} años, {solicitante.estadoCivil}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Ubicación</span>
                    <span className="text-sm font-medium text-gray-900">{solicitante.parroquiaResidencia}, {solicitante.municipioResidencia}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
              <div>
                <span className="block text-xs text-gray-500 uppercase tracking-wide">Fecha Recepción</span>
                <span className="text-sm font-medium">{new Date(caso.fechaRecepcion).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 uppercase tracking-wide">Trámite</span>
                <span className="text-sm font-medium">{caso.tramite}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 uppercase tracking-wide">Asignado a</span>
                <span className="text-sm font-medium">{caso.username || 'Sin asignar'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 uppercase tracking-wide">Término</span>
                <span className="text-sm font-medium">{caso.termino}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {/* Show Pruebas tab, and show Documentos only if codCasoTribunal exists */}
              {[
                { id: 'general', label: 'General' },
                { id: 'beneficiarios', label: 'Beneficiarios' },
                { id: 'historial', label: 'Historial' },
                { id: 'pruebas', label: 'Pruebas' },
                ...(caso.codCasoTribunal ? [{ id: 'documentos', label: 'Documentos' }] : [])
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                                py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors
                                ${activeTab === tab.id
                      ? 'border-red-900 text-red-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Síntesis del Caso</h3>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                  {caso.sintesis || 'No hay síntesis registrada.'}
                </p>

                {caso.idTribunal && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Información de Tribunal</h3>
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
                )}
              </div>
            )}

            {/* BENEFICIARIES TAB */}
            {activeTab === 'beneficiarios' && (
              <div className="p-6">
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Beneficiarios ({beneficiarios?.length || 0})</h3>
                </div>
                {(!beneficiarios || beneficiarios.length === 0) ? (
                  <p className="text-gray-500 italic">No hay beneficiarios registrados.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cédula</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parentesco</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {beneficiarios.map((ben) => (
                          <tr key={ben.cedula}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ben.cedula}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ben.parentesco}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ben.tipoBeneficiario}</td>
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
              <div className="p-6 space-y-8">

                {/* Encounter Section */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 border-l-4 border-blue-500 pl-3">Encuentros / Citas</h3>
                  {(!encuentros || encuentros.length === 0) ? (
                    <p className="text-gray-500 text-sm ml-4">No hay encuentros registrados.</p>
                  ) : (
                    <div className="space-y-4">
                      {encuentros.map(enc => (
                        <div key={enc.idEncuentro} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase">Cita</span>
                            <span className="text-sm text-gray-500">{new Date(enc.fechaAtencion).toLocaleDateString()}</span>
                          </div>
                          <p className="text-gray-800 font-medium mb-1">{enc.orientacion}</p>
                          {enc.observacion && <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{enc.observacion}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Actions Section */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 border-l-4 border-green-500 pl-3">Acciones Legales</h3>
                  {(!acciones || acciones.length === 0) ? (
                    <p className="text-gray-500 text-sm ml-4">No hay acciones registradas.</p>
                  ) : (
                    <div className="space-y-4">
                      {acciones.map(acc => (
                        <div key={acc.idAccion} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded uppercase">Acción</span>
                            <span className="text-sm text-gray-500">{new Date(acc.fechaRegistro).toLocaleDateString()}</span>
                          </div>
                          <h4 className="font-semibold text-gray-900">{acc.titulo}</h4>
                          <p className="text-gray-600 text-sm mt-1">{acc.descripcion}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

              </div>
            )}

            {/* PRUEBAS TAB */}
            {activeTab === 'pruebas' && (
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Pruebas del Caso</h3>
                </div>
                {(!casoDetalle.pruebas || casoDetalle.pruebas.length === 0) ? (
                  <p className="text-gray-500 italic">No hay pruebas registradas.</p>
                ) : (
                  <ul className="space-y-4">
                    {casoDetalle.pruebas.map((prueba) => (
                      <li key={prueba.idPrueba} className="bg-white p-4 border rounded-lg shadow-sm">
                        <h4 className="font-medium text-gray-900">{prueba.titulo}</h4>
                        <p className="text-sm text-gray-600 mt-1">{prueba.documento}</p>
                        {prueba.observacion && <p className="text-xs text-gray-500 italic mt-2">Nota: {prueba.observacion}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* DOCUMENTS TAB */}
            {(activeTab === 'documentos' && caso.codCasoTribunal) && (
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Documentos del Expediente en Tribunal</h3>
                </div>
                {(!documentos || documentos.length === 0) ? (
                  <p className="text-gray-500 italic">No hay documentos cargados.</p>
                ) : (
                  <ul className="divide-y divide-gray-200 border rounded-lg overflow-hidden">
                    {documentos.map((doc) => (
                      <li key={doc.idDocumento} className="p-4 bg-white hover:bg-gray-50 flex items-center justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-red-50 text-red-700 rounded-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{doc.titulo}</p>
                            <div className="flex gap-2 text-xs text-gray-500 mt-1">
                              <span>Registrado: {new Date(doc.fechaRegistro).toLocaleDateString()}</span>
                              {doc.folioIni && <span>Folios: {doc.folioIni} - {doc.folioFin}</span>}
                            </div>
                            {doc.observacion && <p className="text-xs text-gray-500 mt-1 italic">"{doc.observacion}"</p>}
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
    </div>
  );
}

export default CasoDetalle;
