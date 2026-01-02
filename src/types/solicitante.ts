export interface SolicitanteRequest {
    cedula: string;
    nombre: string;
    sexo: string;
    idEstadoCivil: number;
    fechaNacimiento: string; // LocalDate in Java, string (ISO) in JS
    concubinato: boolean;
    nacionalidad: string;
    idCondicion?: number;
    idCondicionActividad?: number;
    telfCasa: string;
    telfCelular: string;
    email: string;
    idParroquia: number;
}

export interface SolicitanteResponse {
    cedula: string;
    nombre: string;
    sexo: string;
    estadoCivil: string;
    fechaNacimiento: string;
    concubinato: boolean;
    nacionalidad: string;
    trabaja: boolean;
    condicionTrabajo: string;
    telfCasa: string;
    telfCelular: string;
    email: string;
    estadoResidencia: string;
    municipioResidencia: string;
    parroquiaResidencia: string;
    tipoVivienda: string;
}
