import api from './api';
import type { FormDataRegistro } from '../types/tipos';

// Asumimos que el tipo Solicitante es compatible con FormDataRegistro por ahora, 
// o definimos una interfaz específica si es necesario.
// La interfaz Solicitante ahora coincide directamente con FormDataRegistro
export interface Solicitante extends FormDataRegistro {
    // Si hay campos extra devueltos por backend que no están en el form, agrégalos aquí
}

const solicitanteService = {
    getAll: async () => {
        const response = await api.get<Solicitante[]>('/solicitantes');
        return response.data;
    },

    getByCedula: async (cedula: string) => {
        const response = await api.get<Solicitante>(`/solicitantes/${cedula}`);
        return response.data;
    },

    create: async (data: Solicitante) => {
        // Aseguramos que la cédula se use como ID si es necesario por el backend
        // El backend espera un objeto Solicitante
        const response = await api.post('/solicitantes', data);
        return response.data;
    },

    update: async (cedula: string, data: Solicitante) => {
        const response = await api.put(`/solicitantes/${cedula}`, data);
        return response.data;
    },

    delete: async (cedula: string) => {
        const response = await api.delete(`/solicitantes/${cedula}`);
        return response.data;
    },
};

export default solicitanteService;
