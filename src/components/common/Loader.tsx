import React from 'react';

interface LoaderProps {
    fullScreen?: boolean;
    text?: string;
    className?: string;
}

const Loader: React.FC<LoaderProps> = ({ fullScreen = false, text = 'Cargando...', className = '' }) => {
    const containerClasses = fullScreen
        ? "fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4"
        : `flex flex-col items-center justify-center p-8 ${className}`;

    return (
        <div className={containerClasses}>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-red-900 mb-4 shadow-sm"></div>
            {text && <p className="text-gray-600 font-medium animate-pulse">{text}</p>}
        </div>
    );
};

export default Loader;
