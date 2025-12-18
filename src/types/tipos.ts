// Interfaces para los casos
export interface Caso {
  numCaso: string;
  materia: string;
  cedula: string;
  nombre: string;
  fecha: string;
  estatus: string;
  usuarios_asignados: string[]; // Array de IDs de usuarios asignados
}

export interface CaseCardProps extends Caso {
  onClick?: () => void;
}

// Interfaces para el formulario de registro de beneficiarios
export interface FormDataRegistro {
  // Datos personales
  nombresApellidos: string;
  ci: string;
  sexo: string;
  estadoCivil: string;
  fechaNacimiento: string;
  concubinato: boolean;
  nacionalidad: string;
  trabaja: boolean;
  condicionTrabajo: string;
  // Datos de contacto
  telefonoLocal: string;
  telefonoPersonal: string;
  correoElectronico: string;
  // Datos de residencia
  comunidadResidencia: string;
  parroquiaResidencia: string;
  tipoVivienda: string;
  // Familia y hogar
  personasVivienda: string;
  miembrosTrabajan: string;
  ninosEntre7y12: string;
  jefeHogar: boolean;
}
