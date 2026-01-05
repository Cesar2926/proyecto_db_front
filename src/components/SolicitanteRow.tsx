import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import Button from './common/Button';
import type { SolicitanteResponse } from '../types/solicitante';

interface SolicitanteRowProps {
    solicitante: SolicitanteResponse;
    onClick: () => void;
    onEncuestaClick: (solicitante: SolicitanteResponse) => void;
    onEditClick: () => void;
}

export default function SolicitanteRow({ solicitante, onClick, onEncuestaClick, onEditClick }: SolicitanteRowProps) {
    return (
        <tr className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={onClick}>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-900 font-bold">
                            {solicitante.nombre.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{solicitante.nombre} {solicitante.apellido || ''}</div>
                        <div className="text-xs text-gray-500">{solicitante.trabaja ? 'Trabaja' : 'No trabaja'}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {solicitante.cedula}
            </td>

            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex flex-col">
                    <span>{solicitante.telfCelular || solicitante.telfCasa}</span>
                    <span className="text-xs text-gray-400">{solicitante.email}</span>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    {solicitante.estadoCivil}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEditClick();
                        }}
                        className="rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-900 border-none p-2 h-8 w-8"
                        title="Ver Detalle / Editar"
                    >
                        <FontAwesomeIcon icon={faEye} />
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEncuestaClick(solicitante);
                        }}
                        className="rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-900 border-none p-2 h-8 w-8"
                        title="Encuesta"
                    >
                        <FontAwesomeIcon icon={faFileAlt} />
                    </Button>
                </div>
            </td>
        </tr>
    );
}
