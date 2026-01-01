import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface StatusSelectorProps {
    currentStatus: string;
    onStatusChange: (newStatus: string) => Promise<void>;
    disabled?: boolean;
}

const STATUS_OPTIONS = ["Todo", "In_Progress", "Review", "Blocked", "Done"];

export default function StatusSelector({ currentStatus, onStatusChange, disabled }: StatusSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // Update position when opening or scrolling
    const updatePosition = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    };

    useEffect(() => {
        if (isOpen) {
            updatePosition();
            window.addEventListener('resize', updatePosition);
            window.addEventListener('scroll', updatePosition, true);
        }
        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [isOpen]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            // We need to check if click is in container OR in the portal dropdown
            // But simpler: if we click outside, we close.
            // Since portal is separate, we can attach a click listener to window/document
            // and check if target is inside containerRef.
            // But wait, the dropdown is now in body.
            // We'll give the dropdown an ID or Ref logic.
            // Simpler: Just rely on the backdrop click if needed, or check specific classes.

            // Actually, for Portals, event bubbling still works in React tree!
            // BUT, checking `containerRef.current.contains(event.target)` won't work for the portal content
            // UNLESS we check the portal node too.

            // Improved Strategy: Close on any click, stop propagation inside dropdown?
            // Or verify closest('.status-dropdown')
            const target = event.target as HTMLElement;
            if (containerRef.current && !containerRef.current.contains(target) && !target.closest('.status-dropdown-portal')) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const toggleOpen = () => {
        if (disabled) return;
        if (!isOpen) updatePosition();
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
                className="status-trigger w-full"
                style={disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
                <div className={`status-dot ${getStatusClass(currentStatus)}`} />
                <span>{formatLabel(currentStatus)}</span>
            </button>

            {isOpen && createPortal(
                <div
                    className="status-dropdown status-dropdown-portal fixed z-[9999] shadow-xl border border-white/10 bg-[#18181b] rounded-lg overflow-hidden py-1"
                    style={{
                        top: position.top + 8, // slight offset
                        left: position.left,
                        width: position.width,
                        maxHeight: '300px',
                        overflowY: 'auto'
                    }}
                >
                    {STATUS_OPTIONS.map((status) => {
                        const isSelected = currentStatus === status;
                        return (
                            <button
                                key={status}
                                onClick={() => handleSelect(status)}
                                className={`status-option w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-white/5 transition-colors ${isSelected ? 'bg-white/5' : ''}`}
                            >
                                <div className={`status-dot w-2 h-2 rounded-full ${getStatusClass(status)}`} style={isSelected ? {} : { opacity: 0.5 }} />
                                <span className="text-zinc-300">{formatLabel(status)}</span>
                            </button>
                        );
                    })}
                </div>,
                document.body
            )}
        </div>
    );
}
