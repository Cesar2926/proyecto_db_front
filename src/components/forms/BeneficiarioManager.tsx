import { useState } from 'react';
import { Search, Plus, Trash2, Users } from 'lucide-react';
import solicitanteService from '../../services/solicitanteService';
import Modal from '../common/Modal';
import SolicitanteForm from './SolicitanteForm';
import type { BeneficiarioCreateRequest } from '../../types/caso';

interface BeneficiarioManagerProps {
    beneficiarios: BeneficiarioCreateRequest[];
    onBeneficiariosChange: (beneficiarios: BeneficiarioCreateRequest[]) => void;
}

export default function BeneficiarioManager({ beneficiarios, onBeneficiariosChange }: BeneficiarioManagerProps) {
    // Search State
    const [cedulaSearch, setCedulaSearch] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [foundPerson, setFoundPerson] = useState<any | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    // Form State for Link
    const [parentesco, setParentesco] = useState('');
    const [tipoBeneficiario, setTipoBeneficiario] = useState('');

    // Modal State for New Person
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Dictionaries for labels (simplificado)
    const TIPO_BENEFICIARIO_OPTIONS = [
        { value: 'DIRECTO', label: 'Directo' },
        { value: 'INDIRECTO', label: 'Indirecto' },
    ];

    const handleSearch = async () => {
        if (!cedulaSearch.trim()) return;

        setIsSearching(true);
        setErrorMessage('');
        setFoundPerson(null);

        try {
            const data = await solicitanteService.getByCedula(cedulaSearch);
            if (data) {
                // Check if already added
                const alreadyAdded = beneficiarios.some(b => b.cedula === data.cedula);
                if (alreadyAdded) {
                    setErrorMessage('Esta persona ya ha sido agregada como beneficiario.');
                } else {
                    setFoundPerson(data);
                }
            }
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                setErrorMessage('Persona no encontrada. Puede registrarla nueva.');
            } else {
                setErrorMessage('Error al buscar persona.');
            }
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddBeneficiario = () => {
        if (!foundPerson || !parentesco || !tipoBeneficiario) return;

        const newBeneficiario: BeneficiarioCreateRequest = {
            cedula: foundPerson.cedula,
            parentesco: parentesco,
            tipoBeneficiario: tipoBeneficiario,
            nombre: foundPerson.nombre
        };

        onBeneficiariosChange([...beneficiarios, newBeneficiario]);

        // Reset local state
        setFoundPerson(null);
        setCedulaSearch('');
        setParentesco('');
        setTipoBeneficiario('');
        setErrorMessage('');
    };



    const handleRemoveBeneficiario = (cedula: string) => {
        onBeneficiariosChange(beneficiarios.filter(b => b.cedula !== cedula));
    };

    const handleNewPersonCreated = (newPerson: any) => {
        setIsModalOpen(false);
        setFoundPerson(newPerson);
        setCedulaSearch(newPerson.cedula);
    };

    return (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users size={20} />
                Beneficiarios del Caso
            </h3>

            {/* Search Area */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 items-start">
                <div className="flex-1 w-full">
                    <label className="block text-sm text-gray-600 mb-1">Buscar por Cédula</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={cedulaSearch}
                            onChange={(e) => setCedulaSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSearch();
                                }
                            }}
                            placeholder="Cédula"
                            className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-900 focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={handleSearch}
                            disabled={isSearching}
                            className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
                            title="Buscar"
                        >
                            <Search size={20} />
                        </button>
                    </div>
                    {errorMessage && (
                        <div className="mt-2 text-sm text-red-600 flex items-center gap-2">
                            <span>{errorMessage}</span>
                            {errorMessage.includes('no encontrada') && (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="text-red-800 underline font-semibold hover:text-red-900"
                                >
                                    Registrar Nuevo
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Found Person - Add Details Form */}
            {foundPerson && (
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border-l-4 border-green-500 animate-fade-in">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h4 className="font-bold text-gray-800">{foundPerson.nombre}</h4>
                            <p className="text-sm text-gray-600">C.I: {foundPerson.cedula}</p>
                        </div>
                        <button
                            onClick={() => setFoundPerson(null)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            x
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Parentesco</label>
                            <input
                                type="text"
                                value={parentesco}
                                onChange={(e) => setParentesco(e.target.value)}
                                placeholder="Ej. Hijo, Cónyuge"
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tipo Beneficiario</label>
                            <select
                                value={tipoBeneficiario}
                                onChange={(e) => setTipoBeneficiario(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none bg-white"
                            >
                                <option value="">Seleccione...</option>
                                {TIPO_BENEFICIARIO_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={handleAddBeneficiario}
                            disabled={!parentesco || !tipoBeneficiario}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 transition-colors"
                        >
                            <Plus size={18} />
                            Agregar al Caso
                        </button>
                    </div>
                </div>
            )}

            {/* List of Added Beneficiaries */}
            <div className="mt-8 border-t border-gray-200 pt-6">
                <h4 className="text-sm font-bold text-gray-700 uppercase mb-4 flex items-center gap-2">
                    <Users size={18} className="text-red-900" />
                    Beneficiarios Agregados al Caso <span className="text-sm font-normal text-gray-500">({beneficiarios.length})</span>
                </h4>

                {beneficiarios.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <Users className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                        <p className="text-sm font-medium text-gray-500">No se han agregado beneficiarios al caso.</p>
                        <p className="text-xs text-gray-400 mt-1">Busque una persona por cédula arriba y agréguela a la lista.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {beneficiarios.map((b, index) => (
                            <div key={index} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-900 font-bold text-lg border border-red-200">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-base">{b.nombre || 'Nombre no disponible'}</p>
                                        <div className="flex flex-wrap gap-x-4 text-sm text-gray-600 mt-1 items-center">
                                            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-semibold text-gray-700">C.I: {b.cedula}</span>
                                            <span className="flex items-center gap-1 text-xs">
                                                <span className="font-medium text-gray-500">Parentesco:</span> {b.parentesco}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs">
                                                <span className="font-medium text-gray-500">Tipo:</span> {b.tipoBeneficiario}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveBeneficiario(b.cedula)}
                                    className="p-2 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-full transition-all"
                                    title="Eliminar Beneficiario"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal for New Person */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Registrar Nuevo Beneficiario (Persona)"
            >
                <SolicitanteForm
                    isModal={true}
                    simplifiedMode={true}
                    initialData={{ cedula: cedulaSearch }}
                    onSuccess={handleNewPersonCreated}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
