import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faArrowLeft, faTimes, faFileAlt, faEye } from '@fortawesome/free-solid-svg-icons';

import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import SolicitanteForm from '../components/forms/SolicitanteForm';
import EncuestaForm from '../components/forms/EncuestaForm';
import SolicitanteCard from '../components/SolicitanteCard';
import Pagination from '../components/common/Pagination';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';
import ViewToggle from '../components/common/ViewToggle';
import CustomSelect from '../components/common/CustomSelect';
import solicitanteService from '../services/solicitanteService';
import type { SolicitanteResponse } from '../types/solicitante';

function Solicitantes() {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Encuesta Modal State
    const [showEncuesta, setShowEncuesta] = useState(false);
    const [selectedCedula, setSelectedCedula] = useState<string | null>(null);

    // Data State
    const [solicitantes, setSolicitantes] = useState<SolicitanteResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');

    const [filterActiveCases, setFilterActiveCases] = useState(false);
    const [filterRole, setFilterRole] = useState('TODOS');

    // Pagination & View Mode
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOption, setSortOption] = useState<string>('nombre_asc');
    const itemsPerPage = 8;

    const handleMenuClick = () => setIsSidebarOpen(true);
    const handleCloseSidebar = () => setIsSidebarOpen(false);

    const fetchSolicitantes = async () => {
        setLoading(true);
        try {
            const data = await solicitanteService.getAll(filterActiveCases, filterRole);
            setSolicitantes(data);
        } catch (error) {
            console.error('Error cargando solicitantes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!showForm && !showEncuesta) {
            fetchSolicitantes();
        }
    }, [showForm, showEncuesta, filterActiveCases, filterRole]);

    const handleSuccess = (data: any) => {
        console.log('Registro exitoso:', data);
        alert('Solicitante registrado exitosamente');
        setShowForm(false);
    };

    const handleEncuestaClick = (cedula: string) => {
        setSelectedCedula(cedula);
        setShowEncuesta(true);
    };

    const handleEncuestaClose = () => {
        setShowEncuesta(false);
        setSelectedCedula(null);
    };

    const handleCardClick = (solicitante: SolicitanteResponse) => {
        navigate(`/solicitantes/${solicitante.cedula}`);
    };

    const filteredSolicitantes = solicitantes.filter(s => {
        if (!searchText) return true;
        const term = searchText.toLowerCase();
        const nombreCompleto = `${s.nombre} ${s.apellido || ''}`.toLowerCase();
        return nombreCompleto.includes(term) || s.cedula.includes(term);
    });

    // Sorting Logic
    const sortedSolicitantes = [...filteredSolicitantes].sort((a, b) => {
        if (sortOption === 'nombre_asc') {
            return (a.nombre || '').localeCompare(b.nombre || '');
        } else if (sortOption === 'nombre_desc') {
            return (b.nombre || '').localeCompare(a.nombre || '');
        } else if (sortOption === 'cedula_asc') {
            return a.cedula.localeCompare(b.cedula);
        } else if (sortOption === 'cedula_desc') {
            return b.cedula.localeCompare(a.cedula);
        }
        return 0;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedSolicitantes.slice(indexOfFirstItem, indexOfLastItem);

    const sortOptions = [
        { value: 'nombre_asc', label: 'Nombre (A-Z)' },
        { value: 'nombre_desc', label: 'Nombre (Z-A)' },
        { value: 'cedula_asc', label: 'Cédula (Asc)' },
        { value: 'cedula_desc', label: 'Cédula (Desc)' }
    ];

    const roleOptions = [
        { value: 'TODOS', label: 'Todos' },
        { value: 'SOLICITANTE', label: 'Solicitante' },
        { value: 'BENEFICIARIO', label: 'Beneficiario' }
    ];

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchText]);

    return (
        <div className="w-screen h-screen overflow-hidden flex flex-col">
            <Header title="GESTIÓN DE SOLICITANTES Y BENEFICIARIOS" onMenuClick={handleMenuClick} />
            <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />

            <main className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-8">
                <div className="max-w-7xl mx-auto">

                    {showForm ? (
                        // FORMULARIO DE REGISTRO
                        <div className="animate-fade-in-up">
                            <Button
                                variant="ghost"
                                onClick={() => setShowForm(false)}
                                className="mb-6 pl-0 hover:bg-transparent hover:text-red-900 text-gray-600"
                                icon={faArrowLeft}
                            >
                                Volver a la lista
                            </Button>
                            <div className="bg-white/90 backdrop-blur-md border border-white/20 rounded-lg shadow-xl p-6 md:p-8">
                                <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Nuevo Solicitante</h2>
                                <SolicitanteForm onSuccess={handleSuccess} />
                            </div>
                        </div>
                    ) : (
                        // LISTA DE SOLICITANTES
                        <>
                            {/* Toolbar */}
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                {/* Buscador */}
                                <div className="w-full md:w-1/3">
                                    <SearchBar
                                        value={searchText}
                                        onChange={setSearchText}
                                        placeholder="Buscar por nombre o cédula..."
                                    />
                                    <div className="mt-2 flex items-center">
                                        <input
                                            type="checkbox"
                                            id="activeCasesFilter"
                                            checked={filterActiveCases}
                                            onChange={(e) => setFilterActiveCases(e.target.checked)}
                                            className="h-4 w-4 text-red-900 border-gray-300 rounded focus:ring-red-900 cursor-pointer"
                                        />
                                        <label htmlFor="activeCasesFilter" className="ml-2 text-sm text-gray-700 cursor-pointer select-none">
                                            Solo con casos activos
                                        </label>
                                    </div>
                                </div>

                                {/* Filter Role */}
                                <div className="w-48">
                                    <CustomSelect
                                        value={filterRole}
                                        options={roleOptions}
                                        onChange={setFilterRole}
                                        placeholder="Filtrar por tipo..."
                                    />
                                </div>

                                {/* Sorting */}
                                <div className="w-48">
                                    <CustomSelect
                                        value={sortOption}
                                        options={sortOptions}
                                        onChange={setSortOption}
                                        placeholder="Ordenar por..."
                                    />
                                </div>

                                {/* View Mode Toggle */}
                                <div className="hidden md:flex">
                                    <ViewToggle
                                        viewMode={viewMode}
                                        onToggle={setViewMode}
                                    />
                                </div>

                                {/* Botón Nuevo */}
                                <Button
                                    variant="primary"
                                    onClick={() => setShowForm(true)}
                                    icon={faPlus}
                                    className="w-full md:w-auto shadow-md"
                                >
                                    Nuevo Solicitante
                                </Button>
                            </div>

                            {/* Grid/List de Resultados */}
                            {loading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="flex flex-col items-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-900 mb-4"></div>
                                        <p className="text-gray-600">Cargando solicitantes...</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {filteredSolicitantes.length === 0 ? (
                                        <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
                                            <p className="text-gray-500 text-lg">No se encontraron solicitantes.</p>
                                            {searchText && (
                                                <Button
                                                    variant="link"
                                                    onClick={() => setSearchText('')}
                                                    className="mt-2"
                                                >
                                                    Limpiar búsqueda
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-6">
                                            {viewMode === 'grid' ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                                    {currentItems.map((sol) => (
                                                        <SolicitanteCard
                                                            key={sol.cedula}
                                                            solicitante={sol}
                                                            onClick={() => handleCardClick(sol)}
                                                            onEncuestaClick={() => handleEncuestaClick(sol.cedula)}
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitante</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cédula</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado Civil</th>
                                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {currentItems.map((sol) => (
                                                                <tr key={sol.cedula} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleCardClick(sol)}>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className="flex items-center">
                                                                            <div className="shrink-0 h-10 w-10">
                                                                                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-900 font-bold">
                                                                                    {sol.nombre.charAt(0).toUpperCase()}
                                                                                </div>
                                                                            </div>
                                                                            <div className="ml-4">
                                                                                <div className="text-sm font-medium text-gray-900">{sol.nombre} {sol.apellido || ''}</div>
                                                                                <div className="text-xs text-gray-500">{sol.trabaja ? 'Trabaja' : 'No trabaja'}</div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                        {sol.cedula}
                                                                    </td>

                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                        <div className="flex flex-col">
                                                                            <span>{sol.telfCelular || sol.telfCasa}</span>
                                                                            <span className="text-xs text-gray-400">{sol.email}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                                            {sol.estadoCivil}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                        <div className="flex justify-end gap-2">
                                                                            <Button
                                                                                variant="secondary"
                                                                                size="sm"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleCardClick(sol);
                                                                                }}
                                                                                className="rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-900 border-none p-2 h-8 w-8"
                                                                                title="Ver Detalle"
                                                                            >
                                                                                <FontAwesomeIcon icon={faEye} />
                                                                            </Button>
                                                                            <Button
                                                                                variant="danger"
                                                                                size="sm"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleEncuestaClick(sol.cedula);
                                                                                }}
                                                                                className="rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-900 border-none p-2 h-8 w-8"
                                                                                title="Encuesta"
                                                                            >
                                                                                <FontAwesomeIcon icon={faFileAlt} />
                                                                            </Button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}

                                            {/* Pagination Controls */}
                                            <Pagination
                                                currentPage={currentPage}
                                                itemsPerPage={itemsPerPage}
                                                totalItems={sortedSolicitantes.length}
                                                onPageChange={handlePageChange}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {/* MODAL ENCUESTA */}
                    {showEncuesta && selectedCedula && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                                    <h3 className="text-xl font-bold text-gray-800">Encuesta Socioeconómica - C.I: {selectedCedula}</h3>
                                    <Button variant="ghost" onClick={handleEncuestaClose} className="text-gray-500 hover:text-red-900 p-1">
                                        <FontAwesomeIcon icon={faTimes} size="lg" />
                                    </Button>
                                </div>
                                <div className="p-0"> {/* Padding managed inside form */}
                                    <EncuestaForm
                                        cedula={selectedCedula}
                                        onSuccess={() => {
                                            alert("Encuesta guardada con éxito");
                                            handleEncuestaClose();
                                        }}
                                        onCancel={handleEncuestaClose}
                                    />
                                </div>
                            </div>
                        </div>
                    )}



                </div>
            </main>
        </div>
    );
}

export default Solicitantes;
