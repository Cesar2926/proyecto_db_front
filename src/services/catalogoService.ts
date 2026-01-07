import api from './api';

import type { Estado, Municipio, Parroquia, AmbitoLegal, Centro, EstadoCivil, Semestre } from '../types';

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

    getTribunales: async () => {
        const response = await api.get<import('../types/catalogo').Tribunal[]>('/catalogos/tribunales');
        return response.data;
    },

    getSemestres: async () => {
        const response = await api.get<Semestre[]>('/catalogos/semestres');
        return response.data;
    },

    getViviendas: async () => {
        const response = await api.get<import('../types').TipoViviendaResponse[]>('/catalogos/viviendas');
        return response.data;
    },

    getCondicionesLaborales: async () => {
        const response = await api.get<import('../types').CondicionLaboralResponse[]>('/catalogos/condiciones-laborales');
        return response.data;
    },

    getCondicionesActividad: async () => {
        const response = await api.get<import('../types').CondicionActividadResponse[]>('/catalogos/condiciones-actividad');
        return response.data;
    },
};



export default catalogoService;
