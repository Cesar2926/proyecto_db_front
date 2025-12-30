import api from './api';

import type { Estado, Municipio, Parroquia, AmbitoLegal, Centro, EstadoCivil } from '../types';

const catalogoService = {
    getEstados: async () => {
        const response = await api.get<Estado[]>('/catalogos/estados');
        return response.data;
    },

    getMunicipios: async (idEstado: number) => {
        const response = await api.get<Municipio[]>('/catalogos/municipios', {
            params: { idEstado }
        });
        return response.data;
    },

    getParroquias: async (idMunicipio: number) => {
        const response = await api.get<Parroquia[]>('/catalogos/parroquias', {
            params: { idMunicipio }
        });
        return response.data;
    },

    getAllMunicipios: async () => {
        const response = await api.get<Municipio[]>('/catalogos/municipios/all');
        return response.data;
    },

    getAllParroquias: async () => {
        const response = await api.get<Parroquia[]>('/catalogos/parroquias/all');
        return response.data;
    },

    getEstadosCiviles: async () => {
        const response = await api.get<EstadoCivil[]>('/catalogos/estados-civiles');
        return response.data;
    },

    getAmbitosLegales: async () => {
        const response = await api.get<AmbitoLegal[]>('/catalogos/ambitos-legales');
        return response.data;
    },

    getCentros: async () => {
        const response = await api.get<Centro[]>('/catalogos/centros');
        return response.data;
    },
};



export default catalogoService;
