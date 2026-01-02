interface CaseCardProps {
  numCaso: string;
  materia: string;
  cedula: string;
  nombre: string;
  fecha: string;
  estatus: string;
  onClick?: () => void;
  usuarios_asignados?: string[];
}

function CaseCard({ numCaso, materia, cedula, nombre, fecha, estatus, onClick }: CaseCardProps) {
  // Función para determinar el color del badge según el estatus
  const getStatusColor = (status: string) => {
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case 'EN PROGRESO':
      case 'ACTIVO':
      case 'ABIERTO':
        return 'bg-green-600';
      case 'CERRADO':
        return 'bg-red-600';
      case 'PENDIENTE':
        return 'bg-yellow-600';
      case 'REVISIÓN':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  // Formatear fecha
  const formatFecha = (fechaStr: string) => {
    try {
      if (!fechaStr) return 'Fecha no disponible';
      // Asumimos formato YYYY-MM-DD
      const [year, month, day] = fechaStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return fechaStr;
    }
  };

  return (
    <button
      onClick={onClick}
      className="relative bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 w-full text-left cursor-pointer group"
    >
      {/* Barra vertical roja a la izquierda */}
      <div className="absolute left-0 top-0 bottom-0 w-3 bg-linear-to-b from-red-800 to-red-950 group-hover:w-4 transition-all duration-300"></div>

      {/* Contenido principal */}
      <div className="pl-8 pr-6 py-6">
        {/* Código en la parte superior derecha */}
        <div className="flex justify-end mb-4">
          <span className="text-black text-xl font-bold group-hover:text-red-800 transition-colors">
            {numCaso}
          </span>
        </div>

        {/* Nombre del cliente (grande y destacado) */}
        <h2 className="text-3xl md:text-4xl font-black text-black mb-2 leading-tight">{nombre}</h2>

        {/* Materia */}
        <p className="text-2xl md:text-3xl text-gray-700 font-medium mb-4">{materia}</p>

        {/* Badge de estatus */}
        <div className="flex justify-start mb-6">
          <span
            className={`${getStatusColor(estatus)} text-white px-6 py-2 rounded-full text-sm font-semibold uppercase`}
          >
            {estatus}
          </span>
        </div>

        {/* Información adicional */}
        <div className="text-sm text-gray-600">
          <p>Cédula: {cedula}</p>
          <p>Fecha: {formatFecha(fecha)}</p>
        </div>
      </div>
    </button>
  );
}

export default CaseCard;
