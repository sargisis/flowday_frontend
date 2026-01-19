import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Hash } from 'lucide-react';
import type { Tag, TagColor } from '../../types/tags';
import { TAG_COLORS } from '../../types/tags';
import TagBadge from './TagBadge';

interface TagInputProps {
    tags: Tag[];
    availableTags?: Tag[];
    onTagsChange: (tags: Tag[]) => void;
    placeholder?: string;
    maxTags?: number;
}

export default function TagInput({ 
    tags, 
    availableTags = [], 
    onTagsChange, 
    placeholder = 'Add tags...',
    maxTags 
}: TagInputProps) {
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedColor, setSelectedColor] = useState<TagColor>('blue');
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredSuggestions = availableTags.filter(
        tag => 
            tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
            !tags.some(t => t.id === tag.id)
    );

    const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            handleAddTag(inputValue.trim());
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            // Remove last tag on backspace
            handleRemoveTag(tags[tags.length - 1].id);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
            inputRef.current?.blur();
        }
    };

    const handleAddTag = (tagName: string) => {
        if (maxTags && tags.length >= maxTags) return;
        
        // Check if tag already exists
        const existingTag = tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
        if (existingTag) {
            setInputValue('');
            return;
        }

        // Check if tag exists in available tags
        const availableTag = availableTags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
        
        if (availableTag) {
            onTagsChange([...tags, availableTag]);
        } else {
            // Create new tag
            const newTag: Tag = {
                id: `temp-${Date.now()}`,
                name: tagName,
                color: selectedColor,
            };
            onTagsChange([...tags, newTag]);
        }
        
        setInputValue('');
        setShowSuggestions(false);
    };

    const handleRemoveTag = (tagId: string) => {
        onTagsChange(tags.filter(t => t.id !== tagId));
    };

    const handleSuggestionClick = (tag: Tag) => {
        handleAddTag(tag.name);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="flex flex-wrap gap-2 p-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-white/10 rounded-lg min-h-[40px] focus-within:ring-2 focus-within:ring-indigo-500">
                {tags.map(tag => (
                    <TagBadge
                        key={tag.id}
                        tag={tag}
                        onRemove={() => handleRemoveTag(tag.id)}
                        showRemove
                        size="sm"
                    />
                ))}
                <div className="flex-1 min-w-[120px] relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onKeyDown={handleInputKeyDown}
                        placeholder={tags.length === 0 ? placeholder : ''}
                        className="w-full bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-white placeholder-zinc-500"
                    />
                    
                    {showSuggestions && (inputValue || filteredSuggestions.length > 0) && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-white/10 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                            {filteredSuggestions.length > 0 && (
                                <div className="p-2">
                                    <div className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2 px-2">
                                        Existing Tags
                                    </div>
                                    {filteredSuggestions.map(tag => (
                                        <button
                                            key={tag.id}
                                            onClick={() => handleSuggestionClick(tag)}
                                            className="w-full text-left px-2 py-1.5 rounded hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors flex items-center gap-2"
                                        >
                                            <Hash size={14} className="text-zinc-500" />
                                            <TagBadge tag={tag} size="sm" />
                                        </button>
                                    ))}
                                </div>
                            )}
                            
                            {inputValue && !filteredSuggestions.some(t => t.name.toLowerCase() === inputValue.toLowerCase()) && (
                                <div className="p-2 border-t border-zinc-300 dark:border-white/10">
                                    <div className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2 px-2">
                                        Create New Tag
                                    </div>
                                    <div className="px-2 py-1.5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs text-zinc-600 dark:text-zinc-400">Color:</span>
                                            <div className="flex gap-1">
                                                {TAG_COLORS.map(color => (
                                                    <button
                                                        key={color.value}
                                                        onClick={() => setSelectedColor(color.value as TagColor)}
                                                        className={`w-5 h-5 rounded border-2 transition-all ${
                                                            selectedColor === color.value
                                                                ? `${color.border} ${color.bg} border-2 scale-110`
                                                                : 'border-zinc-300 dark:border-white/20 hover:scale-105'
                                                        }`}
                                                        style={{ backgroundColor: color.value === selectedColor ? undefined : 'transparent' }}
                                                    >
                                                        <div className={`w-full h-full rounded ${color.bg}`} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAddTag(inputValue)}
                                            className="w-full px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 justify-center"
                                        >
                                            <Hash size={12} />
                                            Create "{inputValue}"
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
