import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    LayoutDashboard,
    CheckSquare,
    Settings,
    Zap,
    Plus,
    Bell,
    Command,
    Folder,
    Calendar,
    Users
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';

interface Action {
    id: string;
    title: string;
    icon: React.ReactNode;
    shortcut?: string;
    action: () => void;
    category: string;
    type?: 'page' | 'project' | 'action';
}

export default function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const navigate = useNavigate();
    const { projects, setActiveProjectId } = useProject();
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const navigationActions: Action[] = [
        {
            id: 'dash',
            title: 'Go to Dashboard',
            icon: <LayoutDashboard size={18} />,
            shortcut: 'G D',
            action: () => navigate('/app/v1/dashboard'),
            category: 'Navigation',
            type: 'page'
        },
        {
            id: 'tasks',
            title: 'Go to Tasks',
            icon: <CheckSquare size={18} />,
            shortcut: 'G T',
            action: () => navigate('/app/v1/tasks'),
            category: 'Navigation',
            type: 'page'
        },
        {
            id: 'calendar',
            title: 'Open Calendar',
            icon: <Calendar size={18} />,
            shortcut: 'G C',
            action: () => navigate('/app/v1/calendar'),
            category: 'Navigation',
            type: 'page'
        },
        {
            id: 'team',
            title: 'Team Members',
            icon: <Users size={18} />,
            shortcut: 'G P',
            action: () => navigate('/app/v1/team'),
            category: 'Navigation',
            type: 'page'
        },
        {
            id: 'settings',
            title: 'Open Settings',
            icon: <Settings size={18} />,
            shortcut: 'G S',
            action: () => navigate('/app/v1/settings'),
            category: 'Navigation',
            type: 'page'
        }
    ];

    const functionalActions: Action[] = [
        {
            id: 'focus',
            title: 'Start Focus Session',
            icon: <Zap size={18} />,
            shortcut: 'F',
            action: () => navigate('/app/v1/focus'),
            category: 'Actions',
            type: 'action'
        },
        {
            id: 'new-project',
            title: 'Create New Project',
            icon: <Plus size={18} />,
            shortcut: 'N',
            action: () => {
                // Triggered via global event or specific route
                navigate('/app/v1/dashboard');
            },
            category: 'Actions',
            type: 'action'
        },
        {
            id: 'notifs',
            title: 'View Notifications',
            icon: <Bell size={18} />,
            shortcut: 'G N',
            action: () => navigate('/app/v1/notifications'),
            category: 'Navigation',
            type: 'page'
        }
    ];

    const projectActions: Action[] = projects.map(p => ({
        id: `project-${p.id}`,
        title: p.name,
        icon: <Folder size={18} />,
        action: () => {
            setActiveProjectId(p.id);
            navigate('/app/v1/tasks');
        },
        category: 'Projects',
        type: 'project'
    }));

    const allActions = [...navigationActions, ...functionalActions, ...projectActions];

    const filteredActions = allActions.filter(a =>
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.category.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setActiveIndex(0);
            setTimeout(() => inputRef.current?.focus(), 10);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex(prev => (prev + 1) % Math.max(1, filteredActions.length));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex(prev => (prev - 1 + filteredActions.length) % Math.max(1, filteredActions.length));
            } else if (e.key === 'Enter') {
                const activeAction = filteredActions[activeIndex];
                if (activeAction) {
                    activeAction.action();
                    onClose();
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredActions, activeIndex, onClose]);

    if (!isOpen) return null;

    const categories = Array.from(new Set(filteredActions.map(a => a.category)));

    return (
        <div className="command-palette-overlay" onClick={onClose}>
            <div
                className="command-palette-container animate-in fade-in scale-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="relative">
                    <Search className="absolute left-6 top-6 text-zinc-500" size={20} />
                    <input
                        ref={inputRef}
                        className="command-palette-input"
                        placeholder="Search navigation or projects..."
                        value={query}
                        onChange={e => {
                            setQuery(e.target.value);
                            setActiveIndex(0);
                        }}
                    />
                    <div className="absolute right-6 top-6 flex items-center gap-2 opacity-50">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Esc to close</span>
                    </div>
                </div>

                <div className="command-palette-results custom-scrollbar">
                    {filteredActions.length > 0 ? (
                        <div className="space-y-4 pb-2">
                            {categories.map(category => {
                                const categoryActions = filteredActions.filter(a => a.category === category);
                                if (categoryActions.length === 0) return null;

                                return (
                                    <div key={category} className="space-y-1">
                                        <h3 className="px-4 py-2 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
                                            {category}
                                        </h3>
                                        {categoryActions.map((action) => {
                                            const globalIndex = filteredActions.indexOf(action);
                                            const isActive = globalIndex === activeIndex;

                                            return (
                                                <button
                                                    key={action.id}
                                                    className={`command-palette-item ${isActive ? 'active' : ''}`}
                                                    onClick={() => {
                                                        action.action();
                                                        onClose();
                                                    }}
                                                    onMouseEnter={() => setActiveIndex(globalIndex)}
                                                >
                                                    <div className={`p-2 rounded-lg transition-colors ${isActive
                                                            ? 'bg-indigo-500/20 text-indigo-400'
                                                            : 'bg-white/5 text-zinc-500'
                                                        }`}>
                                                        {action.icon}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{action.title}</span>
                                                        {action.type === 'project' && (
                                                            <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-wider">Switch Project</span>
                                                        )}
                                                    </div>
                                                    {action.shortcut && (
                                                        <span className="command-palette-shortcut">
                                                            {action.shortcut}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4">
                                <Command className="text-zinc-600" size={24} />
                            </div>
                            <p className="text-zinc-500 text-sm font-medium">No results found for "{query}"</p>
                            <p className="text-zinc-700 text-xs mt-1 uppercase tracking-widest font-bold">Try searching for a project or page</p>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5"><span className="px-1 py-0.5 bg-white/5 rounded border border-white/10 text-white">↑↓</span> Navigate</span>
                        <span className="flex items-center gap-1.5"><span className="px-1 py-0.5 bg-white/5 rounded border border-white/10 text-white">Enter</span> Select</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span>Flowday OS</span>
                        <div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse ml-1" />
                    </div>
                </div>
            </div>
        </div>
    );
}
