import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface PaginationProps {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, itemsPerPage, totalItems, onPageChange }: PaginationProps) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center mt-6">
            <nav className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 hover:text-red-900'}`}
                >
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <button
                        key={number}
                        onClick={() => onPageChange(number)}
                        className={`w-8 h-8 flex items-center justify-center rounded-md font-medium transition-colors ${currentPage === number
                                ? 'bg-red-900 text-white'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-red-900'
                            }`}
                    >
                        {number}
                    </button>
                ))}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 hover:text-red-900'}`}
                >
                    <FontAwesomeIcon icon={faChevronRight} />
                </button>
            </nav>
        </div>
    );
};

export default Pagination;
