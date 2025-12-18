import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import type { FormDataRegistro } from '../types/tipos';
import { useLocalStorage } from '../hooks/useLocalStorage';

// ⏰ CONFIGURACIÓN DE EXPIRACIÓN: Cambia este valor para ajustar cuánto tiempo se guardan los datos
// Valores comunes:
// - 1 hora: 1 * 60 * 60 * 1000
// - 1 día: 1 * 24 * 60 * 60 * 1000
// - 3 días: 3 * 24 * 60 * 60 * 1000
// - 7 días: 7 * 24 * 60 * 60 * 1000
// - 30 días: 30 * 24 * 60 * 60 * 1000
// - Sin expiración: Infinity (no recomendado)
const EXPIRATION_TIME_MS = 1 * 60 * 60 * 1000; // 1 hora en milisegundos

const initialFormData: FormDataRegistro = {
  nombresApellidos: '',
  ci: '',
  sexo: '',
  estadoCivil: '',
  fechaNacimiento: '',
  concubinato: false,
  nacionalidad: '',
  trabaja: false,
  condicionTrabajo: '',
  telefonoLocal: '',
  telefonoPersonal: '',
  correoElectronico: '',
  comunidadResidencia: '',
  parroquiaResidencia: '',
  tipoVivienda: '',
  personasVivienda: '',
  miembrosTrabajan: '',
  ninosEntre7y12: '',
  jefeHogar: false,
};

function Registro() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Usar el hook personalizado para manejar localStorage
  const [formData, setFormData, clearFormData] = useLocalStorage<FormDataRegistro>(
    'formDataRegistroBeneficiarios',
    initialFormData,
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

  // Validación para campos que no deben tener números
  const validateTextOnly = (value: string): boolean => {
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/.test(value);
  };

  // Validación para números enteros positivos
  const validatePositiveInteger = (value: string): boolean => {
    return /^\d*$/.test(value) && parseInt(value || '0') >= 0;
  };

  // Validación solo para dígitos (permite cadenas vacías)
  const validateNumericOnly = (value: string): boolean => {
    return /^\d*$/.test(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Campos que solo deben aceptar letras (sin números)
    const textOnlyFields = ['nombresApellidos', 'comunidadResidencia', 'parroquiaResidencia'];

    // Campos numéricos (enteros positivos sin decimales)
    const numericFields = ['personasVivienda', 'miembrosTrabajan', 'ninosEntre7y12'];

    // Campos que solo aceptan dígitos (como cédula)
    const digitOnlyFields = ['ci'];

    // Validar campos de solo texto
    if (textOnlyFields.includes(name) && !validateTextOnly(value)) {
      return; // No actualizar si tiene números
    }

    // Validar campos numéricos
    if (numericFields.includes(name) && !validatePositiveInteger(value)) {
      return; // No actualizar si no es entero positivo
    }

    // Validar campos que solo aceptan dígitos
    if (digitOnlyFields.includes(name) && !validateNumericOnly(value)) {
      return; // No actualizar si contiene caracteres no numéricos
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRadioChange = (name: keyof FormDataRegistro, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Datos del formulario:', formData);
    // Aquí irá la lógica para enviar los datos a la API

    // Limpiar datos guardados después de enviar exitosamente
    // TODO: Descomentar cuando la API responda exitosamente
    // clearFormData();
  };

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col">
      <Header title="REGISTRO DE BENEFICIARIOS" onMenuClick={handleMenuClick} />
      <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />

      <main className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Botones de navegación superiores */}
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              className="flex-1 py-4 rounded-lg font-bold text-lg transition-all duration-200 bg-red-900 text-white shadow-lg"
            >
              Registro de Beneficiarios
            </button>
            <button
              type="button"
              onClick={() => navigate('/registro-caso')}
              className="flex-1 py-4 rounded-lg font-bold text-lg transition-all duration-200 bg-white text-gray-700 hover:bg-gray-100 shadow"
            >
              Registro de Casos
            </button>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            {/* Datos personales */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-6">Datos personales</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombres y apellidos */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Nombres y apellidos</label>
                  <input
                    type="text"
                    name="nombresApellidos"
                    value={formData.nombresApellidos}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                    required
                  />
                </div>

                {/* C.I */}
                <div>
                  <label className="block text-sm font-semibold mb-2">C.I</label>
                  <input
                    type="text"
                    name="ci"
                    value={formData.ci}
                    onChange={handleInputChange}
                    placeholder="Ej: 12345678"
                    maxLength={8}
                    pattern="\d+"
                    title="Ingrese solo números"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                    required
                  />
                </div>

                {/* Sexo */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Sexo</label>
                  <select
                    name="sexo"
                    value={formData.sexo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                  </select>
                </div>

                {/* Estado civil */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Estado civil</label>
                  <select
                    name="estadoCivil"
                    value={formData.estadoCivil}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar</option>
                    <option value="soltero">Soltero(a)</option>
                    <option value="casado">Casado(a)</option>
                    <option value="divorciado">Divorciado(a)</option>
                    <option value="viudo">Viudo(a)</option>
                  </select>
                </div>

                {/* Fecha nacimiento */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Fecha nacimiento</label>
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                    required
                  />
                </div>

                {/* Concubinato */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Concubinato</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="concubinato"
                        checked={formData.concubinato === true}
                        onChange={() => handleRadioChange('concubinato', true)}
                        className="w-5 h-5 text-red-900 focus:ring-red-900"
                      />
                      <span>Sí</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="concubinato"
                        checked={formData.concubinato === false}
                        onChange={() => handleRadioChange('concubinato', false)}
                        className="w-5 h-5 text-red-900 focus:ring-red-900"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                {/* Nacionalidad */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Nacionalidad</label>
                  <select
                    name="nacionalidad"
                    value={formData.nacionalidad}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar</option>
                    <option value="venezolana">Venezolana</option>
                    <option value="extranjera">Extranjera</option>
                  </select>
                </div>

                {/* Trabaja */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Trabaja</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="trabaja"
                        checked={formData.trabaja === true}
                        onChange={() => handleRadioChange('trabaja', true)}
                        className="w-5 h-5 text-red-900 focus:ring-red-900"
                      />
                      <span>Sí</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="trabaja"
                        checked={formData.trabaja === false}
                        onChange={() => handleRadioChange('trabaja', false)}
                        className="w-5 h-5 text-red-900 focus:ring-red-900"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                {/* Condición trabajo */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Condición trabajo</label>
                  <select
                    name="condicionTrabajo"
                    value={formData.condicionTrabajo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                    disabled={!formData.trabaja}
                  >
                    <option value="">Seleccionar</option>
                    <option value="formal">Formal</option>
                    <option value="informal">Informal</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Datos de contacto y residencia */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Datos de contacto */}
              <section>
                <h2 className="text-2xl font-bold mb-6">Datos de contacto</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Teléfono local</label>
                    <input
                      type="tel"
                      name="telefonoLocal"
                      value={formData.telefonoLocal}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Teléfono Personal</label>
                    <input
                      type="tel"
                      name="telefonoPersonal"
                      value={formData.telefonoPersonal}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Correo electrónico</label>
                    <input
                      type="email"
                      name="correoElectronico"
                      value={formData.correoElectronico}
                      onChange={handleInputChange}
                      pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                      title="Ingrese un correo electrónico válido (ejemplo: usuario@dominio.com)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                    />
                  </div>
                </div>
              </section>

              {/* Datos de residencia */}
              <section>
                <h2 className="text-2xl font-bold mb-6">Datos de residencia</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Comunidad de residencia
                    </label>
                    <input
                      type="text"
                      name="comunidadResidencia"
                      value={formData.comunidadResidencia}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Parroquia de residencia
                    </label>
                    <input
                      type="text"
                      name="parroquiaResidencia"
                      value={formData.parroquiaResidencia}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Tipo de vivienda</label>
                    <select
                      name="tipoVivienda"
                      value={formData.tipoVivienda}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                      required
                    >
                      <option value="">Seleccionar</option>
                      <option value="propia">Propia</option>
                      <option value="alquilada">Alquilada</option>
                      <option value="prestada">Prestada</option>
                      <option value="otra">Otra</option>
                    </select>
                  </div>
                </div>
              </section>
            </div>

            {/* Familia y hogar */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-6">Familia y hogar</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    ¿Cuántas personas viven en la vivienda? (incluyendolo a usted)
                  </label>
                  <input
                    type="number"
                    name="personasVivienda"
                    value={formData.personasVivienda}
                    onChange={handleInputChange}
                    onKeyDown={(e) =>
                      ['-', '+', 'e', 'E', '.', ','].includes(e.key) && e.preventDefault()
                    }
                    min="1"
                    step="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    ¿Cuántos miembros del hogar trabajan?
                  </label>
                  <input
                    type="number"
                    name="miembrosTrabajan"
                    value={formData.miembrosTrabajan}
                    onChange={handleInputChange}
                    onKeyDown={(e) =>
                      ['-', '+', 'e', 'E', '.', ','].includes(e.key) && e.preventDefault()
                    }
                    min="0"
                    step="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Número de Niños entre 7 y 12 años en el hogar:
                  </label>
                  <input
                    type="number"
                    name="ninosEntre7y12"
                    value={formData.ninosEntre7y12}
                    onChange={handleInputChange}
                    onKeyDown={(e) =>
                      ['-', '+', 'e', 'E', '.', ','].includes(e.key) && e.preventDefault()
                    }
                    min="0"
                    step="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    ¿Es usted jefe del hogar?
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="jefeHogar"
                        checked={formData.jefeHogar === true}
                        onChange={() => handleRadioChange('jefeHogar', true)}
                        className="w-5 h-5 text-red-900 focus:ring-red-900"
                      />
                      <span>Sí</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="jefeHogar"
                        checked={formData.jefeHogar === false}
                        onChange={() => handleRadioChange('jefeHogar', false)}
                        className="w-5 h-5 text-red-900 focus:ring-red-900"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* Botón de enviar */}
            {/* Botón de enviar */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-8 py-3 bg-red-900 text-white rounded-lg font-semibold hover:bg-red-800 transition-colors duration-200"
              >
                Registrar Beneficiario
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Registro;
