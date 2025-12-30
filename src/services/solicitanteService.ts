import api from './api';
import type { SolicitanteRequest, SolicitanteResponse } from '../types';

// La interfaz Solicitante ahora coincide directamente con SolicitanteRequest
export type Solicitante = SolicitanteRequest;

export interface SolicitanteConRespuesta extends SolicitanteResponse {
    // Interfaz opcional para cuando necesitemos la respuesta completa
}

const solicitanteService = {
    getAll: async () => {
        const response = await api.get<SolicitanteResponse[]>('/solicitantes');
        return response.data;
    },

    getByCedula: async (cedula: string) => {
        const response = await api.get<SolicitanteResponse>(`/solicitantes/${cedula}`);
        return response.data;
    },

    create: async (data: SolicitanteRequest) => {
        // Aseguramos que la cédula se use como ID si es necesario por el backend
        // El backend espera un objeto Solicitante
        const response = await api.post('/solicitantes', data);
        return response.data;
    },

    update: async (cedula: string, data: SolicitanteRequest) => {
        const response = await api.put(`/solicitantes/${cedula}`, data);
        return response.data;
    },

    delete: async (cedula: string) => {
        const response = await api.delete(`/solicitantes/${cedula}`);
        return response.data;
    },
};

export default solicitanteService;
