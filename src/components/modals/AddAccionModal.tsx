import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import type { AccionCreateRequest } from '../../types/caso';
import EstudianteManager from '../forms/EstudianteManager';
import estudianteService, { type EstudianteInfo } from '../../services/estudianteService';
import CustomDatePicker from '../common/CustomDatePicker';
import Switch from '../common/Switch';

interface AddAccionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (data: AccionCreateRequest) => Promise<void>;
    defaultUsername?: string;
}

export default function AddAccionModal({ isOpen, onClose, onSuccess, defaultUsername = '' }: AddAccionModalProps) {
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [isEjecutada, setIsEjecutada] = useState(false);
    const [fechaEjecucion, setFechaEjecucion] = useState(new Date().toISOString().split('T')[0]);

    // Ejecutantes state
    const [selectedUsernames, setSelectedUsernames] = useState<string[]>([]);
    const [availableStudents, setAvailableStudents] = useState<EstudianteInfo[]>([]);

    const [currentUser, setCurrentUser] = useState(defaultUsername);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load Students
        const loadStudents = async () => {
            try {
                const students = await estudianteService.getActiveStudents();
                setAvailableStudents(students);
            } catch (e) {
                console.error("Error loading students", e);
            }
        };
        loadStudents();

        if (isOpen) {
            // Try to get logged in user from localStorage if not provided
            const storedUser = localStorage.getItem('user');
            let uName = defaultUsername;
            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    uName = parsed.username || parsed.sub || defaultUsername;
                } catch (e) {
                    uName = defaultUsername;
                }
            }
            setCurrentUser(uName);
            // Pre-select current user if not empty
            if (uName) setSelectedUsernames([uName]);
            else setSelectedUsernames([]);
        }
    }, [isOpen, defaultUsername]);

    const handleSubmit = async () => {
        if (!titulo) return;
        // Validation: if executed, date is required (though default is set)
        if (isEjecutada && !fechaEjecucion) return;

        setLoading(true);
        try {
            await onSuccess({
                titulo,
                descripcion,
                fechaRegistro: new Date().toISOString().split('T')[0], // Today
                fechaEjecucion: isEjecutada ? fechaEjecucion : undefined,
                username: currentUser, // Registered by
                ejecutantes: selectedUsernames
            });
            // Reset and close
            setTitulo('');
            setDescripcion('');
            setIsEjecutada(false);
            setFechaEjecucion(new Date().toISOString().split('T')[0]);
            setSelectedUsernames([]);
            onClose();
        } catch (error) {
            console.error("Error creating action", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Registrar Acción Legal">
            <div className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título de la Acción *</label>
                    <input
                        type="text"
                        className="w-full border rounded-lg p-2 focus:ring-red-900 focus:border-red-900"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        placeholder="Ej: Redacción de Demanda"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                        className="w-full border rounded-lg p-2 focus:ring-red-900 focus:border-red-900"
                        rows={3}
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Detalles sobre la acción realizada..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="block text-sm font-medium text-gray-700">Estado de la Acción</label>
                        <Switch
                            checked={isEjecutada}
                            onChange={setIsEjecutada}
                            label={isEjecutada ? "Acción Ejecutada" : "Acción Pendiente"}
                        />
                    </div>
                    {isEjecutada && (
                        <div>
                            <CustomDatePicker
                                label="Fecha de Ejecución *"
                                value={fechaEjecucion}
                                onChange={setFechaEjecucion}
                                required={isEjecutada}
                                max={new Date().toISOString().split('T')[0]} // Max today
                            />
                        </div>
                    )}
                </div>

                {/* Ejecutantes */}
                <div>
                    <EstudianteManager
                        activeStudents={availableStudents}
                        selectedUsernames={selectedUsernames}
                        onSelectionChange={setSelectedUsernames}
                    />
                </div>

                <div className="pt-4 flex justify-end gap-2">
                    <Button onClick={onClose} variant="secondary" disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} variant="primary" disabled={loading || !titulo}>
                        {loading ? 'Guardando...' : 'Guardar Acción'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
