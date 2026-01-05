import { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomDatePickerProps {
    label?: string | React.ReactNode;
    value: string; // YYYY-MM-DD
    onChange: (value: string) => void;
    min?: string;
    max?: string;
    required?: boolean;
    disabled?: boolean;
}

type CalendarView = 'days' | 'months' | 'years';

export default function CustomDatePicker({
    label,
    value,
    onChange,
    min,
    max,
    required = false,
    disabled = false
}: CustomDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom');
    const [view, setView] = useState<CalendarView>('days');

    // Internal date state for navigation
    const [viewDate, setViewDate] = useState(() => {
        if (value) {
            const [y, m, d] = value.split('-').map(Number);
            return new Date(y, m - 1, d);
        }
        return new Date();
    });

    const datePickerRef = useRef<HTMLDivElement>(null);

    const toggleOpen = () => {
        if (disabled) return;

        if (!isOpen) {
            // Smart positioning logic
            if (datePickerRef.current) {
                const rect = datePickerRef.current.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                const minSpaceRequired = 320;

                if (spaceBelow < minSpaceRequired && rect.top > minSpaceRequired) {
                    setPlacement('top');
                } else {
                    setPlacement('bottom');
                }
            }
            // Reset to days view on open
            setView('days');
            if (value) {
                const [y, m, d] = value.split('-').map(Number);
                setViewDate(new Date(y, m - 1, d));
            }
        }
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    // Navigation Handlers
    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (view === 'days') {
            setViewDate(new Date(year, month - 1, 1));
        } else if (view === 'years') {
            setViewDate(new Date(year - 12, month, 1));
        } else {
            setViewDate(new Date(year - 1, month, 1));
        }
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (view === 'days') {
            setViewDate(new Date(year, month + 1, 1));
        } else if (view === 'years') {
            setViewDate(new Date(year + 12, month, 1));
        } else {
            setViewDate(new Date(year + 1, month, 1));
        }
    };

    // Selection Handlers
    const handleDayClick = (day: number) => {
        const mStr = String(month + 1).padStart(2, '0');
        const dStr = String(day).padStart(2, '0');
        const newValue = `${year}-${mStr}-${dStr}`;
        onChange(newValue);
        setIsOpen(false);
    };

    const handleMonthClick = (newMonth: number) => {
        setViewDate(new Date(year, newMonth, 1));
        setView('days');
    };

    const handleYearClick = (newYear: number) => {
        setViewDate(new Date(newYear, month, 1));
        setView('months'); // Optional: go to months or straight to days? usually months is better flow
    };

    // Render Helpers
    const renderHeader = () => {
        return (
            <div className="flex justify-between items-center mb-4 px-2">
                <button
                    type="button"
                    onClick={handlePrev}
                    className="p-1 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex gap-2 font-bold text-gray-800">
                    <button
                        type="button"
                        onClick={() => setView('months')}
                        className={`hover:text-red-900 transition-colors px-2 py-1 rounded-md hover:bg-gray-50 ${view === 'months' ? 'text-red-900 bg-red-50' : ''}`}
                    >
                        {months[month]}
                    </button>
                    <button
                        type="button"
                        onClick={() => setView('years')}
                        className={`hover:text-red-900 transition-colors px-2 py-1 rounded-md hover:bg-gray-50 ${view === 'years' ? 'text-red-900 bg-red-50' : ''}`}
                    >
                        {year}
                    </button>
                </div>

                <button
                    type="button"
                    onClick={handleNext}
                    className="p-1 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        );
    };

    const renderDays = () => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startDay = new Date(year, month, 1).getDay(); // 0 = Sun
        const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
        const padding = Array(startDay).fill(null);
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        const isSelected = (d: number) => {
            if (!value) return false;
            const [sy, sm, sd] = value.split('-').map(Number);
            return sy === year && sm - 1 === month && sd === d;
        };

        return (
            <>
                <div className="grid grid-cols-7 gap-1 mb-2 border-b pb-2 border-gray-100">
                    {weekDays.map(d => (
                        <div key={d} className="text-center text-xs font-semibold text-gray-400">
                            {d}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {padding.map((_, i) => <div key={`pad-${i}`} />)}
                    {days.map(day => (
                        <button
                            key={day}
                            type="button"
                            onClick={() => handleDayClick(day)}
                            className={`
                                h-9 w-9 flex items-center justify-center rounded-lg text-sm transition-colors
                                ${isSelected(day)
                                    ? 'bg-red-900 text-white font-bold shadow-md'
                                    : 'hover:bg-red-50 text-gray-700 font-medium'
                                }
                            `}
                        >
                            {day}
                        </button>
                    ))}
                </div>
            </>
        );
    };

    const renderMonths = () => {
        return (
            <div className="grid grid-cols-3 gap-2">
                {months.map((m, i) => (
                    <button
                        key={m}
                        type="button"
                        onClick={() => handleMonthClick(i)}
                        className={`
                            py-2 px-1 rounded-lg text-sm font-medium transition-colors
                            ${i === month
                                ? 'bg-red-900 text-white shadow-md'
                                : 'hover:bg-red-50 text-gray-700 hover:text-red-900'
                            }
                        `}
                    >
                        {m.substring(0, 3)}
                    </button>
                ))}
            </div>
        );
    };

    const renderYears = () => {
        // Show 12 years centered around current view year
        const startYear = year - 6;
        const years = Array.from({ length: 12 }, (_, i) => startYear + i);

        return (
            <div className="grid grid-cols-3 gap-2">
                {years.map(y => (
                    <button
                        key={y}
                        type="button"
                        onClick={() => handleYearClick(y)}
                        className={`
                            py-2 px-1 rounded-lg text-sm font-medium transition-colors
                            ${y === year
                                ? 'bg-red-900 text-white shadow-md'
                                : 'hover:bg-red-50 text-gray-700 hover:text-red-900'
                            }
                        `}
                    >
                        {y}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="relative" ref={datePickerRef}>
            {label && (
                <label className="block text-sm font-semibold mb-2">
                    {label}
                </label>
            )}

            {/* Input Trigger */}
            <div
                onClick={toggleOpen}
                className={`
                    w-full px-4 h-11 bg-white border rounded-lg cursor-pointer flex justify-between items-center transition-all duration-200
                    ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'hover:border-red-900'}
                    ${isOpen ? 'ring-2 ring-red-900 border-transparent' : 'border-gray-300'}
                `}
            >
                <div className="flex items-center gap-2 text-gray-700">
                    <CalendarIcon className="w-5 h-5 text-gray-500" />
                    <span className={`${!value ? 'text-gray-500' : 'text-gray-900'}`}>
                        {value ? value.split('-').reverse().join('/') : 'dd/mm/aaaa'}
                    </span>
                </div>
            </div>

            {/* Hidden Input */}
            <input
                type="date"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                min={min}
                max={max}
                className="sr-only"
            />

            {/* Calendar Popup */}
            {isOpen && !disabled && (
                <div
                    className={`absolute z-50 p-4 bg-white border border-gray-200 rounded-lg shadow-xl w-[320px] animate-fade-in
                        ${placement === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'}
                    `}
                >
                    {renderHeader()}

                    <div className="min-h-[240px]">
                        {view === 'days' && renderDays()}
                        {view === 'months' && renderMonths()}
                        {view === 'years' && renderYears()}
                    </div>
                </div>
            )}
        </div>
    );
}
