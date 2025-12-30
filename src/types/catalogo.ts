// Definiciones básicas para catálogos, movidas aquí para centralización
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

export interface EstadoCivil {
    idEstadoCivil: number;
    nombreEstadoCivil: string;
}

export interface Centro {
    idCentro: number;
    nombreCentro: string;
    idParroquia: number;
}

export interface AmbitoLegal {
    id: number;
    descripcion: string;
    tipo: 'MATERIA' | 'CATEGORIA' | 'SUBCATEGORIA' | 'AMBITO';
    children?: AmbitoLegal[];
}
