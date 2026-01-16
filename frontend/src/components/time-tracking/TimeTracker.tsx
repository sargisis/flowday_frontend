import { useState, useEffect } from "react";
import { Play, Square, Clock, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import {
  startTimeEntry,
  stopTimeEntry,
  getTimeEntries,
  type TimeEntry,
} from "../../api/timeTracking";

interface TimeTrackerProps {
  taskId: string;
  onTimeUpdate?: (hours: number) => void;
}

export default function TimeTracker({
  taskId,
  onTimeUpdate,
}: TimeTrackerProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEntries();
    checkActiveEntry();
  }, [taskId]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTracking && currentEntry) {
      interval = setInterval(() => {
        const start = new Date(currentEntry.start_time).getTime();
        const now = Date.now();
        setElapsedTime((now - start) / 1000 / 60 / 60); // Convert to hours
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, currentEntry]);

  const checkActiveEntry = async () => {
    try {
      const allEntries = await getTimeEntries(taskId);
      const entriesArray = Array.isArray(allEntries) ? allEntries : [];
      const active = entriesArray.find((e) => !e.end_time);
      if (active) {
        setCurrentEntry(active);
        setIsTracking(true);
        const start = new Date(active.start_time).getTime();
        const now = Date.now();
        setElapsedTime((now - start) / 1000 / 60 / 60);
      }
    } catch (error) {
      // Ignore errors
    }
  };

  const loadEntries = async () => {
    try {
      const data = await getTimeEntries(taskId);
      const entriesArray = Array.isArray(data) ? data : [];
      setEntries(entriesArray);
      const total = entriesArray.reduce((sum, e) => sum + (e.duration || 0), 0);
      onTimeUpdate?.(total);
    } catch (error) {
      // Ignore errors, but ensure entries is always an array
      setEntries([]);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const entry = await startTimeEntry({ task_id: taskId });
      setCurrentEntry(entry);
      setIsTracking(true);
      setElapsedTime(0);
      toast.success("Time tracking started");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to start tracking");
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    if (!currentEntry) return;
    setLoading(true);
    try {
      await stopTimeEntry({ entry_id: currentEntry.id });
      setIsTracking(false);
      setCurrentEntry(null);
      setElapsedTime(0);
      toast.success("Time tracking stopped");
      loadEntries();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to stop tracking");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const totalTime = (Array.isArray(entries) ? entries : []).reduce((sum, e) => sum + (e.duration || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg border border-zinc-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <span className="text-sm text-zinc-400">Total Time</span>
            <span className="text-lg font-semibold">
              {formatTime(totalTime + elapsedTime)}
            </span>
          </div>
          {isTracking && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-red-400">
                Tracking: {formatTime(elapsedTime)}
              </span>
            </div>
          )}
        </div>

        {!isTracking ? (
          <button
            onClick={handleStart}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            Start
          </button>
        ) : (
          <button
            onClick={handleStop}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <Square className="w-4 h-4" />
            Stop
          </button>
        )}
      </div>

      {Array.isArray(entries) && entries.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <TrendingUp className="w-4 h-4" />
            <span>Time Entries</span>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-2 bg-zinc-800 rounded text-sm"
              >
                <span className="text-zinc-400">
                  {new Date(entry.start_time).toLocaleString()}
                </span>
                <span className="font-medium">
                  {formatTime(entry.duration)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
