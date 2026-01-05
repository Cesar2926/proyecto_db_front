import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTh, faList } from '@fortawesome/free-solid-svg-icons';

interface ViewToggleProps {
    viewMode: 'grid' | 'list';
    onToggle: (mode: 'grid' | 'list') => void;
    className?: string;
}

const ViewToggle = ({ viewMode, onToggle, className = "" }: ViewToggleProps) => {
    return (
        <div className={`flex bg-gray-100 rounded-lg p-1 border border-gray-200 h-10 items-center ${className}`}>
            <button
                onClick={() => onToggle('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow text-red-900' : 'text-gray-400 hover:text-gray-600'}`}
                title="Vista Cuadrícula"
            >
                <FontAwesomeIcon icon={faTh} />
            </button>
            <button
                onClick={() => onToggle('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow text-red-900' : 'text-gray-400 hover:text-gray-600'}`}
                title="Vista Lista"
            >
                <FontAwesomeIcon icon={faList} />
            </button>
        </div>
    );
};

export default ViewToggle;
