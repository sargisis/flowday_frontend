import type { Task } from '../api/tasks';
import type { TaskDependency } from '../api/taskDependencies';

export interface GraphNode {
    id: string;
    task: Task;
    x: number;
    y: number;
    level: number; // Depth in dependency tree
}

export interface GraphEdge {
    from: string;
    to: string;
    type: 'depends_on' | 'blocks' | 'blocked_by';
}

export interface DependencyGraph {
    nodes: GraphNode[];
    edges: GraphEdge[];
    cycles: string[][]; // Detected cycles
}

/**
 * Build a dependency graph from tasks and their dependencies
 */
export function buildDependencyGraph(
    tasks: Task[],
    dependenciesMap: Map<string, TaskDependency>,
    rootTaskId: string
): DependencyGraph {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const visited = new Set<string>();
    const nodeMap = new Map<string, GraphNode>();

    // Create root node
    const rootTask = tasks.find(t => String(t.id) === String(rootTaskId));
    if (!rootTask) {
        return { nodes: [], edges: [], cycles: [] };
    }

    // BFS to build graph
    const queue: Array<{ taskId: string; level: number }> = [{ taskId: rootTaskId, level: 0 }];
    visited.add(rootTaskId);

    while (queue.length > 0) {
        const { taskId, level } = queue.shift()!;
        const task = tasks.find(t => String(t.id) === String(taskId));
        if (!task) continue;

        // Create node if not exists
        if (!nodeMap.has(taskId)) {
            const node: GraphNode = {
                id: taskId,
                task,
                x: 0, // Will be calculated in layout
                y: 0,
                level,
            };
            nodes.push(node);
            nodeMap.set(taskId, node);
        }

        const deps = dependenciesMap.get(taskId);
        if (!deps) continue;

        // Process depends_on (incoming edges)
        (deps.depends_on || []).forEach((dep: any) => {
            const depId = String(dep.id || dep);
            const depTask = tasks.find(t => String(t.id) === depId);
            if (!depTask) return;

            edges.push({
                from: depId,
                to: taskId,
                type: 'depends_on',
            });

            if (!visited.has(depId)) {
                visited.add(depId);
                queue.push({ taskId: depId, level: level - 1 });
            }
        });

        // Process blocks (outgoing edges)
        (deps.blocks || []).forEach((blocked: any) => {
            const blockedId = String(blocked.id || blocked);
            const blockedTask = tasks.find(t => String(t.id) === blockedId);
            if (!blockedTask) return;

            edges.push({
                from: taskId,
                to: blockedId,
                type: 'blocks',
            });

            if (!visited.has(blockedId)) {
                visited.add(blockedId);
                queue.push({ taskId: blockedId, level: level + 1 });
            }
        });

        // Process blocked_by (reverse of blocks)
        (deps.blocked_by || []).forEach((blocker: any) => {
            const blockerId = String(blocker.id || blocker);
            const blockerTask = tasks.find(t => String(t.id) === blockerId);
            if (!blockerTask) return;

            edges.push({
                from: blockerId,
                to: taskId,
                type: 'blocked_by',
            });

            if (!visited.has(blockerId)) {
                visited.add(blockerId);
                queue.push({ taskId: blockerId, level: level - 1 });
            }
        });
    }

    // Detect cycles using DFS
    const cycles = detectCycles(nodes, edges);

    // Layout nodes using hierarchical layout
    layoutNodes(nodes);

    return { nodes, edges, cycles };
}

/**
 * Detect cycles in the graph
 */
function detectCycles(nodes: GraphNode[], edges: GraphEdge[]): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const path: string[] = [];

    const dfs = (nodeId: string): boolean => {
        if (recStack.has(nodeId)) {
            // Found cycle
            const cycleStart = path.indexOf(nodeId);
            if (cycleStart !== -1) {
                cycles.push([...path.slice(cycleStart), nodeId]);
            }
            return true;
        }

        if (visited.has(nodeId)) {
            return false;
        }

        visited.add(nodeId);
        recStack.add(nodeId);
        path.push(nodeId);

        const outgoingEdges = edges.filter(e => e.from === nodeId);
        for (const edge of outgoingEdges) {
            if (dfs(edge.to)) {
                return true;
            }
        }

        path.pop();
        recStack.delete(nodeId);
        return false;
    };

    for (const node of nodes) {
        if (!visited.has(node.id)) {
            dfs(node.id);
        }
    }

    return cycles;
}

/**
 * Layout nodes in a hierarchical structure
 */
function layoutNodes(nodes: GraphNode[]): void {
    if (nodes.length === 0) return;

    // Group nodes by level
    const levelGroups = new Map<number, GraphNode[]>();
    nodes.forEach(node => {
        if (!levelGroups.has(node.level)) {
            levelGroups.set(node.level, []);
        }
        levelGroups.get(node.level)!.push(node);
    });

    // Calculate positions
    const nodeSpacing = 380; // Reduced from 450
    const levelSpacing = 280; // Reduced from 300
    const minLevel = Math.min(...nodes.map(n => n.level));
    const maxLevel = Math.max(...nodes.map(n => n.level));

    // Center root at level 0
    const rootLevel = 0;
    const rootNodes = levelGroups.get(rootLevel) || [];
    rootNodes.forEach((node, index) => {
        node.x = (index - (rootNodes.length - 1) / 2) * nodeSpacing;
        node.y = 0;
    });

    // Layout other levels
    for (let level = minLevel; level <= maxLevel; level++) {
        if (level === rootLevel) continue;

        const levelNodes = levelGroups.get(level) || [];
        // Sort nodes by title within level to make layout more stable
        levelNodes.sort((a, b) => a.task.title.localeCompare(b.task.title));
        const y = (level - rootLevel) * levelSpacing;

        levelNodes.forEach((node, index) => {
            node.x = (index - (levelNodes.length - 1) / 2) * nodeSpacing;
            node.y = y;
        });
    }
}

/**
 * Get status color for a task
 */
export function getTaskStatusColor(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower === 'done') return 'bg-emerald-500';
    if (statusLower === 'in_progress') return 'bg-indigo-500';
    if (statusLower === 'todo') return 'bg-zinc-500';
    return 'bg-amber-500';
}

/**
 * Get priority color for a task
 */
export function getTaskPriorityColor(priority: string): string {
    const priorityLower = priority.toLowerCase();
    if (priorityLower === 'high') return 'border-rose-500';
    if (priorityLower === 'medium') return 'border-amber-500';
    return 'border-zinc-500';
}
