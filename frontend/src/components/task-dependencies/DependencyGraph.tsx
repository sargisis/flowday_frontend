import { useMemo, useState, useRef, useEffect } from 'react';
import { AlertTriangle, ZoomIn, ZoomOut, RotateCcw, Maximize2, CheckCircle2, Clock, Ban, ArrowRight, Activity } from 'lucide-react';
import type { Task } from '../../api/tasks';
import type { TaskDependency } from '../../api/taskDependencies';
import { buildDependencyGraph, getTaskPriorityColor, type GraphEdge } from '../../utils/dependencyGraph';

interface DependencyGraphProps {
    rootTaskId: string;
    tasks: Task[];
    dependenciesMap: Map<string, TaskDependency>;
    onTaskClick?: (taskId: string) => void;
    selectedTaskId?: string | null;
}

export function DependencyGraph({
    rootTaskId,
    tasks,
    dependenciesMap,
    onTaskClick,
    selectedTaskId = null,
}: DependencyGraphProps) {
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const graph = useMemo(() => {
        return buildDependencyGraph(tasks, dependenciesMap, rootTaskId);
    }, [tasks, dependenciesMap, rootTaskId]);

    const NODE_WIDTH = 200;
    const NODE_HEIGHT = 50;

    // Auto-Fit Graph on selection or mount
    useEffect(() => {
        if (graph.nodes.length === 0 || !containerRef.current) return;

        let targetX = 0;
        let targetY = 0;
        let targetZoom = 1;

        if (selectedTaskId) {
            // Focus on selected task
            const selectedNode = graph.nodes.find(n => n.id === selectedTaskId);
            if (selectedNode) {
                targetX = selectedNode.x;
                targetY = selectedNode.y;
                targetZoom = 1; // Standard zoom for focus
            }
        } else {
            // Auto-Fit entire graph
            const bounds = {
                minX: Math.min(...graph.nodes.map(n => n.x)),
                maxX: Math.max(...graph.nodes.map(n => n.x)),
                minY: Math.min(...graph.nodes.map(n => n.y)),
                maxY: Math.max(...graph.nodes.map(n => n.y)),
            };

            const graphWidth = bounds.maxX - bounds.minX + NODE_WIDTH + 100; // Add padding
            const graphHeight = bounds.maxY - bounds.minY + NODE_HEIGHT + 100;
            const containerWidth = containerRef.current.clientWidth;
            const containerHeight = containerRef.current.clientHeight;

            // Calculate fit zoom
            const zoomX = containerWidth / graphWidth;
            const zoomY = containerHeight / graphHeight;
            targetZoom = Math.min(Math.max(Math.min(zoomX, zoomY) * 0.9, 0.4), 1.2); // Clamp zoom

            targetX = (bounds.minX + bounds.maxX) / 2;
            targetY = (bounds.minY + bounds.maxY) / 2;
        }

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        setZoom(targetZoom);
        setPan({
            x: width / 2 - targetX * targetZoom,
            y: height / 2 - targetY * targetZoom,
        });
    }, [graph, selectedTaskId]); // Also trigger on selection change

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0) { // Left mouse button
            setIsPanning(true);
            setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning) {
            setPan({
                x: e.clientX - panStart.x,
                y: e.clientY - panStart.y,
            });
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        // Stop default browser scrolling
        e.preventDefault();

        if (e.ctrlKey || e.metaKey) {
            // Pinch-to-zoom or Ctrl+Scroll logic
            // In many browsers, pinch acts as Ctrl+Wheel
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            setZoom(prev => Math.max(0.4, Math.min(2.5, prev * delta)));
        } else {
            // Pan logic
            // Support Shift + Scroll for horizontal panning (standard mouse behavior)
            // If Shift is held and deltaX is 0, we treat deltaY as horizontal scroll
            let deltaX = e.deltaX;
            let deltaY = e.deltaY;

            if (e.shiftKey && deltaX === 0) {
                deltaX = deltaY;
                deltaY = 0;
            }

            setPan(prev => ({
                x: prev.x - deltaX,
                y: prev.y - deltaY
            }));
        }
    };

    const handleZoomIn = () => setZoom(prev => Math.min(2, prev * 1.2));
    const handleZoomOut = () => setZoom(prev => Math.max(0.5, prev / 1.2));
    const handleReset = () => {
        if (containerRef.current && graph.nodes.length > 0) {
            // Re-trigger auto-fit logic essentially
            // For simplicity, reusing the logic from useEffect roughly or triggering a state update
            // Since useEffect depends on 'graph', we can just clear selection to trigger "Fit All"
            if (onTaskClick) onTaskClick(''); // Hack: Deselect to trigger fit-all if supported, OR:

            // Manual Fit-All calculation
            const bounds = {
                minX: Math.min(...graph.nodes.map(n => n.x)),
                maxX: Math.max(...graph.nodes.map(n => n.x)),
                minY: Math.min(...graph.nodes.map(n => n.y)),
                maxY: Math.max(...graph.nodes.map(n => n.y)),
            };

            const graphWidth = bounds.maxX - bounds.minX + NODE_WIDTH + 100;
            const graphHeight = bounds.maxY - bounds.minY + NODE_HEIGHT + 100;
            const containerWidth = containerRef.current.clientWidth;
            const containerHeight = containerRef.current.clientHeight;

            const zoomX = containerWidth / graphWidth;
            const zoomY = containerHeight / graphHeight;
            const targetZoom = Math.min(Math.max(Math.min(zoomX, zoomY) * 0.9, 0.4), 1.2);

            const targetX = (bounds.minX + bounds.maxX) / 2;
            const targetY = (bounds.minY + bounds.maxY) / 2;

            setZoom(targetZoom);
            setPan({
                x: containerWidth / 2 - targetX * targetZoom,
                y: containerHeight / 2 - targetY * targetZoom,
            });
        }
    };

    const getEdgeColor = (type: GraphEdge['type']): string => {
        if (type === 'depends_on') return '#818cf8'; // indigo-400
        if (type === 'blocks') return '#34d399'; // emerald-400
        return '#fbbf24'; // amber-400 for blocked_by
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'done': return <CheckCircle2 size={14} className="text-emerald-400" />;
            case 'in_progress': return <Activity size={14} className="text-amber-400" />;
            case 'blocked': return <Ban size={14} className="text-rose-400" />;
            default: return <Clock size={14} className="text-zinc-400" />;
        }
    };

    const getPriorityGlow = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'high': return 'shadow-[0_0_15px_-3px_rgba(244,63,94,0.4)]';
            case 'medium': return 'shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]';
            default: return 'shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]';
        }
    };

    const getCurvePath = (from: { x: number, y: number }, to: { x: number, y: number }) => {
        const dy = to.y - from.y;
        // Advanced S-curve logic with higher tension
        const tension = 0.6;
        const cp1y = from.y + dy * tension;
        const cp2y = to.y - dy * tension;
        return `M ${from.x} ${from.y} C ${from.x} ${cp1y}, ${to.x} ${cp2y}, ${to.x} ${to.y}`;
    };

    if (graph.nodes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500 bg-white/5 border border-zinc-800 rounded-2xl">
                <div className="w-10 h-10 mb-3 text-zinc-700 bg-zinc-800/50 rounded-full flex items-center justify-center">
                    <Maximize2 size={24} />
                </div>
                <p className="text-sm font-medium">No system connections detected</p>
                <p className="text-[10px] uppercase tracking-widest mt-1 opacity-50">Main entity isolated</p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`group relative w-full bg-gradient-to-br from-zinc-950/80 via-black to-zinc-900/60 backdrop-blur-2xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 select-none ${isFullscreen ? 'fixed inset-0 z-50' : 'h-[700px]'
                }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
        >
            {/* Mesh Gradient Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/20 blur-[120px] rounded-full" />
            </div>

            {/* Controls */}
            <div className="absolute top-6 right-6 z-20 flex flex-col gap-2 scale-90 sm:scale-100">
                <div className="flex gap-2 p-1.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                    <button onClick={handleZoomIn} className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-zinc-400 hover:text-white" title="Zoom In"><ZoomIn size={18} /></button>
                    <button onClick={handleZoomOut} className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-zinc-400 hover:text-white" title="Zoom Out"><ZoomOut size={18} /></button>
                    <div className="w-px h-6 bg-white/10 mx-1 my-auto" />
                    <button onClick={handleReset} className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-zinc-400 hover:text-white" title="Reset View"><RotateCcw size={18} /></button>
                    <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-zinc-400 hover:text-white" title="Toggle Fullscreen">
                        <Maximize2 size={18} />
                    </button>
                </div>
            </div>

            {/* Cycle Warning */}
            {graph.cycles.length > 0 && (
                <div className="absolute top-6 left-6 z-20 flex items-center gap-3 px-4 py-2.5 bg-rose-500/10 backdrop-blur-xl border border-rose-500/20 rounded-2xl animate-pulse">
                    <AlertTriangle size={18} className="text-rose-400" />
                    <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                        {graph.cycles.length} Temporal Cycle{graph.cycles.length > 1 ? 's' : ''} detected
                    </span>
                </div>
            )}

            {/* SVG Graph */}
            <svg
                className="w-full h-full cursor-grab active:cursor-grabbing"
                style={{ transition: isPanning ? 'none' : 'transform 0.1s' }}
            >
                <defs>
                    <filter id="node-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>

                    {/* Blueprint/Grid Pattern */}
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" opacity="0.03" />
                        <circle cx="0" cy="0" r="1" fill="white" opacity="0.05" />
                    </pattern>

                    {/* Node pulsing animation */}
                    <style>
                        {`
                            @keyframes root-pulse {
                                0% { transform: scale(1); filter: brightness(1); shadow: 0 0 0px rgba(99, 102, 241, 0); }
                                50% { transform: scale(1.02); filter: brightness(1.2); shadow: 0 0 20px rgba(99, 102, 241, 0.4); }
                                100% { transform: scale(1); filter: brightness(1); shadow: 0 0 0px rgba(99, 102, 241, 0); }
                            }
                            .root-node-active {
                                animation: root-pulse 3s infinite ease-in-out;
                            }
                        `}
                    </style>
                </defs>

                {/* Background Grid */}
                <rect width="100%" height="100%" fill="url(#grid)" pointerEvents="none" />

                <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                    {/* Bezier Edges */}
                    {graph.edges.map((edge, index) => {
                        const fromNode = graph.nodes.find(n => n.id === edge.from);
                        const toNode = graph.nodes.find(n => n.id === edge.to);
                        if (!fromNode || !toNode) return null;

                        const isCycle = graph.cycles.some(cycle =>
                            cycle.includes(edge.from) && cycle.includes(edge.to)
                        );

                        // Highlight edge if either connected node is hovered
                        const isHighPriorityPath = hoveredNode && (edge.from === hoveredNode || edge.to === hoveredNode);
                        const color = getEdgeColor(edge.type);
                        const pathD = getCurvePath(fromNode, toNode);

                        return (
                            <g key={`${edge.from}-${edge.to}-${index}`} className="transition-all duration-300">
                                {/* Invisible wider path for better hover triggers */}
                                <path
                                    d={pathD}
                                    stroke="transparent"
                                    strokeWidth={15}
                                    fill="none"
                                    className="cursor-pointer"
                                />

                                {/* Main Path */}
                                <path
                                    d={pathD}
                                    stroke={color}
                                    strokeWidth={isHighPriorityPath ? 3 : isCycle ? 3 : 1.5}
                                    strokeDasharray={isCycle ? '8,4' : 'none'}
                                    fill="none"
                                    opacity={hoveredNode ? (isHighPriorityPath ? 1 : 0.1) : (isCycle ? 1 : 0.4)}
                                    className={`transition-all duration-500`}
                                />

                                {/* Animated Flow Circle - Only on active paths when hovering */}
                                {!isCycle && (
                                    <g opacity={hoveredNode ? (isHighPriorityPath ? 1 : 0.05) : 0.8}>
                                        <circle r="3.5" fill={color} opacity="0.3" className="blur-[2px]">
                                            <animateMotion
                                                path={pathD}
                                                dur="2s"
                                                repeatCount="indefinite"
                                                begin={`${index * 0.4}s`}
                                            />
                                        </circle>
                                        <circle r="2" fill="white">
                                            <animateMotion
                                                path={pathD}
                                                dur="2s"
                                                repeatCount="indefinite"
                                                begin={`${index * 0.4}s`}
                                            />
                                        </circle>
                                    </g>
                                )}
                            </g>
                        );
                    })}

                    {/* Glassmorphism Nodes */}
                    {graph.nodes.map((node) => {
                        const isRoot = node.id === rootTaskId;
                        const isSelected = selectedTaskId === node.id;
                        const isHovered = hoveredNode === node.id;
                        const priorityColor = getTaskPriorityColor(node.task.priority);

                        return (
                            <foreignObject
                                key={node.id}
                                x={node.x - NODE_WIDTH / 2}
                                y={node.y - NODE_HEIGHT / 2}
                                width={NODE_WIDTH}
                                height={NODE_HEIGHT + 30}
                                className="overflow-visible"
                            >
                                <div
                                    onClick={() => onTaskClick?.(node.id)}
                                    onMouseEnter={() => setHoveredNode(node.id)}
                                    onMouseLeave={() => setHoveredNode(null)}
                                    className={`
                                        w-[220px] p-3 rounded-2xl cursor-pointer transition-all duration-200 flex items-center gap-3
                                        ${isRoot
                                            ? 'bg-indigo-500/15 border-indigo-500/50 ring-2 ring-indigo-500/30 root-node-active shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]'
                                            : isSelected
                                                ? 'bg-blue-500/20 border-blue-400/60 ring-2 ring-blue-500/30 shadow-[0_0_40px_-5px_rgba(59,130,246,0.5)] z-40 scale-100'
                                                : 'bg-zinc-900/80 border-white/10'
                                        }
                                        ${isHovered ? 'scale-105 -translate-y-1 bg-white/[0.15] border-white/50 shadow-[0_0_50px_-10px_rgba(255,255,255,0.4)] z-50' : ''}
                                        ${(hoveredNode && !isHovered) || (selectedTaskId && !isSelected && !isHovered && !isRoot) ? 'opacity-25' : 'opacity-100'}
                                        ${getPriorityGlow(node.task.priority)}
                                        border backdrop-blur-3xl relative
                                    `}
                                >
                                    {/* Connection Points (Visual only) */}
                                    <div className="absolute top-1/2 -left-1 w-1.5 h-1.5 rounded-full bg-white/20 -translate-y-1/2" />
                                    <div className="absolute top-1/2 -right-1 w-1.5 h-1.5 rounded-full bg-white/20 -translate-y-1/2" />

                                    {/* Priority/Status Indicator */}
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-black/40 border border-white/5`}>
                                        {getStatusIcon(node.task.status)}
                                    </div>

                                    <div className="flex-1 min-w-0 pr-2">
                                        <p className={`text-[11px] font-bold truncate ${isRoot ? 'text-indigo-300' : 'text-zinc-200'}`}>
                                            {node.task.title}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className={`w-1.5 h-1.5 rounded-full`} style={{ background: priorityColor }} />
                                            <span className="text-[8px] uppercase tracking-widest font-black text-zinc-500">{node.task.priority}</span>
                                        </div>
                                    </div>

                                    {/* Action indicator on hover */}
                                    <ArrowRight size={12} className={`text-white transition-all duration-300 ${isHovered ? 'opacity-40 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                                </div>
                            </foreignObject>
                        );
                    })}
                </g>
            </svg>

            {/* Sleek Legend */}
            <div className="absolute bottom-6 left-6 z-20 bg-black/40 backdrop-blur-2xl px-5 py-4 border border-white/10 rounded-2xl shadow-2xl flex flex-col gap-2.5 transition-all duration-500 hover:bg-black/60 translate-y-0 hover:-translate-y-1">
                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">Navigation Matrix</h5>
                {[
                    { label: 'Depends On', color: 'bg-indigo-400' },
                    { label: 'Blocks', color: 'bg-emerald-400' },
                    { label: 'Blocked By', color: 'bg-amber-400' }
                ].map(item => (
                    <div key={item.label} className="flex items-center gap-3 group/item">
                        <div className={`w-1.5 h-1.5 rounded-full ${item.color} shadow-[0_0_8px_rgba(255,255,255,0.2)]`} />
                        <span className="text-[11px] font-bold text-zinc-400 group-hover/item:text-zinc-200 transition-colors">{item.label}</span>
                    </div>
                ))}
                {graph.cycles.length > 0 && (
                    <div className="flex items-center gap-3 pt-2 mt-1 border-t border-white/5">
                        <div className="w-2 h-0.5 bg-rose-500/80 rounded-full" />
                        <span className="text-[11px] font-bold text-rose-400/80 uppercase">Cycle Conflict</span>
                    </div>
                )}
            </div>
        </div>
    );
}
