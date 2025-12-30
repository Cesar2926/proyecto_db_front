import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMagnifyingGlass, faUser } from '@fortawesome/free-solid-svg-icons';

interface CasosCardProps {
    title: string;
    icon: React.ReactNode;
    onClick?: () => void;
}

function CasosCard({ title, icon, onClick }: CasosCardProps) {
    const navigate = useNavigate();

    const handleRegisterClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Evitar que se dispare el onClick del padre (la tarjeta completa)
        navigate('/registro-caso');
    };

    return (
        <div
            className="relative w-full h-full min-h-[200px] bg-linear-to-br from-red-900 to-red-950 rounded-2xl flex flex-col hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 group overflow-hidden"
        >
            {/* Main Content Area - Clickable */}
            {/* Usamos classes de Card.tsx para mantener consistencia: p-6 para padding, position relative */}
            <div
                onClick={onClick}
                className="flex-1 relative p-6 cursor-pointer flex flex-col justify-between"
            >
                {/* Ícono decorativo (grande y con opacidad) - Igual que en Card.tsx */}
                <div className="absolute top-4 right-4 text-red-700/30 transform group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
                    {icon}
                </div>

                {/* Espacio vacio para empujar titulo abajo como en Card.tsx */}
                <div className="flex-1"></div>

                {/* Título - Igual que en Card.tsx */}
                <div className="relative z-10 mt-auto mb-4">
                    <h3 className="text-white font-bold text-xl md:text-2xl lg:text-3xl text-left uppercase tracking-wide">
                        {title}
                    </h3>
                </div>
            </div>

            {/* Footer (Divider + Icons) - La única diferencia funcional */}
            <div className="h-16 flex border-t border-red-800/30 bg-red-950/20 backdrop-blur-sm z-20">
                <button
                    onClick={handleRegisterClick}
                    className="flex-1 flex items-center justify-center text-white hover:bg-white/10 transition-colors border-r border-red-800/30 outline-none"
                >
                    <FontAwesomeIcon icon={faPlus} className="text-xl border-2 border-white rounded-full p-0.5 w-5 h-5" />
                </button>
                <button className="flex-1 flex items-center justify-center text-white hover:bg-white/10 transition-colors border-r border-red-800/30 outline-none">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="text-xl" />
                </button>
                <button className="flex-1 flex items-center justify-center text-white hover:bg-white/10 transition-colors outline-none">
                    <FontAwesomeIcon icon={faUser} className="text-xl" />
                </button>
            </div>
        </div>
    );
}

export default CasosCard;
