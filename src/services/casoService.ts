import api from './api';
import type { CasoCreateRequest, CasoDetalleResponse, CasoSummary } from '../types/caso';

const casoService = {
    create: async (data: CasoCreateRequest): Promise<CasoDetalleResponse> => {
        const response = await api.post<CasoDetalleResponse>('/casos', data);
        return response.data;
    },

    getAll: async (estatus?: string, username?: string, termino?: string): Promise<CasoSummary[]> => {
        const params = new URLSearchParams();
        if (estatus) params.append('estatus', estatus);
        if (username) params.append('username', username);
        if (termino) params.append('termino', termino);

        const response = await api.get<CasoSummary[]>(`/casos?${params.toString()}`);
        return response.data;
    },
};

export default casoService;
