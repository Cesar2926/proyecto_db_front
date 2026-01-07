import Button from './common/Button';
import type { CasoSummary } from '../types/caso';

interface CasoRowProps {
    caso: CasoSummary;
    materia: string;
    onClick: () => void;
}

export default function CasoRow({ caso, materia, onClick }: CasoRowProps) {
    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {caso.numCaso}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="font-medium text-gray-900">{caso.nombreSolicitante}</div>
                <div className="text-xs text-gray-500">{caso.cedula}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {materia}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(caso.fechaRecepcion).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${caso.estatus === 'ABIERTO' ? 'bg-green-100 text-green-800' :
                    caso.estatus === 'CERRADO' ? 'bg-red-100 text-red-800' :
                        caso.estatus === 'EN PAUSA' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                    }`}>
                    {caso.estatus}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button
                    variant="link"
                    onClick={onClick}
                    className="text-red-900 hover:text-red-700 p-0"
                >
                    Ver Detalles
                </Button>
            </td>
        </tr>
    );
}
