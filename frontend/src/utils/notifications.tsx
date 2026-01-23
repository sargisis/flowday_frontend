import React from 'react';
import { toast, type ExternalToast } from 'sonner';
import { CheckCircle2, XCircle, AlertCircle, Info, Loader2, Sparkles } from 'lucide-react';

interface NotificationOptions extends ExternalToast {
  icon?: React.ReactNode;
  duration?: number;
}

/**
 * Enhanced notification system with beautiful animations and progress
 */
export const notify = {
  /**
   * Success notification with checkmark
   */
  success: (message: string, options?: NotificationOptions) => {
    return toast.success(message, {
      icon: <CheckCircle2 className="text-emerald-500" size={20} />,
      duration: 3000,
      ...options,
      className: 'success-toast',
    });
  },

  /**
   * Error notification with X icon
   */
  error: (message: string, options?: NotificationOptions) => {
    return toast.error(message, {
      icon: <XCircle className="text-red-500" size={20} />,
      duration: 4000,
      ...options,
      className: 'error-toast',
    });
  },

  /**
   * Warning notification with alert icon
   */
  warning: (message: string, options?: NotificationOptions) => {
    return toast.warning(message, {
      icon: <AlertCircle className="text-amber-500" size={20} />,
      duration: 3500,
      ...options,
      className: 'warning-toast',
    });
  },

  /**
   * Info notification
   */
  info: (message: string, options?: NotificationOptions) => {
    return toast.info(message, {
      icon: <Info className="text-blue-500" size={20} />,
      duration: 3000,
      ...options,
      className: 'info-toast',
    });
  },

  /**
   * Loading notification with spinner
   */
  loading: (message: string, options?: NotificationOptions) => {
    return toast.loading(message, {
      icon: <Loader2 className="text-indigo-500 animate-spin" size={20} />,
      ...options,
      className: 'loading-toast',
    });
  },

  /**
   * Special notification with sparkles
   */
  special: (message: string, options?: NotificationOptions) => {
    return toast(message, {
      icon: <Sparkles className="text-purple-500" size={20} />,
      duration: 4000,
      ...options,
      className: 'special-toast',
    });
  },

  /**
   * Promise-based notification with loading, success, and error states
   */
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
      classNames: {
        loading: 'loading-toast',
        success: 'success-toast',
        error: 'error-toast',
      },
    });
  },

  /**
   * Progress notification (for long operations)
   */
  progress: (
    message: string,
    onProgress: (update: (progress: number) => void, done: () => void) => void
  ) => {
    let currentProgress = 0;
    const progressId = `progress-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const toastId = toast.loading(
      <div className="flex flex-col gap-2 w-full">
        <span>{message}</span>
        <div className="w-full h-1.5 bg-zinc-800/50 rounded-full overflow-hidden">
          <div
            id={progressId}
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
            style={{ width: '0%' }}
            role="progressbar"
            aria-valuenow={0}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>,
      {
        duration: Infinity,
      }
    );

    const update = (newProgress: number) => {
      currentProgress = Math.min(100, Math.max(0, newProgress));
      const progressBar = document.getElementById(progressId);
      if (progressBar) {
        progressBar.style.width = `${currentProgress}%`;
        progressBar.setAttribute('aria-valuenow', currentProgress.toString());
      }
    };

    const done = () => {
      toast.dismiss(toastId);
      toast.success('Completed!');
    };

    try {
      onProgress(update, done);
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Operation failed');
      throw error;
    }
    
    return toastId;
  },

  /**
   * Dismiss a specific toast or all toasts
   */
  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId);
  },
};

/**
 * Batch notifications for multiple actions
 */
export const batchNotify = {
  /**
   * Show batch operation progress
   */
  batch: async <T,>(
    items: T[],
    operation: (item: T) => Promise<void>,
    {
      itemName = 'item',
      successMessage = 'All items processed',
    }: {
      itemName?: string;
      successMessage?: string;
    } = {}
  ) => {
    let completed = 0;
    const total = items.length;
    const progressId = `batch-progress-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create toast first, then use its ID
    const toastId = toast.loading(
      <div className="flex flex-col gap-2 w-full">
        <span>
          Processing {itemName}s: {completed}/{total}
        </span>
        <div className="w-full h-1.5 bg-zinc-800/50 rounded-full overflow-hidden">
          <div
            id={progressId}
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
            style={{ width: '0%' }}
            role="progressbar"
            aria-valuenow={0}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Processing ${itemName}s`}
          />
        </div>
      </div>,
      {
        duration: Infinity,
      }
    );

    const updateProgress = () => {
      const progress = (completed / total) * 100;
      const progressBar = document.getElementById(progressId);
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress.toString());
      }
      // Update toast message
      toast.loading(
        <div className="flex flex-col gap-2 w-full">
          <span>
            Processing {itemName}s: {completed}/{total}
          </span>
          <div className="w-full h-1.5 bg-zinc-800/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>,
        { id: toastId }
      );
    };

    try {
      for (const item of items) {
        await operation(item);
        completed++;
        updateProgress();
      }

      toast.dismiss(toastId);
      toast.success(successMessage);
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(`Failed after ${completed}/${total} ${itemName}s`);
      throw error;
    }
  },
};
