import api from './api';
import type { Usuario } from '../types/usuario';

const usuarioService = {
    getAll: async (estatus?: string): Promise<Usuario[]> => {
        const params = estatus ? { estatus } : undefined;
        const response = await api.get<Usuario[]>('/usuarios', { params });
        return response.data;
    },

    getByUsername: async (username: string): Promise<Usuario> => {
        const response = await api.get<Usuario>(`/usuarios/${username}`);
        return response.data;
    },
};

export default usuarioService;
