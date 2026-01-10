import React, { useEffect, useRef } from "react";

// Helper to convert Text with Unicode Emojis -> HTML with <img> tags
const textToHtml = (text: string, map: Record<string, string>) => {
    if (!text) return "";
    let html = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    Object.entries(map).forEach(([emoji, url]) => {
        // Escape emoji for regex if needed, though most are safe
        const regex = new RegExp(emoji, "g");
        html = html.replace(regex, `<img src="${url}" alt="${emoji}" data-emoji="${emoji}" class="inline-block h-6 w-6 align-middle mx-0.5 select-none" />`);
    });
    return html;
};

// Helper to convert HTML content -> Text with Unicode Emojis
const htmlToText = (element: HTMLElement) => {
    let text = "";
    element.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            text += node.textContent;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            if (el.tagName === "IMG" && el.dataset.emoji) {
                text += el.dataset.emoji;
            } else if (el.tagName === "BR") {
                // Ignore trailing BRs usually added by browsers
            } else {
                text += el.innerText; // Fallback
            }
        }
    });
    return text;
};

export const RichMessageInput = ({
    value,
    onChange,
    onSend,
    loading,
    animatedEmojiMap
}: {
    value: string,
    onChange: (v: string) => void,
    onSend: () => void,
    loading: boolean,
    animatedEmojiMap: Record<string, string>
}) => {
    const inputRef = useRef<HTMLDivElement>(null);
    const lastHtml = useRef("");

    // Sync Value Prop -> HTML
    useEffect(() => {
        if (!inputRef.current) return;

        // Generate expected HTML from the current string value
        const expectedHtml = textToHtml(value, animatedEmojiMap);

        // If the input is exactly what we expect (visually), do nothing.
        // This prevents cursor jumping when we type a regular character.
        // Only update if they differ (e.g., user typed a Unicode emoji that needs upgrading, or value changed externally)
        if (inputRef.current.innerHTML !== expectedHtml) {
            // Special Case: If the text content matches, but HTML doesn't, it implies format upgrade needed.
            // We generally force update here, managing cursor is the tricky part.

            // Simple cursor management: Save selection range (if focused)
            const selection = window.getSelection();

            inputRef.current.innerHTML = expectedHtml;

            // Restore Cursor: Move to end for now to ensure we don't trap cursor inside image
            if (document.activeElement === inputRef.current) {
                const range = document.createRange();
                range.selectNodeContents(inputRef.current);
                range.collapse(false);
                selection?.removeAllRanges();
                selection?.addRange(range);
            }
        }
        lastHtml.current = expectedHtml;
    }, [value, animatedEmojiMap]);

    const handleInput = () => {
        if (!inputRef.current) return;
        const newText = htmlToText(inputRef.current);
        if (newText !== value) {
            onChange(newText);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div
            ref={inputRef}
            contentEditable={!loading}
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            className={`w-full max-h-32 overflow-y-auto bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all ${!value ? 'empty:before:content-["Type_a_message..."] empty:before:text-zinc-500' : ''}`}
            style={{ minHeight: "2.75rem" }}
        />
    );
};
