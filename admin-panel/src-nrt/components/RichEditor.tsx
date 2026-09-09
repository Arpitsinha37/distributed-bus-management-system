'use client';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import './rich-editor.css';
import InternalLinkPicker from './InternalLinkPicker';
import MediaPickerModal from './MediaPickerModal';
import type { Editor } from 'ckeditor5';

// Dynamically loaded helper — resolved once the adapter module loads
let _insertMediaImageFn: ((editor: Editor, url: string, alt: string) => void) | null = null;

const CKEditorAdapterDynamic = dynamic(
    () => import('./editor/CKEditorAdapter').then((mod) => {
        // Cache the helper function when the module loads
        _insertMediaImageFn = mod.insertMediaImage;
        return mod.CKEditorAdapter;
    }),
    { 
        ssr: false, 
        loading: () => <div className="h-[300px] bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" /> 
    }
);

interface RichEditorProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    editorKey?: string;
}

export default function RichEditor({ value, onChange, label = 'Content', placeholder = 'Write content...', editorKey }: RichEditorProps) {
    const [showPicker, setShowPicker] = useState(false);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const editorRef = useRef<Editor | null>(null);

    const handleEditorReady = useCallback((editor: Editor) => {
        editorRef.current = editor;
    }, []);

    const handleMediaLibraryOpen = useCallback(() => {
        setShowMediaPicker(true);
    }, []);

    const handleInternalLinkSelect = useCallback((url: string, title: string) => {
        const editor = editorRef.current;
        if (editor) {
            // Insert link at cursor position using CKEditor's model
            editor.model.change((writer) => {
                const linkText = writer.createText(title, { linkHref: url });
                editor.model.insertContent(linkText);
            });
            editor.editing.view.focus();
        } else {
            // Fallback: append to HTML string
            const linkHtml = `<a href="${url}">${title}</a>`;
            let updatedValue = value || '';
            if (updatedValue.match(/<\/p>\s*$/)) {
                updatedValue = updatedValue.replace(/<\/p>\s*$/, ` ${linkHtml}</p>`);
            } else {
                updatedValue = updatedValue ? `${updatedValue}<p>${linkHtml}</p>` : `<p>${linkHtml}</p>`;
            }
            onChange(updatedValue);
        }
        setShowPicker(false);
    }, [value, onChange]);

    const handleMediaSelect = useCallback((url: string, filename: string) => {
        const editor = editorRef.current;

        if (editor && _insertMediaImageFn) {
            // Use the proper CKEditor model insertion at cursor position
            _insertMediaImageFn(editor, url, filename);
        } else {
            // Fallback: append to HTML string
            const imgHtml = `<figure class="image"><img src="${url}" alt="${filename}"></figure>`;
            let updatedValue = value || '';
            if (updatedValue.match(/<\/p>\s*$/)) {
                updatedValue = updatedValue.replace(/<\/p>\s*$/, `</p>${imgHtml}`);
            } else {
                updatedValue = updatedValue ? `${updatedValue}${imgHtml}` : imgHtml;
            }
            onChange(updatedValue);
        }
        setShowMediaPicker(false);
    }, [value, onChange]);

    return (
        <div className="rich-editor-root flex flex-col mt-4 mb-8">
            {label && <label className="re-label block mb-2 font-medium text-gray-700 dark:text-gray-300">{label}</label>}
            
            <CKEditorAdapterDynamic 
                key={editorKey}
                value={value} 
                onChange={onChange} 
                placeholder={placeholder}
                onReady={handleEditorReady}
                onMediaLibraryOpen={handleMediaLibraryOpen}
            />

            {/* Action Buttons + Shortcut Hint Below Editor */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
                <button
                    type="button"
                    onClick={() => setShowMediaPicker(true)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-500/30 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1.5"
                >
                    🖼️ Insert from Media Library…
                </button>
                <button
                    type="button"
                    onClick={() => setShowPicker(true)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors flex items-center gap-1.5"
                >
                    🔗 Insert Internal Link…
                </button>

                {/* Shortcut Hint Pill */}
                <span className="re-shortcut-hint ml-auto">
                    <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>M</kbd>
                    <span className="re-shortcut-hint-text">Media Library</span>
                </span>
            </div>

            {showPicker && (
                <InternalLinkPicker
                    onSelect={handleInternalLinkSelect}
                    onClose={() => setShowPicker(false)}
                />
            )}

            {showMediaPicker && (
                <MediaPickerModal
                    onSelect={handleMediaSelect}
                    onClose={() => setShowMediaPicker(false)}
                    accept="image"
                />
            )}
        </div>
    );
}
