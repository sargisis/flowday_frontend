import { useMemo, useState, useRef, useEffect } from 'react';
import { AlertTriangle, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';
import type { Task } from '../../api/tasks';
import type { TaskDependency } from '../../api/taskDependencies';
import { buildDependencyGraph, getTaskStatusColor, getTaskPriorityColor, type GraphEdge } from '../../utils/dependencyGraph';

interface DependencyGraphProps {
    rootTaskId: string;
    tasks: Task[];
    dependenciesMap: Map<string, TaskDependency>;
    onTaskClick?: (taskId: string) => void;
}

export function DependencyGraph({
    rootTaskId,
    tasks,
    dependenciesMap,
    onTaskClick,
}: DependencyGraphProps) {
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const graph = useMemo(() => {
        return buildDependencyGraph(tasks, dependenciesMap, rootTaskId);
    }, [tasks, dependenciesMap, rootTaskId]);

    // Center graph on mount
    useEffect(() => {
        if (graph.nodes.length === 0) return;

        const bounds = {
            minX: Math.min(...graph.nodes.map(n => n.x)),
            maxX: Math.max(...graph.nodes.map(n => n.x)),
            minY: Math.min(...graph.nodes.map(n => n.y)),
            maxY: Math.max(...graph.nodes.map(n => n.y)),
        };

        const centerX = (bounds.minX + bounds.maxX) / 2;
        const centerY = (bounds.minY + bounds.maxY) / 2;

        if (containerRef.current) {
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;
            setPan({
                x: width / 2 - centerX,
                y: height / 2 - centerY,
            });
        }
    }, [graph]);

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
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom(prev => Math.max(0.5, Math.min(2, prev * delta)));
    };

    const handleZoomIn = () => setZoom(prev => Math.min(2, prev * 1.2));
    const handleZoomOut = () => setZoom(prev => Math.max(0.5, prev / 1.2));
    const handleReset = () => {
        setZoom(1);
        if (containerRef.current && graph.nodes.length > 0) {
            const bounds = {
                minX: Math.min(...graph.nodes.map(n => n.x)),
                maxX: Math.max(...graph.nodes.map(n => n.x)),
                minY: Math.min(...graph.nodes.map(n => n.y)),
                maxY: Math.max(...graph.nodes.map(n => n.y)),
            };
            const centerX = (bounds.minX + bounds.maxX) / 2;
            const centerY = (bounds.minY + bounds.maxY) / 2;
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;
            setPan({
                x: width / 2 - centerX,
                y: height / 2 - centerY,
            });
        }
    };

    const getEdgeColor = (type: GraphEdge['type']): string => {
        if (type === 'depends_on') return '#8b5cf6'; // indigo
        if (type === 'blocks') return '#10b981'; // emerald
        return '#f59e0b'; // amber for blocked_by
    };

    const getEdgeMarker = (type: GraphEdge['type']): string => {
        if (type === 'depends_on') return 'url(#arrow-depends)';
        if (type === 'blocks') return 'url(#arrow-blocks)';
        return 'url(#arrow-blocked)';
    };

    if (graph.nodes.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-zinc-500">
                <p>No dependencies to visualize</p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`relative bg-gradient-to-br from-zinc-900/60 via-zinc-900/40 to-zinc-800/30 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden shadow-xl ${
                isFullscreen ? 'fixed inset-0 z-50' : 'h-96'
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
        >
            {/* Controls */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button
                    onClick={handleZoomIn}
                    className="p-2.5 bg-zinc-800/90 backdrop-blur-sm hover:bg-zinc-700/90 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
                    title="Zoom In"
                >
                    <ZoomIn size={16} className="text-zinc-200" strokeWidth={2.5} />
                </button>
                <button
                    onClick={handleZoomOut}
                    className="p-2.5 bg-zinc-800/90 backdrop-blur-sm hover:bg-zinc-700/90 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
                    title="Zoom Out"
                >
                    <ZoomOut size={16} className="text-zinc-200" strokeWidth={2.5} />
                </button>
                <button
                    onClick={handleReset}
                    className="p-2.5 bg-zinc-800/90 backdrop-blur-sm hover:bg-zinc-700/90 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
                    title="Reset View"
                >
                    <RotateCcw size={16} className="text-zinc-200" strokeWidth={2.5} />
                </button>
                <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2.5 bg-zinc-800/90 backdrop-blur-sm hover:bg-zinc-700/90 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
                    title="Toggle Fullscreen"
                >
                    <Maximize2 size={16} className="text-zinc-200" strokeWidth={2.5} />
                </button>
            </div>

            {/* Cycle Warning */}
            {graph.cycles.length > 0 && (
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-2 bg-amber-500/20 border border-amber-500/40 rounded-lg">
                    <AlertTriangle size={16} className="text-amber-400" />
                    <span className="text-sm text-amber-300">
                        {graph.cycles.length} cycle{graph.cycles.length > 1 ? 's' : ''} detected
                    </span>
                </div>
            )}

            {/* SVG Graph */}
            <svg
                ref={svgRef}
                className="w-full h-full cursor-move"
                style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
            >
                <defs>
                    {/* Arrow markers */}
                    <marker
                        id="arrow-depends"
                        markerWidth="10"
                        markerHeight="10"
                        refX="9"
                        refY="3"
                        orient="auto"
                        markerUnits="strokeWidth"
                    >
                        <path d="M0,0 L0,6 L9,3 z" fill="#8b5cf6" />
                    </marker>
                    <marker
                        id="arrow-blocks"
                        markerWidth="10"
                        markerHeight="10"
                        refX="9"
                        refY="3"
                        orient="auto"
                        markerUnits="strokeWidth"
                    >
                        <path d="M0,0 L0,6 L9,3 z" fill="#10b981" />
                    </marker>
                    <marker
                        id="arrow-blocked"
                        markerWidth="10"
                        markerHeight="10"
                        refX="9"
                        refY="3"
                        orient="auto"
                        markerUnits="strokeWidth"
                    >
                        <path d="M0,0 L0,6 L9,3 z" fill="#f59e0b" />
                    </marker>
                </defs>

                <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                    {/* Edges */}
                    {graph.edges.map((edge, index) => {
                        const fromNode = graph.nodes.find(n => n.id === edge.from);
                        const toNode = graph.nodes.find(n => n.id === edge.to);
                        if (!fromNode || !toNode) return null;

                        const isCycle = graph.cycles.some(cycle =>
                            cycle.includes(edge.from) && cycle.includes(edge.to)
                        );

                        return (
                            <line
                                key={`${edge.from}-${edge.to}-${index}`}
                                x1={fromNode.x}
                                y1={fromNode.y}
                                x2={toNode.x}
                                y2={toNode.y}
                                stroke={getEdgeColor(edge.type)}
                                strokeWidth={isCycle ? 3 : 2}
                                strokeDasharray={isCycle ? '5,5' : 'none'}
                                markerEnd={getEdgeMarker(edge.type)}
                                opacity={isCycle ? 0.8 : 0.6}
                            />
                        );
                    })}

                    {/* Nodes */}
                    {graph.nodes.map((node) => {
                        const isRoot = node.id === rootTaskId;
                        const statusColor = getTaskStatusColor(node.task.status);
                        const priorityColor = getTaskPriorityColor(node.task.priority);
                        const isInCycle = graph.cycles.some(cycle => cycle.includes(node.id));

                        return (
                            <g
                                key={node.id}
                                transform={`translate(${node.x}, ${node.y})`}
                                className="cursor-pointer"
                                onClick={() => onTaskClick?.(node.id)}
                            >
                                {/* Node circle */}
                                <circle
                                    r={isRoot ? 30 : 25}
                                    fill={statusColor}
                                    stroke={isRoot ? '#6366f1' : priorityColor}
                                    strokeWidth={isRoot ? 3 : isInCycle ? 3 : 2}
                                    className="hover:opacity-80 transition-opacity"
                                />
                                {/* Task title (truncated) */}
                                <text
                                    x={0}
                                    y={isRoot ? 50 : 45}
                                    textAnchor="middle"
                                    className="text-xs fill-zinc-300 pointer-events-none"
                                    style={{ fontSize: isRoot ? '11px' : '10px' }}
                                >
                                    {node.task.title.length > 15
                                        ? node.task.title.substring(0, 15) + '...'
                                        : node.task.title}
                                </text>
                                {/* Status indicator */}
                                <circle
                                    r={6}
                                    cx={isRoot ? 20 : 18}
                                    cy={isRoot ? -20 : -18}
                                    fill={statusColor}
                                    stroke="#1f2937"
                                    strokeWidth="1"
                                />
                            </g>
                        );
                    })}
                </g>
            </svg>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 z-10 bg-zinc-800/95 backdrop-blur-md rounded-2xl p-4 text-xs space-y-2 border border-white/10 shadow-2xl">
                <div className="font-semibold text-zinc-300 mb-2">Legend</div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-indigo-500"></div>
                    <span className="text-zinc-400">Depends On</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-emerald-500"></div>
                    <span className="text-zinc-400">Blocks</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-amber-500"></div>
                    <span className="text-zinc-400">Blocked By</span>
                </div>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-700">
                    <div className="w-3 h-0.5 bg-zinc-500 border-dashed"></div>
                    <span className="text-zinc-400">Cycle</span>
                </div>
            </div>
        </div>
    );
}
