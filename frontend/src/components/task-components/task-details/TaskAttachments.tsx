import { useRef } from "react";
import { Paperclip, Upload, Image as ImageIcon, File, Trash2 } from "lucide-react";
import type { Attachment } from "../../../api/tasks";

interface TaskAttachmentsProps {
    attachments: Attachment[];
    isUploading: boolean;
    onUpload: (file: File) => Promise<void>;
    onDelete: (attachmentId: string) => Promise<void>;
}

export function TaskAttachments({ attachments, isUploading, onUpload, onDelete }: TaskAttachmentsProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        await onUpload(file);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    const getFileUrl = (url: string) => {
        if (url.startsWith('http')) return url;
        const envUrl = import.meta.env.VITE_FILE_UPLOAD_BASE_URL;
        if (envUrl) return `${envUrl}${url}`;
        const hostname = window.location.hostname;
        const baseUrl = (hostname !== 'localhost' && hostname !== '127.0.0.1')
            ? `http://${hostname}:8080`
            : 'http://localhost:8080';
        return `${baseUrl}${url}`;
    };

    return (

        <div className="border-t border-zinc-200 dark:border-zinc-800/50 pt-5">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Paperclip size={16} className="text-zinc-600 dark:text-zinc-400" />
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wide">Attachments</h3>
                    {attachments.length > 0 && (
                        <span className="text-xs text-zinc-600 dark:text-zinc-500 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                            {attachments.length}
                        </span>
                    )}
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg border border-blue-500/20 hover:border-blue-500/30 disabled:opacity-50 transition-all"
                >
                    {isUploading ? (
                        <>
                            <div className="w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                            <span>Uploading...</span>
                        </>
                    ) : (
                        <>
                            <Upload size={12} />
                            Upload
                        </>
                    )}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt,.zip"
                />
            </div>

            {attachments.length > 0 ? (
                <div className="space-y-2">
                    {attachments.map((attachment) => (
                        <div
                            key={attachment.id}
                            className="group flex items-center gap-3 p-3 bg-white dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700/50 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/70 hover:border-zinc-400 dark:hover:border-zinc-600/50 transition-all"
                        >
                            <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg ${attachment.type === "image" ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-zinc-200 dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-400'}`}>
                                {attachment.type === "image" ? (
                                    <ImageIcon size={16} />
                                ) : (
                                    <File size={16} />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <a
                                    href={getFileUrl(attachment.url)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-sm font-medium text-zinc-900 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 truncate transition-colors"
                                >
                                    {attachment.filename}
                                </a>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className="text-xs text-zinc-500 dark:text-zinc-500">{formatFileSize(attachment.size)}</span>
                                    <span className="text-zinc-400 dark:text-zinc-600">·</span>
                                    <span className="text-xs text-zinc-500 dark:text-zinc-500">{new Date(attachment.uploaded_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => onDelete(attachment.id)}
                                className="p-1.5 text-zinc-500 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                title="Delete attachment"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-zinc-500 dark:text-zinc-500 text-sm bg-zinc-50 dark:bg-zinc-800/30 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700/50">
                    No attachments yet
                </div>
            )}
        </div>
    );
}
