export interface FamiliaDTO {
    cantPersonas: number;
    cantEstudiando: number;
    ingresoMes: number;
    jefeFamilia: boolean;
    cantSinTrabajo: number;
    cantNinos: number;
    cantTrabaja: number;
    idNivelEduJefe: number;
    tiempoEstudio: string;
}

export interface ViviendaDTO {
    cantHabitaciones: number;
    cantBanos: number;
}

export interface CaracteristicaRequest {
    idTipoCat: number;
    idCatVivienda: number;
}

export interface DatosEncuestaRequest {
    familia: FamiliaDTO;
    vivienda: ViviendaDTO;
    caracteristicas: CaracteristicaRequest[];
    idCondicion?: number;
    idCondicionActividad?: number;
}

export type DatosEncuestaResponse = DatosEncuestaRequest;
