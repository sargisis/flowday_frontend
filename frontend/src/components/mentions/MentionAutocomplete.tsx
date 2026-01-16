import { useState, useEffect, useRef } from "react";
import { User } from "lucide-react";
import { getProjectMembers, type ProjectMember } from "../../api/projectMembers";

interface MentionAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onMentionSelect?: (username: string) => void;
  projectId?: string;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export default function MentionAutocomplete({
  value,
  onChange,
  onMentionSelect,
  projectId,
  placeholder = "Type @ to mention someone...",
  className = "",
  rows = 3,
}: MentionAutocompleteProps) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<ProjectMember[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (projectId) {
      loadMembers();
    }
  }, [projectId]);

  const loadMembers = async () => {
    try {
      if (projectId) {
        const data = await getProjectMembers(projectId);
        // Filter accepted members (check accepted_at field)
        setMembers(data.filter(m => m.accepted_at));
      }
    } catch (error) {
      console.error("Failed to load members", error);
    }
  };

  // Handle keyboard navigation only when suggestions are visible
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      // Normal textarea behavior when no suggestions
      return;
    }

    // Only handle special keys when suggestions are visible
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectMention(suggestions[selectedIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowSuggestions(false);
    }
    // For all other keys, allow normal textarea behavior
  };

  const handleChange = (newValue: string) => {
    onChange(newValue);

    // Find @mention pattern
    const cursorPos = textareaRef.current?.selectionStart || newValue.length;
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const match = textBeforeCursor.match(/@(\w*)$/);

    if (match && projectId) {
      const query = match[1].toLowerCase();
      const mentionPos = textBeforeCursor.lastIndexOf("@");
      
      setMentionStart(mentionPos);
      
      let filtered: ProjectMember[] = [];
      if (query.length === 0) {
        filtered = members.slice(0, 5);
      } else {
        filtered = members.filter(
          (m) =>
            m.user?.name?.toLowerCase().includes(query) ||
            m.user?.email?.toLowerCase().includes(query)
        ).slice(0, 5);
      }
      
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
      setMentionStart(null);
    }
  };

  const selectMention = (member: ProjectMember) => {
    if (!mentionStart || !textareaRef.current) return;

    const username = member.user?.name || member.user?.email || "user";
    const beforeMention = value.substring(0, mentionStart);
    const afterMention = value.substring(textareaRef.current.selectionStart);
    const newValue = `${beforeMention}@${username} ${afterMention}`;

    onChange(newValue);
    setShowSuggestions(false);
    setMentionStart(null);

    // Set cursor position after mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = mentionStart + username.length + 2; // +2 for @ and space
        textareaRef.current.setSelectionRange(newPos, newPos);
        textareaRef.current.focus();
      }
    }, 0);

    onMentionSelect?.(username);
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        rows={rows}
      />

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl max-h-48 overflow-y-auto"
          style={{
            bottom: "100%",
            left: 0,
            right: 0,
          }}
        >
          {suggestions.map((member, index) => (
            <button
              key={member.id}
              type="button"
              onClick={() => selectMention(member)}
              className={`w-full px-3 py-2 text-left hover:bg-zinc-800 transition-colors flex items-center gap-2 ${
                index === selectedIndex ? "bg-zinc-800" : ""
              }`}
            >
              <User className="w-4 h-4 text-zinc-400" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">
                  {member.user?.name || "Unknown User"}
                </div>
                {member.user?.email && (
                  <div className="text-xs text-zinc-400 truncate">
                    {member.user.email}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
