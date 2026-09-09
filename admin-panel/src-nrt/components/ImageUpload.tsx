'use client';
import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import MediaPickerModal from './MediaPickerModal';

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
    apiUrl: string;
    token: string | null;
    className?: string;
    previewClass?: string;
}

export default function ImageUpload({ value, onChange, label = 'Image', apiUrl, token, className = '', previewClass = 'h-32' }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const upload = async (file: File) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch(`${apiUrl}/media/upload`, {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: formData,
            });
            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            // Build full URL from the relative path, or use directly if it's already an absolute URL or data URI
            const baseUrl = apiUrl.replace('/api', '');
            const finalUrl = (data.url.startsWith('http') || data.url.startsWith('data:')) 
                ? data.url 
                : `${baseUrl}${data.url}`;
            onChange(finalUrl);
        } catch (err) {
            console.error('Upload error:', err);
            alert('Upload failed. Please try again.');
        }
        setUploading(false);
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) upload(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) upload(file);
    };

    const handleMediaSelect = (url: string, _filename: string) => {
        onChange(url);
        setShowMediaPicker(false);
    };

    return (
        <div className={className}>
            <label className="block text-slate-300 text-sm mb-1">{label}</label>
            <div
                className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${dragOver ? 'border-red-500 bg-red-500/10' : 'border-white/10 hover:border-white/20'}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
            >
                {uploading ? (
                    <div className="flex flex-col items-center gap-2 py-4">
                        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                        <p className="text-slate-400 text-sm">Uploading...</p>
                    </div>
                ) : value ? (
                    <div className="relative inline-block">
                        <img src={value} alt="" className={`${previewClass} object-cover rounded-lg`} />
                        <button
                            onClick={(e) => { e.stopPropagation(); onChange(''); }}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors shadow-lg"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 py-4">
                        <Upload className="w-8 h-8 text-slate-500" />
                        <p className="text-slate-400 text-sm">Drop image here or</p>
                    </div>
                )}

                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                    className="hidden"
                />
                <div className="flex items-center gap-2 mt-2 justify-center">
                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg text-sm transition-colors"
                    >
                        Upload File
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowMediaPicker(true)}
                        className="px-4 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm transition-colors flex items-center gap-1.5 border border-red-500/20"
                    >
                        <ImageIcon className="w-3.5 h-3.5" /> Media Library
                    </button>
                </div>
            </div>

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
