import { useState, useEffect } from 'react';

import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';
import CustomSelect from '../components/common/CustomSelect';
import SmartAmbitoSelector from '../components/forms/SmartAmbitoSelector';
import SolicitanteForm from '../components/forms/SolicitanteForm';
import solicitanteService from '../services/solicitanteService';
import catalogoService, { type AmbitoLegal, type Centro } from '../services/catalogoService';

// ⏰ CONFIGURACIÓN DE EXPIRACIÓN
const EXPIRATION_TIME_MS = 7 * 24 * 60 * 60 * 1000;

function RegistroCaso() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Solicitante Search & Verification State
  const [cedulaSearch, setCedulaSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [solicitante, setSolicitante] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  // FormData: matches CasoCreateRequest roughly
  // comAmbLegal: ID of the selected Ambito/Leaf
  // tramite: 'ASESORÍA', 'CONCILIACIÓN Y MEDIACIÓN', 'REDACCIÓN DE DOCUMENTOS'
  const [formData, setFormData] = useLocalStorage<any>(
    'formDataRegistroCasos',
    { comAmbLegal: 0, tramite: '', sintesis: '', idCentro: '' },
    {
      expirationTimeMs: EXPIRATION_TIME_MS,
      autoSave: true,
    }
  );

  // Catalogos
  const [arbolAmbitos, setArbolAmbitos] = useState<AmbitoLegal[]>([]);
  const [centros, setCentros] = useState<Centro[]>([]);

  // Opciones estáticas para 'Tipo de Trámite'
  const TIPO_TRAMITE_OPTIONS = [
    { value: 'ASESORÍA', label: 'Asesoría' },
    { value: 'CONCILIACIÓN Y MEDIACIÓN', label: 'Conciliación y Mediación' },
    { value: 'REDACCIÓN DE DOCUMENTOS', label: 'Redacción de Documentos' },
  ];

  // Cargar Ámbitos Legales y Centros al montar
  useEffect(() => {
    async function loadData() {
      try {
        const [ambitos, centrosData] = await Promise.all([
          catalogoService.getAmbitosLegales(),
          catalogoService.getCentros()
        ]);
        setArbolAmbitos(ambitos);
        setCentros(centrosData);
      } catch (error) {
        console.error("Error cargando catálogos", error);
        showNotification("Error cargando datos del sistema", "error");
      }
    }
    loadData();
  }, []);

  const handleAmbitoSelection = (ambitoId: number, _materiaId: number) => {
    // We store comAmbLegal = ambitoId. _materiaId is ignored.
    setFormData((prev: any) => ({ ...prev, comAmbLegal: ambitoId }));
  };

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
        showNotification('Solicitante encontrado exitosamente', 'success');
      }
    } catch (error: any) {
      console.error('Error buscando solicitante:', error);
      if (error.response && error.response.status === 404) {
        showNotification('Solicitante no encontrado', 'error');
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

    // Prepare payload for backend (CasoCreateRequest)
    // We need to map our formData to the backend expected structure
    const payload = {
      cedula: solicitante.cedula,
      sintesis: formData.sintesis,
      tramite: formData.tramite,
      comAmbLegal: formData.comAmbLegal,
      idCentro: formData.idCentro,
      // Default values or to be filled later? 
      // For now, these might be handled by backend defaults or required fields we don't present here yet.
      // Assuming this form is Step 1 or partial implementation.
      // But let's log what we have.
    };

    console.log('Enviando Caso:', payload);
    showNotification('Caso registrado (Simulación)', 'success');
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

          <form onSubmit={handleSubmit} className={`bg-white rounded-lg shadow-lg p-6 md:p-8 ${!solicitante ? 'opacity-50 pointer-events-none grayscale' : ''} transition-all duration-300`}>
            <h2 className="text-3xl font-bold mb-8 text-center">Datos del Caso</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Columna Izquierda */}
              <div className="space-y-6">
                {/* Sintesis */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Síntesis del Caso</label>
                  <textarea
                    name="sintesis"
                    value={formData.sintesis || ''}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, sintesis: e.target.value }))}
                    placeholder="Describa brevemente los hechos del caso..."
                    rows={6}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent resize-none transition-shadow"
                    required
                    disabled={!solicitante}
                  />
                </div>
              </div>

              {/* Columna Derecha */}
              <div className="space-y-6">

                {/* Ámbito Legal (Smart Selector) */}
                <div>
                  <SmartAmbitoSelector
                    data={arbolAmbitos}
                    value={formData.comAmbLegal || 0}
                    onChange={handleAmbitoSelection}
                    disabled={!solicitante}
                  />
                </div>

                {/* Tipo de Trámite (Static Select) */}
                <div>
                  <CustomSelect
                    label="Tipo de Trámite"
                    value={formData.tramite || ''}
                    options={TIPO_TRAMITE_OPTIONS}
                    onChange={(val) => setFormData((prev: any) => ({ ...prev, tramite: String(val) }))}
                    required
                    disabled={!solicitante}
                    placeholder="Seleccione el tipo de trámite..."
                  />
                </div>

                {/* Centro */}
                <div>
                  <CustomSelect
                    label="Centro / Clínica Jurídica"
                    value={formData.idCentro || ''}
                    options={centros.map(c => ({ value: c.idCentro, label: c.nombreCentro }))}
                    onChange={(val) => setFormData((prev: any) => ({ ...prev, idCentro: Number(val) }))}
                    required
                    disabled={!solicitante}
                    placeholder="Seleccione el centro..."
                  />
                </div>

              </div>
            </div>

            {/* Botón de enviar */}
            <div className="flex justify-end mt-8">
              <button
                type="submit"
                disabled={!solicitante}
                className="px-8 py-3 bg-red-900 text-white rounded-lg font-semibold hover:bg-red-800 transition-colors duration-200 disabled:bg-gray-400 shadow-md hover:shadow-lg"
              >
                Registrar Caso
              </button>
            </div>
          </form>
        </div>
      </main>

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
