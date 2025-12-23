import { useState, useRef, useEffect } from "react";

interface StatusSelectorProps {
    currentStatus: string;
    onStatusChange: (newStatus: string) => Promise<void>;
    disabled?: boolean;
}

const STATUS_OPTIONS = ["Todo", "In_Progress", "Review", "Blocked", "Done"];



export default function StatusSelector({ currentStatus, onStatusChange, disabled }: StatusSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [dropUp, setDropUp] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOpen = () => {
        if (disabled) return;

        if (!isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            // Check if there's enough space below (e.g., 240px for the dropdown)
            const spaceBelow = window.innerHeight - rect.bottom;
            setDropUp(spaceBelow < 240);
        }

        setIsOpen(!isOpen);
    };

    const handleSelect = (status: string) => {
        onStatusChange(status);
        setIsOpen(false);
    };

    const getStatusClass = (status: string) => {
        const s = status.toLowerCase();
        if (s === 'blocked') return 'status-blocked';
        if (s === 'in_progress') return 'status-progress';
        if (s === 'done') return 'status-done';
        if (s === 'review') return 'status-review';
        return 'status-todo';
    };

    const formatLabel = (status: string) => {
        return status.replace('_', ' ');
    };

    return (
        <div ref={containerRef} className="relative inline-block w-full">
            <button
                onClick={toggleOpen}
                disabled={disabled}
                className="status-trigger"
                style={disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
                <div className={`status-dot ${getStatusClass(currentStatus)}`} />
                <span>{formatLabel(currentStatus)}</span>
            </button>

            {isOpen && (
                <div className={`status-dropdown ${dropUp ? 'drop-up' : ''}`}>
                    {STATUS_OPTIONS.map((status) => {
                        const isSelected = currentStatus === status;
                        return (
                            <button
                                key={status}
                                onClick={() => handleSelect(status)}
                                className={`status-option ${isSelected ? 'selected' : ''}`}
                            >
                                <div className={`status-dot ${getStatusClass(status)}`} style={isSelected ? {} : { opacity: 0.5 }} />
                                <span>{formatLabel(status)}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
