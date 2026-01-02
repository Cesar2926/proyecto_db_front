interface CaseCardProps {
  numCaso: string;
  materia: string;
  cedula: string;
  nombre: string;
  fecha: string;
  estatus: string;
  sintesis?: string;
  onClick?: () => void;
  usuarios_asignados?: string[];
}

function CaseCard({ numCaso, materia, cedula, nombre, fecha, estatus, sintesis, onClick }: CaseCardProps) {
  // Función para determinar el color del badge
  const getStatusColor = (status: string) => {
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case 'EN PROGRESO':
      case 'ACTIVO':
      case 'ABIERTO':
        return 'bg-green-600';
      case 'CERRADO':
        return 'bg-red-800';
      case 'PENDIENTE':
        return 'bg-yellow-500';
      case 'REVISIÓN':
        return 'bg-blue-600';
      default:
        return 'bg-gray-500';
    }
  };

  const formatFecha = (fechaStr: string) => {
    try {
      if (!fechaStr) return '';
      const [year, month, day] = fechaStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return fechaStr;
    }
  };

  return (
    <div
      onClick={onClick}
      // Height fixed to mimic the reference image ratio
      className="group cursor-pointer bg-white relative shadow-md hover:shadow-xl transition-all duration-300 h-[380px] w-full flex flex-col rounded-sm overflow-hidden"
    >
      {/* 1. Left Vertical Red Bar */}
      <div className="absolute left-0 top-0 bottom-0 w-3 bg-red-900 group-hover:w-4 transition-all duration-300"></div>

      {/* Main Content Container */}
      <div className="pl-8 pr-6 pt-5 pb-4 flex flex-col h-full w-full">

        {/* 2. Top Right: Case Number */}
        {/* Requirement: Larger, Black, Red on Hover, Scale on Hover */}
        <div className="flex justify-end mb-1">
          <span className="text-gray-900 font-bold text-lg tracking-wide group-hover:text-red-900 group-hover:scale-110 origin-right transition-all duration-300">
            {numCaso}
          </span>
        </div>

        {/* 3. Title: Name */}
        <h2 className="text-2xl font-black text-gray-900 leading-tight mb-1 line-clamp-2">
          {nombre}
        </h2>

        {/* Requirements: Materia (Ambito Legal) below name */}
        <p className="text-xs font-bold text-red-900 uppercase tracking-widest mb-3">
          {materia}
        </p>

        {/* 4. Body: Synthesis */}
        {/* Requirement: Center text, truncation */}
        <div className="flex-1 overflow-hidden relative flex items-center justify-center px-2">
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-4 text-center">
            {sintesis || <span className="italic opacity-50">Sin síntesis disponible.</span>}
          </p>
        </div>

        {/* 5. Bottom Section: Badge and Metadata */}
        <div className="mt-2 shrink-0">

          {/* Badge */}
          <div className="mb-3">
            <span className={`${getStatusColor(estatus)} text-white px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider inline-block shadow-sm`}>
              {estatus}
            </span>
          </div>

          {/* Metadata */}
          <div className="text-xs text-gray-400 font-medium flex justify-between items-end border-t border-gray-100 pt-2">
            <div>
              <p className="mb-0.5">Cédula: {cedula}</p>
              <p>Fecha: {formatFecha(fecha)}</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default CaseCard;
