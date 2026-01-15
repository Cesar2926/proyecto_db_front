import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import usuarioService from '../../services/usuarioService';
import { read, utils } from 'xlsx';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setUploadStatus('idle');
            setMessage('');
            parseFile(selectedFile);
        }
    };



    const parseFile = (file: File) => {
        if (file.name.endsWith('.csv')) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    setPreviewData(results.data.slice(0, 5));
                },
                error: (error) => {
                    console.error('Error parsing CSV:', error);
                    setMessage('Error al leer el archivo CSV.');
                }
            });
        } else if (file.name.endsWith('.xlsx')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = e.target?.result;
                try {
                    const workbook = read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const json = utils.sheet_to_json(sheet, { header: 0, defval: "" }); // Use header:0 to get array of objects with keys from first row
                    setPreviewData(json.slice(0, 5));
                } catch (err) {
                    console.error('Error parsing Excel:', err);
                    setMessage('Error al leer el archivo Excel.');
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            setMessage('Formato de archivo no soportado. Use .csv o .xlsx');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await usuarioService.importEstudiantes(formData);
            setUploadStatus('success');

            // Format report message
            const { created, updated, failed } = response;
            setMessage(`Proceso completado: ${created} creados, ${updated} actualizados, ${failed} fallidos.`);

            setTimeout(() => {
                onSuccess();
                onClose();
                setFile(null);
                setPreviewData([]);
                setUploadStatus('idle');
                setMessage('');
            }, 2000);

        } catch (error) {
            console.error('Upload failed', error);
            setUploadStatus('error');
            setMessage('Error al cargar el archivo. Verifique la conexión.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                {/* This element is to trick the browser into centering the modal contents. */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full relative z-[101]">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                                <Upload className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                    Importar Estudiantes Masivamente
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 mb-4">
                                        Seleccione un archivo CSV o Excel (.xlsx) para cargar estudiantes. El archivo debe contener las cabeceras: CEDULA, NOMBRE_ESTUDIANTE, ESTU_EMAIL_ADDRESS.
                                    </p>

                                    {!file ? (
                                        <div
                                            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 cursor-pointer transition-colors"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                            <p className="mt-2 text-sm text-gray-600">Click para seleccionar archivo</p>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                accept=".csv, .xlsx"
                                                className="hidden"
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                                                <div className="flex items-center">
                                                    <FileText className="h-5 w-5 text-gray-500 mr-2" />
                                                    <span className="text-sm font-medium text-gray-700">{file.name}</span>
                                                </div>
                                                <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500">
                                                    <X className="h-5 w-5" />
                                                </button>
                                            </div>

                                            {previewData.length > 0 && (
                                                <div className="overflow-x-auto">
                                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Vista Previa (Primeros 5 registros)</h4>
                                                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                {Object.keys(previewData[0]).map((header) => (
                                                                    <th key={header} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                        {header}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {previewData.map((row, idx) => (
                                                                <tr key={idx}>
                                                                    {Object.values(row).map((val: any, i) => (
                                                                        <td key={i} className="px-3 py-2 whitespace-nowrap text-gray-500">
                                                                            {val}
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {message && (
                                        <div className={`mt-4 p-3 rounded-md flex items-center ${uploadStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {uploadStatus === 'success' ? <CheckCircle className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
                                            <span className="text-sm font-medium">{message}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={handleUpload}
                            disabled={!file || loading || uploadStatus === 'success'}
                            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm
                                ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}
                                ${(!file || uploadStatus === 'success') && 'opacity-50 cursor-not-allowed'}
                            `}
                        >
                            {loading ? 'Cargando...' : 'Cargar Usuarios'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
