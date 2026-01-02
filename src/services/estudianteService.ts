import api from './api';

export interface EstudianteInfo {
    username: string;
    cedula: string;
    nombre: string;
    apellido?: string;
    termino?: string;
    tipoDeEstudiante?: string;
    nrc?: number;
    semestre?: string;
    seccion?: string;
}

const estudianteService = {
    getActiveStudents: async (): Promise<EstudianteInfo[]> => {
        const response = await api.get('/estudiantes', { params: { activo: true } });
        return response.data;
    }
};

export default estudianteService;
