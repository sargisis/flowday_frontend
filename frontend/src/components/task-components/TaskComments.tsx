import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, Trash2, Edit2, Check, X } from "lucide-react";
import { getTaskComments, createComment, updateComment, deleteComment, type Comment } from "../../api/comments";
import { useUser } from "../../context/UserContext";
import { toast } from "sonner";

interface TaskCommentsProps {
    taskId: string;
}

export default function TaskComments({ taskId }: TaskCommentsProps) {
    const { user } = useUser();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        loadComments();
    }, [taskId]);

    useEffect(() => {
        if (editingId && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
        }
    }, [editingId]);

    const loadComments = async () => {
        try {
            setLoading(true);
            const data = await getTaskComments(taskId);
            setComments(data);
        } catch (error) {
            console.error("Failed to load comments", error);
            toast.error("Failed to load comments");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const comment = await createComment(taskId, newComment.trim());
            setComments([...comments, comment]);
            setNewComment("");
            toast.success("Comment added");
        } catch (error) {
            console.error("Failed to create comment", error);
            toast.error("Failed to add comment");
        }
    };

    const handleStartEdit = (comment: Comment) => {
        setEditingId(comment.id);
        setEditContent(comment.content);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditContent("");
    };

    const handleSaveEdit = async (commentId: string) => {
        if (!editContent.trim()) return;

        try {
            await updateComment(commentId, editContent.trim());
            setComments(comments.map(c => c.id === commentId ? { ...c, content: editContent.trim(), updated_at: new Date().toISOString() } : c));
            setEditingId(null);
            setEditContent("");
            toast.success("Comment updated");
        } catch (error) {
            console.error("Failed to update comment", error);
            toast.error("Failed to update comment");
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm("Are you sure you want to delete this comment?")) return;

        try {
            await deleteComment(commentId);
            setComments(comments.filter(c => c.id !== commentId));
            toast.success("Comment deleted");
        } catch (error) {
            console.error("Failed to delete comment", error);
            toast.error("Failed to delete comment");
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    const canEditOrDelete = (comment: Comment) => {
        return user?.id === comment.user_id;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <MessageCircle size={18} className="text-zinc-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Comments</h3>
                {comments.length > 0 && (
                    <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                        {comments.length}
                    </span>
                )}
            </div>

            {/* Comments List */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="text-center py-8 text-zinc-500 text-sm">Loading comments...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 text-sm">No comments yet. Be the first to comment!</div>
                ) : (
                    comments.map((comment) => (
                        <div
                            key={comment.id}
                            className="p-3 bg-black/20 border border-white/5 rounded-xl hover:border-white/10 transition-all"
                        >
                            {editingId === comment.id ? (
                                <div className="space-y-2">
                                    <textarea
                                        ref={textareaRef}
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none"
                                        rows={3}
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={handleCancelEdit}
                                            className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-800 rounded-lg transition-all flex items-center gap-1.5"
                                        >
                                            <X size={14} />
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleSaveEdit(comment.id)}
                                            className="px-3 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all flex items-center gap-1.5"
                                        >
                                            <Check size={14} />
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                                                {comment.content}
                                            </p>
                                            <p className="text-xs text-zinc-500 mt-1.5">
                                                {formatDate(comment.created_at)}
                                                {comment.updated_at !== comment.created_at && " (edited)"}
                                            </p>
                                        </div>
                                        {canEditOrDelete(comment) && (
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleStartEdit(comment)}
                                                    className="p-1.5 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                                                    title="Edit comment"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(comment.id)}
                                                    className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                                                    title="Delete comment"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="space-y-2">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                    rows={3}
                />
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2"
                    >
                        <Send size={14} />
                        Post Comment
                    </button>
                </div>
            </form>
        </div>
    );
}
