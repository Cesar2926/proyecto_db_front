import { useState } from 'react';
import { X } from 'lucide-react';
import usuarioService from '../../services/usuarioService';
import type { Usuario } from '../../types/usuario';

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function UserFormModal({ isOpen, onClose, onSuccess }: UserFormModalProps) {
    const [formData, setFormData] = useState<Partial<Usuario>>({
        username: '',
        email: '',
        nombre: '',
        idUsuario: '', // Cedula
        tipoUsuario: 'ESTUDIANTE',
        estatus: 'ACTIVO'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Adapt formData to backend expectations if needed.
            // Backend Usuario: username, cedula (idUsuario?), nombre, email, status, tipo, contrasena
            // Frontend type Usuario: username, idUsuario (cedula), nombre, email, estatus, tipoUsuario

            const payload: any = {
                ...formData,
                cedula: formData.idUsuario, // Map idUsuario to cedula for backend if needed, or keep consistent
                status: formData.estatus,
                tipo: formData.tipoUsuario
            };

            await usuarioService.createUsuario(payload);
            onSuccess();
            onClose();
            setFormData({
                username: '',
                email: '',
                nombre: '',
                idUsuario: '',
                tipoUsuario: 'ESTUDIANTE',
                estatus: 'ACTIVO'
            });
        } catch (err) {
            console.error('Error creating user:', err);
            setError('Error al crear usuario. Verifique los datos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Crear Nuevo Usuario</h3>
                                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {error && (
                                <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                                    <input type="text" name="nombre" required value={formData.nombre} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                                    <input type="email" name="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Usuario (Username)</label>
                                        <input type="text" name="username" required value={formData.username} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Cédula</label>
                                        <input type="text" name="idUsuario" required value={formData.idUsuario} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Rol</label>
                                        <select name="tipoUsuario" value={formData.tipoUsuario} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
                                            <option value="ESTUDIANTE">Estudiante</option>
                                            <option value="PROFESOR">Profesor</option>
                                            <option value="COORDINADOR">Coordinador</option>
                                            <option value="ADMINISTRADOR">Administrador</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Estatus</label>
                                        <select name="estatus" value={formData.estatus} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
                                            <option value="ACTIVO">Activo</option>
                                            <option value="INACTIVO">Inactivo</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                            >
                                {loading ? 'Guardando...' : 'Guardar Usuario'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
