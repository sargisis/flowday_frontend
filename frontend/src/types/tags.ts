export interface Tag {
    id: string;
    name: string;
    color: string;
    project_id?: string;
    created_at?: string;
}

export const TAG_COLORS = [
    { name: 'Blue', value: 'blue', bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
    { name: 'Green', value: 'green', bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    { name: 'Yellow', value: 'yellow', bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
    { name: 'Orange', value: 'orange', bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
    { name: 'Red', value: 'red', bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' },
    { name: 'Purple', value: 'purple', bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
    { name: 'Pink', value: 'pink', bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30' },
    { name: 'Indigo', value: 'indigo', bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30' },
    { name: 'Gray', value: 'gray', bg: 'bg-zinc-500/20', text: 'text-zinc-400', border: 'border-zinc-500/30' },
] as const;

export type TagColor = typeof TAG_COLORS[number]['value'];

export function getTagColorClasses(color: TagColor) {
    const tagColor = TAG_COLORS.find(c => c.value === color) || TAG_COLORS[0];
    return {
        bg: tagColor.bg,
        text: tagColor.text,
        border: tagColor.border,
    };
}
