import { useState, useEffect } from 'react';
import type { SolicitanteRequest, Estado, Municipio, Parroquia, EstadoCivil } from '../../types'; // Importando todo desde el index
import solicitanteService from '../../services/solicitanteService';
import catalogoService from '../../services/catalogoService';
import CustomSelect from '../common/CustomSelect';
import CustomDatePicker from '../common/CustomDatePicker';

const initialFormData: SolicitanteRequest = {
    nombre: '',
    cedula: '',
    sexo: '',
    idEstadoCivil: 0,
    fechaNacimiento: '',
    concubinato: false,
    nacionalidad: '',
    telfCasa: '',
    telfCelular: '',
    email: '',
    idParroquia: 0,
};

interface SolicitanteFormProps {
    initialData?: Partial<SolicitanteRequest>;
    onSuccess?: (data: any) => void;
    onCancel?: () => void;
    isModal?: boolean;
    embedded?: boolean;
    simplifiedMode?: boolean;
}

export default function SolicitanteForm({ initialData, onSuccess, onCancel, isModal = false, embedded = false, simplifiedMode = false }: SolicitanteFormProps) {
    const [formData, setFormData] = useState<SolicitanteRequest>({
        ...initialFormData,
        ...initialData,
    });

    // Estados para catálogos de ubicación
    const [estados, setEstados] = useState<Estado[]>([]);
    const [municipios, setMunicipios] = useState<Municipio[]>([]);
    const [parroquias, setParroquias] = useState<Parroquia[]>([]);
    const [estadosCiviles, setEstadosCiviles] = useState<EstadoCivil[]>([]);

    const [selectedEstado, setSelectedEstado] = useState<number>(0);
    const [selectedMunicipio, setSelectedMunicipio] = useState<number>(0);
    const [selectedParroquia, setSelectedParroquia] = useState<number>(0);

    // Cargar Catálogos al montar (Preloading)
    useEffect(() => {
        const loadCatalogos = async () => {
            try {
                const [
                    estadosData,
                    municipiosData,
                    parroquiasData,
                    estadosCivilesData
                ] = await Promise.all([
                    catalogoService.getEstados(),
                    catalogoService.getAllMunicipios(),
                    catalogoService.getAllParroquias(),
                    catalogoService.getEstadosCiviles()
                ]);

                setEstados(estadosData);
                setMunicipios(municipiosData);
                setParroquias(parroquiasData);
                setEstadosCiviles(estadosCivilesData);
            } catch (error) {
                console.error("Error al cargar catálogos", error);
            }
        };

        loadCatalogos();
    }, []);

    const handleEstadoChange = (idEstado: number) => {
        setSelectedEstado(idEstado);
        setSelectedMunicipio(0);
        setSelectedParroquia(0);
        // Ya no necesitamos limpiar estados de municipios/parroquias porque filtramos en render
    };

    const handleMunicipioChange = (idMunicipio: number) => {
        setSelectedMunicipio(idMunicipio);
        setSelectedParroquia(0);
    };

    // Filtros derivados
    const filteredMunicipios = municipios.filter(m => m.idEstado === selectedEstado);
    const filteredParroquias = parroquias.filter(p => p.idMunicipio === selectedMunicipio);

    const handleParroquiaChange = (idParroquia: number) => {
        setSelectedParroquia(idParroquia);
        setFormData(prev => ({
            ...prev,
            idParroquia: idParroquia
        }));
    };

    // Si initialData cambia (ej: se prellena cedula), actualizar form
    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        }
    }, [initialData]);

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
        const textOnlyFields = ['nombre'];

        // Campos numéricos (enteros positivos sin decimales)
        const numericFields: string[] = [];

        // Campos que solo aceptan dígitos (como cédula)
        const digitOnlyFields = ['cedula'];

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



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            console.log('Enviando datos del solicitante:', formData);
            const result = await solicitanteService.create(formData);
            console.log('Solicitante registrado:', result);

            if (onSuccess) {
                // Return formData because backend only returns a string message
                onSuccess(formData);
            }
        } catch (error) {
            console.error('Error al registrar solicitante:', error);
            alert('Error al registrar el solicitante. Por favor verifique los datos.');
        }
    };

    // Helper for conditional required
    const isStrict = !simplifiedMode;

    return (
        <form onSubmit={handleSubmit} className={`${(!isModal && !embedded) ? "bg-white rounded-lg shadow-lg p-6 md:p-8" : ""}`}>
            {/* Datos personales */}
            <section className="mb-8">
                <h2 className="text-2xl font-bold mb-6">Datos personales</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* C.I */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            C.I <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="cedula"
                            value={formData.cedula}
                            onChange={handleInputChange}
                            placeholder="Ej: 12345678"
                            maxLength={8}
                            pattern="\d+"
                            title="Ingrese solo números"
                            disabled={isModal}
                            className={`w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent ${isModal ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            required
                        />
                    </div>
                    
                    {/* Nombres y apellidos */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Nombres y apellidos <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                            required
                        />
                    </div>



                    {/* Sexo */}
                    <div>
                        <CustomSelect
                            label="Sexo"
                            value={formData.sexo}
                            options={[
                                { value: 'Masculino', label: 'Masculino' },
                                { value: 'Femenino', label: 'Femenino' }
                            ]}
                            onChange={(val) => setFormData(prev => ({ ...prev, sexo: String(val) }))}
                            required
                        />
                    </div>

                    {/* Estado civil */}
                    <div>
                        <CustomSelect
                            label="Estado civil"
                            value={formData.idEstadoCivil}
                            options={estadosCiviles.map(ec => ({ value: ec.idEstadoCivil, label: ec.nombreEstadoCivil }))}
                            onChange={(val) => setFormData(prev => ({ ...prev, idEstadoCivil: Number(val) }))}
                            required={isStrict}
                        />
                    </div>

                    {/* Fecha nacimiento */}
                    <div>
                        <CustomDatePicker
                            label={<span>Fecha nacimiento {isStrict && <span className="text-red-500">*</span>}</span>}
                            value={formData.fechaNacimiento}
                            onChange={(val) => setFormData(prev => ({ ...prev, fechaNacimiento: val }))}
                            required={isStrict}
                        />
                    </div>

                    {/* Concubinato */}
                    <div>
                        <CustomSelect
                            label="¿Vive en concubinato?"
                            value={formData.concubinato ? 'Si' : 'No'}
                            options={[
                                { value: 'Si', label: 'Sí' },
                                { value: 'No', label: 'No' },
                            ]}
                            onChange={(val) => setFormData(prev => ({ ...prev, concubinato: val === 'Si' }))}
                        />
                    </div>

                    {/* Nacionalidad */}
                    <div>
                        <CustomSelect
                            label={<span>Nacionalidad {isStrict && <span className="text-red-500">*</span>}</span>}
                            value={formData.nacionalidad}
                            options={[
                                { value: 'Venezolano', label: 'Venezolano' },
                                { value: 'Extranjero', label: 'Extranjero' }
                            ]}
                            onChange={(val) => setFormData(prev => ({ ...prev, nacionalidad: String(val) }))}
                            required={isStrict}
                        />
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
                                name="telfCasa"
                                value={formData.telfCasa}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Teléfono Personal {isStrict && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type="tel"
                                name="telfCelular"
                                value={formData.telfCelular}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                                required={isStrict}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">Correo electrónico</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                                title="Ingrese un correo electrónico válido (ejemplo: usuario@dominio.com)"
                                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                            />
                        </div>
                    </div>
                </section>

                {/* Datos de residencia */}
                <section>
                    <h2 className="text-2xl font-bold mb-6">Datos de residencia</h2>
                    <div className="space-y-4">

                        {/* Selectores de Ubicación en Cascada */}
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <CustomSelect
                                    label={<span>Estado {isStrict && <span className="text-red-500">*</span>}</span>}
                                    value={selectedEstado || ''}
                                    options={estados.map(e => ({ value: e.idEstado, label: e.nombreEstado }))}
                                    onChange={(val) => handleEstadoChange(Number(val))}
                                    required={isStrict}
                                />
                            </div>

                            <div>
                                <CustomSelect
                                    label={<span>Municipio {isStrict && <span className="text-red-500">*</span>}</span>}
                                    value={selectedMunicipio || ''}
                                    options={filteredMunicipios.map(m => ({ value: m.idMunicipio, label: m.nombreMunicipio }))}
                                    onChange={(val) => handleMunicipioChange(Number(val))}
                                    disabled={!selectedEstado}
                                    required={isStrict}
                                />
                            </div>

                            <div>
                                <CustomSelect
                                    label={<span>Parroquia {isStrict && <span className="text-red-500">*</span>}</span>}
                                    value={selectedParroquia || ''}
                                    options={filteredParroquias.map(p => ({ value: p.idParroquia, label: p.nombreParroquia }))}
                                    onChange={(val) => handleParroquiaChange(Number(val))}
                                    disabled={!selectedMunicipio}
                                    required={isStrict}
                                />
                            </div>
                        </div>

                    </div>
                </section>
            </div>

            {/* Botón de enviar */}
            <div className="flex justify-end gap-4">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-8 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors duration-200"
                    >
                        Cancelar
                    </button>
                )}
                <button
                    type="submit"
                    className="px-8 py-3 bg-red-900 text-white rounded-lg font-semibold hover:bg-red-800 transition-colors duration-200"
                >
                    {isModal ? 'Guardar Solicitante' : 'Registrar Beneficiario'}
                </button>
            </div>
        </form>
    );
}
