import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faUser,
  faBriefcase,
  faAddressCard,
  faPhone,
  faEnvelope,
  faEdit,
  faFileAlt,
} from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Button from '../components/common/Button';
import solicitanteService from '../services/solicitanteService';
import type { SolicitanteResponse } from '../types/solicitante';
import SolicitanteForm from '../components/forms/SolicitanteForm';
import { useTheme } from '../components/ThemeProvider';

export default function SolicitanteDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(() => {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [solicitante, setSolicitante] = useState<SolicitanteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // New state for Encuesta and Cases
  const [encuesta, setEncuesta] = useState<any | null>(null);
  const [casosTitular, setCasosTitular] = useState<any[]>([]);
  const [casosBeneficiario, setCasosBeneficiario] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      loadSolicitante(id);
    }
  }, [id]);

  // Actualizar isDark cuando cambia el theme
  useEffect(() => {
    if (theme === 'dark') {
      setIsDark(true);
    } else if (theme === 'light') {
      setIsDark(false);
    } else {
      if (typeof window !== 'undefined') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDark(mediaQuery.matches);
        const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
      }
    }
  }, [theme]);

  const loadSolicitante = async (cedula: string) => {
    setLoading(true);
    try {
      const data = await solicitanteService.getByCedula(cedula);
      setSolicitante(data);

      // Fetch Encuesta
      try {
        const encuestaData = await solicitanteService.getEncuesta(cedula);
        setEncuesta(encuestaData);
      } catch (error) {
        console.log('Encuesta no encontrada o error al cargar');
        setEncuesta(null);
      }

      // Fetch Casos
      try {
        const casosT = await solicitanteService.getCasosTitular(cedula);
        setCasosTitular(casosT);
      } catch (error) {
        console.error('Error cargando casos titular', error);
      }

      try {
        const casosB = await solicitanteService.getCasosBeneficiario(cedula);
        setCasosBeneficiario(casosB);
      } catch (error) {
        console.error('Error cargando casos beneficiario', error);
      }
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar la información del solicitante.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
    if (id) loadSolicitante(id);
    alert('Solicitante actualizado exitosamente');
  };

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center h-screen ${isDark ? 'bg-background' : 'bg-gray-50'}`}
      >
        <div
          className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDark ? 'border-red-700' : 'border-red-900'}`}
        ></div>
      </div>
    );
  }

  if (error || !solicitante) {
    return (
      <div
        className={`flex flex-col items-center justify-center h-screen gap-4 ${isDark ? 'bg-background' : 'bg-gray-50'}`}
      >
        <p className={`text-xl font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
          {error || 'Solicitante no encontrado'}
        </p>
        <Button onClick={() => navigate('/solicitantes')} variant="primary">
          Volver a la lista
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`w-screen h-screen overflow-hidden flex flex-col ${isDark ? 'bg-background' : 'bg-gray-50'}`}
    >
      <Header title="DETALLE DEL SOLICITANTE" onMenuClick={() => setIsSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-4xl mx-auto animate-fade-in-up">
          <Button
            variant="ghost"
            onClick={() => navigate('/solicitantes')}
            className={`mb-6 pl-0 hover:bg-transparent hover:text-red-900 ${isDark ? 'text-white' : 'text-gray-600'}`}
            icon={faArrowLeft}
          >
            Volver a la lista
          </Button>

          {isEditing ? (
            <div
              className={`${isDark ? 'bg-[#630000] border-red-800/50' : 'bg-white border-gray-200'} backdrop-blur-md border rounded-lg shadow-xl p-6 md:p-8`}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Editar Solicitante
                </h2>
                <Button variant="ghost" onClick={() => setIsEditing(false)} icon={faArrowLeft}>
                  Cancelar
                </Button>
              </div>
              <SolicitanteForm
                initialData={solicitante}
                onSuccess={handleEditSuccess}
                onCancel={() => setIsEditing(false)}
              />
            </div>
          ) : (
            <div
              className={`rounded-xl shadow-lg border overflow-hidden ${isDark ? 'bg-[#630000] border-red-800/50' : 'bg-white border-gray-100'}`}
            >
              {/* Header Section */}
              <div
                className={`${isDark ? 'bg-gradient-to-r from-red-900 to-red-800' : 'bg-gradient-to-r from-red-900 to-red-800'} p-8 text-white relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <FontAwesomeIcon icon={faUser} size="6x" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                      {solicitante.nombre} {solicitante.apellido}
                    </h1>
                    <div className="flex items-center gap-3 mt-2 text-red-100">
                      <FontAwesomeIcon icon={faAddressCard} />
                      <span className="text-lg font-medium">{solicitante.cedula}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-xs"
                    icon={faEdit}
                  >
                    Editar Informaci&oacute;n
                  </Button>
                </div>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Informacion Personal */}
                <section>
                  <h3
                    className={`flex items-center gap-2 text-lg font-bold mb-4 border-b pb-2 ${isDark ? 'text-white border-red-800/50' : 'text-gray-800 border-gray-200'}`}
                  >
                    <FontAwesomeIcon
                      icon={faUser}
                      className={isDark ? 'text-red-400' : 'text-red-900'}
                    />
                    Informaci&oacute;n Personal
                  </h3>
                  <dl className="grid grid-cols-1 gap-y-3 text-sm">
                    <div>
                      <dt className={isDark ? 'text-gray-300' : 'text-gray-500'}>
                        Fecha de Nacimiento
                      </dt>
                      <dd className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {solicitante.fechaNacimiento}
                      </dd>
                    </div>
                    <div>
                      <dt className={isDark ? 'text-gray-300' : 'text-gray-500'}>Sexo</dt>
                      <dd className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {solicitante.sexo}
                      </dd>
                    </div>
                    <div>
                      <dt className={isDark ? 'text-gray-300' : 'text-gray-500'}>Nacionalidad</dt>
                      <dd className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {solicitante.nacionalidad}
                      </dd>
                    </div>
                    <div>
                      <dt className={isDark ? 'text-gray-300' : 'text-gray-500'}>Estado Civil</dt>
                      <dd className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {solicitante.estadoCivil}
                        {solicitante.concubinato && (
                          <span
                            className={`text-xs ml-2 px-2 py-0.5 rounded-full ${isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-800'}`}
                          >
                            En Concubinato
                          </span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </section>

                {/* Contacto */}
                <section>
                  <h3
                    className={`flex items-center gap-2 text-lg font-bold mb-4 border-b pb-2 ${isDark ? 'text-white border-red-800/50' : 'text-gray-800 border-gray-200'}`}
                  >
                    <FontAwesomeIcon
                      icon={faPhone}
                      className={isDark ? 'text-red-400' : 'text-red-900'}
                    />
                    Contacto
                  </h3>
                  <dl className="grid grid-cols-1 gap-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        className={`${isDark ? 'text-gray-400' : 'text-gray-400'} mt-1`}
                      />
                      <div>
                        <dt className={`${isDark ? 'text-gray-300' : 'text-gray-500'} sr-only`}>
                          Email
                        </dt>
                        <dd className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {solicitante.email || 'N/A'}
                        </dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FontAwesomeIcon
                        icon={faPhone}
                        className={`${isDark ? 'text-gray-400' : 'text-gray-400'} mt-1`}
                      />
                      <div>
                        <dt className={isDark ? 'text-gray-300' : 'text-gray-500'}>
                          Tel&eacute;fono Celular
                        </dt>
                        <dd className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {solicitante.telfCelular || 'N/A'}
                        </dd>
                        <dt className={`${isDark ? 'text-gray-300' : 'text-gray-500'} mt-1`}>
                          Tel&eacute;fono Casa
                        </dt>
                        <dd className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {solicitante.telfCasa || 'N/A'}
                        </dd>
                      </div>
                    </div>
                  </dl>
                </section>

                {/* Laboral */}
                <section>
                  <h3
                    className={`flex items-center gap-2 text-lg font-bold mb-4 border-b pb-2 ${isDark ? 'text-white border-red-800/50' : 'text-gray-800 border-gray-200'}`}
                  >
                    <FontAwesomeIcon
                      icon={faBriefcase}
                      className={isDark ? 'text-red-400' : 'text-red-900'}
                    />
                    Informaci&oacute;n Laboral
                  </h3>
                  <dl className="grid grid-cols-1 gap-y-3 text-sm">
                    <div>
                      <dt className={isDark ? 'text-gray-300' : 'text-gray-500'}>
                        Trabaja actualmente
                      </dt>
                      <dd
                        className={`font-medium ${solicitante.trabaja ? (isDark ? 'text-green-400' : 'text-green-600') : isDark ? 'text-white' : 'text-gray-900'}`}
                      >
                        {solicitante.trabaja ? 'S\u00ED' : 'No'}
                      </dd>
                    </div>
                    {solicitante.trabaja && (
                      <div>
                        <dt className={isDark ? 'text-gray-300' : 'text-gray-500'}>
                          Condici&oacute;n
                        </dt>
                        <dd className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {solicitante.condicionTrabajo || 'N/A'}
                        </dd>
                      </div>
                    )}
                  </dl>
                </section>
              </div>

              {/* Encuesta Socioeconómica */}
              <div className={`border-t p-8 ${isDark ? 'border-red-800/50' : 'border-gray-100'}`}>
                <h3
                  className={`flex items-center gap-2 text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}
                >
                  <FontAwesomeIcon
                    icon={faFileAlt}
                    className={isDark ? 'text-red-400' : 'text-red-900'}
                  />
                  Encuesta Socioecon&oacute;mica
                </h3>
                {encuesta ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section>
                      <h4
                        className={`font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Datos Familiares
                      </h4>
                      <dl className="grid grid-cols-1 gap-y-2 text-sm">
                        <div
                          className={`flex justify-between border-b pb-1 ${isDark ? 'border-red-800/50' : 'border-gray-50'}`}
                        >
                          <dt className={isDark ? 'text-gray-300' : 'text-gray-500'}>
                            Cant. Personas
                          </dt>
                          <dd className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {encuesta.familia?.cantPersonas || 'N/A'}
                          </dd>
                        </div>
                        <div
                          className={`flex justify-between border-b pb-1 ${isDark ? 'border-red-800/50' : 'border-gray-50'}`}
                        >
                          <dt className={isDark ? 'text-gray-300' : 'text-gray-500'}>
                            Ingreso Mensual
                          </dt>
                          <dd className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {encuesta.familia?.ingresoMes || 'N/A'}
                          </dd>
                        </div>
                        <div
                          className={`flex justify-between border-b pb-1 ${isDark ? 'border-red-800/50' : 'border-gray-50'}`}
                        >
                          <dt className={isDark ? 'text-gray-300' : 'text-gray-500'}>
                            Es Jefe de Familia
                          </dt>
                          <dd className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {encuesta.familia?.jefeFamilia ? 'S\u00ED' : 'No'}
                          </dd>
                        </div>
                      </dl>
                    </section>
                    <section>
                      <h4
                        className={`font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Vivienda
                      </h4>
                      <dl className="grid grid-cols-1 gap-y-2 text-sm">
                        <div
                          className={`flex justify-between border-b pb-1 ${isDark ? 'border-red-800/50' : 'border-gray-50'}`}
                        >
                          <dt className={isDark ? 'text-gray-300' : 'text-gray-500'}>
                            Habitaciones
                          </dt>
                          <dd className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {encuesta.vivienda?.cantHabitaciones || 'N/A'}
                          </dd>
                        </div>
                        <div
                          className={`flex justify-between border-b pb-1 ${isDark ? 'border-red-800/50' : 'border-gray-50'}`}
                        >
                          <dt className={isDark ? 'text-gray-300' : 'text-gray-500'}>
                            Ba&ntilde;os
                          </dt>
                          <dd className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {encuesta.vivienda?.cantBanos || 'N/A'}
                          </dd>
                        </div>
                      </dl>
                    </section>
                  </div>
                ) : (
                  <p className={`italic ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    No hay encuesta registrada para este solicitante.
                  </p>
                )}
              </div>

              {/* Listado de Casos */}
              <div
                className={`p-8 border-t ${isDark ? 'bg-red-950/30 border-red-800/50' : 'bg-gray-50 border-gray-200'}`}
              >
                <h3
                  className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}
                >
                  <FontAwesomeIcon
                    icon={faBriefcase}
                    className={isDark ? 'text-red-400' : 'text-red-900'}
                  />
                  Historial de Casos
                </h3>

                {/* Casos como Solicitante */}
                <div className="mb-8">
                  <h4
                    className={`font-semibold text-lg mb-4 border-l-4 pl-3 ${isDark ? 'text-red-400 border-red-600' : 'text-red-800 border-red-800'}`}
                  >
                    Como Solicitante (Titular)
                  </h4>
                  {casosTitular.length > 0 ? (
                    <div
                      className={`overflow-x-auto rounded-lg shadow-xs border ${isDark ? 'bg-[#630000] border-red-800/50' : 'bg-white border-gray-200'}`}
                    >
                      <table className="min-w-full divide-y divide-border">
                        <thead className={isDark ? 'bg-red-950/30' : 'bg-gray-50'}>
                          <tr>
                            <th
                              className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}
                            >
                              Caso #
                            </th>
                            <th
                              className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}
                            >
                              Fecha
                            </th>
                            <th
                              className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}
                            >
                              S&iacute;ntesis
                            </th>
                            <th
                              className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}
                            >
                              Estatus
                            </th>
                          </tr>
                        </thead>
                        <tbody
                          className={`divide-y divide-border ${isDark ? 'bg-[#630000]' : 'bg-white'}`}
                        >
                          {casosTitular.map((caso) => (
                            <tr
                              key={caso.numCaso}
                              className={`cursor-pointer ${isDark ? 'hover:bg-red-950/50' : 'hover:bg-gray-50'}`}
                              onClick={() => navigate(`/casos/${caso.numCaso}`)}
                            >
                              <td
                                className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${isDark ? 'text-red-400' : 'text-red-900'}`}
                              >
                                {caso.numCaso}
                              </td>
                              <td
                                className={`px-4 py-3 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}
                              >
                                {caso.fechaRecepcion}
                              </td>
                              <td
                                className={`px-4 py-3 text-sm max-w-xs truncate ${isDark ? 'text-gray-300' : 'text-gray-500'}`}
                              >
                                {caso.sintesis}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${caso.estatus === 'ABIERTO' ? (isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800') : isDark ? 'bg-gray-800/50 text-gray-300' : 'bg-gray-100 text-gray-800'}`}
                                >
                                  {caso.estatus}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className={`text-sm italic ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      No tiene casos registrados como titular.
                    </p>
                  )}
                </div>

                {/* Casos como Beneficiario */}
                <div>
                  <h4
                    className={`font-semibold text-lg mb-4 border-l-4 pl-3 ${isDark ? 'text-blue-400 border-blue-600' : 'text-blue-800 border-blue-800'}`}
                  >
                    Como Beneficiario
                  </h4>
                  {casosBeneficiario.length > 0 ? (
                    <div
                      className={`overflow-x-auto rounded-lg shadow-xs border ${isDark ? 'bg-[#630000] border-red-800/50' : 'bg-white border-gray-200'}`}
                    >
                      <table className="min-w-full divide-y divide-border">
                        <thead className={isDark ? 'bg-red-950/30' : 'bg-gray-50'}>
                          <tr>
                            <th
                              className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}
                            >
                              Caso #
                            </th>
                            <th
                              className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}
                            >
                              Fecha
                            </th>
                            <th
                              className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}
                            >
                              S&iacute;ntesis
                            </th>
                            <th
                              className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}
                            >
                              Estatus
                            </th>
                          </tr>
                        </thead>
                        <tbody
                          className={`divide-y divide-border ${isDark ? 'bg-[#630000]' : 'bg-white'}`}
                        >
                          {casosBeneficiario.map((caso) => (
                            <tr
                              key={caso.numCaso}
                              className={`cursor-pointer ${isDark ? 'hover:bg-red-950/50' : 'hover:bg-gray-50'}`}
                              onClick={() => navigate(`/casos/${caso.numCaso}`)}
                            >
                              <td
                                className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${isDark ? 'text-red-400' : 'text-red-900'}`}
                              >
                                {caso.numCaso}
                              </td>
                              <td
                                className={`px-4 py-3 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}
                              >
                                {caso.fechaRecepcion}
                              </td>
                              <td
                                className={`px-4 py-3 text-sm max-w-xs truncate ${isDark ? 'text-gray-300' : 'text-gray-500'}`}
                              >
                                {caso.sintesis}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${caso.estatus === 'ABIERTO' ? (isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800') : isDark ? 'bg-gray-800/50 text-gray-300' : 'bg-gray-100 text-gray-800'}`}
                                >
                                  {caso.estatus}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className={`text-sm italic ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      No tiene casos registrados como beneficiario.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
