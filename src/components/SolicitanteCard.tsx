import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faEnvelope, faMapMarkerAlt, faIdCard } from '@fortawesome/free-solid-svg-icons';
import type { SolicitanteResponse } from '../types/solicitante';

interface SolicitanteCardProps {
    solicitante: SolicitanteResponse;
    onClick?: () => void;
    onEncuestaClick?: () => void;
}

function SolicitanteCard({ solicitante, onClick, onEncuestaClick }: SolicitanteCardProps) {
    const nombreCompleto = `${solicitante.nombre} ${solicitante.apellido || ''}`.trim();

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all cursor-pointer group h-full flex flex-col justify-between"
        >
            <div>
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start gap-3">
                        <div className="h-14 flex items-center">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-900 font-bold text-lg min-w-10">
                                {nombreCompleto.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <div>
                            <div className="min-h-14 flex items-center">
                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-red-900 transition-colors line-clamp-2 w-full">
                                    {nombreCompleto}
                                </h3>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 gap-1">
                                <FontAwesomeIcon icon={faIdCard} className="w-3 h-3" />
                                <span>{solicitante.cedula}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FontAwesomeIcon icon={faPhone} className="w-4 h-4 text-gray-400" />
                        <span>{solicitante.telfCelular || solicitante.telfCasa || 'No registrado'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 text-gray-400" />
                        <span className="truncate" title={solicitante.email}>{solicitante.email || 'No registrado'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 text-gray-400" />
                        <span className="truncate" title={[solicitante.estadoResidencia, solicitante.municipioResidencia, solicitante.parroquiaResidencia].filter(Boolean).join(', ')}>
                            {[solicitante.estadoResidencia, solicitante.municipioResidencia, solicitante.parroquiaResidencia].filter(Boolean).join(', ') || 'Sin ubicación'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                <div className="flex flex-col">
                    <span>{solicitante.estadoCivil}</span>
                    <span className={`px-2 py-0.5 rounded-full w-fit mt-1 ${solicitante.trabaja ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {solicitante.trabaja ? 'Trabaja' : 'No trabaja'}
                    </span>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEncuestaClick && onEncuestaClick();
                    }}
                    className="px-3 py-1 bg-red-50 text-red-900 rounded hover:bg-red-100 transition-colors"
                >
                    <FontAwesomeIcon icon={faIdCard} className="mr-1" />
                    Encuesta
                </button>
            </div>
        </div>
    );
}

export default SolicitanteCard;
