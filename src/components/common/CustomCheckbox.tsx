import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

interface CustomCheckboxProps {
    label?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
    name?: string;
}

export default function CustomCheckbox({
    label,
    checked,
    onChange,
    disabled = false,
    className = '',
    name
}: CustomCheckboxProps) {
    const handleClick = () => {
        if (!disabled) {
            onChange(!checked);
        }
    };

    return (
        <div
            className={`flex items-center group ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${className}`}
            onClick={handleClick}
        >
            <div className={`
                w-5 h-5 flex items-center justify-center rounded border transition-all duration-200
                ${checked
                    ? 'bg-red-900 border-red-900 shadow-sm'
                    : 'bg-white border-gray-300 group-hover:border-red-900'
                }
                ${disabled ? 'bg-gray-100 border-gray-200' : ''}
            `}>
                {checked && (
                    <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />
                )}
            </div>

            {label && (
                <span className={`ml-3 text-sm select-none transition-colors duration-200 ${checked ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                    {label}
                </span>
            )}

            {/* Hidden native input for form submissions/accessibility if needed */}
            <input
                type="checkbox"
                name={name}
                checked={checked}
                onChange={() => { }} // Controlled by div click
                disabled={disabled}
                className="sr-only"
            />
        </div>
    );
}
