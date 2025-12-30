import api from './api';

export interface Estado {
    idEstado: number;
    nombreEstado: string;
}

export interface Municipio {
    idMunicipio: number;
    nombreMunicipio: string;
    idEstado: number;
}

export interface Parroquia {
    idParroquia: number;
    nombreParroquia: string;
    idMunicipio: number;
}

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
};

export interface EstadoCivil {
    idEstadoCivil: number;
    nombreEstadoCivil: string;
}

export default catalogoService;
