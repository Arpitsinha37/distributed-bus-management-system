'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { apiGet, apiDelete } from '@/lib/api';
import {
    Upload, Trash2, Search, Image as ImageIcon, File, Film, X,
    FolderOpen, Grid, List, Copy, Check, Download, Eye, Calendar,
    HardDrive, Loader2
} from 'lucide-react';

interface MediaItem {
    id: string;
    filename: string;
    url: string;
    mimeType: string;
    size: number;
    folder: string;
    createdAt: string;
}

export default function MediaPage() {
    const { accessToken } = useStore();
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selected, setSelected] = useState<MediaItem | null>(null);
    const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'document'>('all');
    const [copied, setCopied] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [totalToUpload, setTotalToUpload] = useState<number>(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

    const fetchMedia = useCallback(async () => {
        try {
            const res = await apiGet<MediaItem[]>('/media', accessToken!);
            setMedia(Array.isArray(res) ? res : []);
        } catch { }
        setLoading(false);
    }, [accessToken]);

    useEffect(() => { fetchMedia(); }, [fetchMedia]);

    const uploadFiles = async (files: FileList | File[]) => {
        const fileArray = Array.from(files);
        if (fileArray.length === 0) return;
        setUploading(true);
        setTotalToUpload(fileArray.length);
        setUploadProgress(0);

        for (let i = 0; i < fileArray.length; i++) {
            const formData = new FormData();
            formData.append('file', fileArray[i]);
            try {
                await fetch(`${API_URL}/media/upload`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${accessToken}` },
                    body: formData,
                });
            } catch { }
            setUploadProgress(i + 1);
        }

        setUploading(false);
        setUploadProgress(0);
        setTotalToUpload(0);
        fetchMedia();
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) uploadFiles(files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this file permanently? This cannot be undone.')) return;
        await apiDelete(`/media/${id}`, accessToken!);
        setSelected(null);
        fetchMedia();
    };

    const copyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    };

    const isImage = (mime: string) => mime?.startsWith('image/');
    const isVideo = (mime: string) => mime?.startsWith('video/');
    const getIcon = (mime: string) => isImage(mime) ? ImageIcon : isVideo(mime) ? Film : File;

    const getMediaUrl = (item: MediaItem) => {
        if (item.url.startsWith('data:') || item.url.startsWith('http')) return item.url;
        return `${API_URL.replace('/api', '')}${item.url}`;
    };

    // Compute stats
    const totalSize = media.reduce((sum, m) => sum + m.size, 0);
    const imageCount = media.filter(m => isImage(m.mimeType)).length;
    const videoCount = media.filter(m => isVideo(m.mimeType)).length;
    const docCount = media.length - imageCount - videoCount;

    // Apply filters
    let filtered = media;
    if (filter === 'image') filtered = filtered.filter(m => isImage(m.mimeType));
    else if (filter === 'video') filtered = filtered.filter(m => isVideo(m.mimeType));
    else if (filter === 'document') filtered = filtered.filter(m => !isImage(m.mimeType) && !isVideo(m.mimeType));
    if (search) filtered = filtered.filter(m => m.filename.toLowerCase().includes(search.toLowerCase()));

    const filterTabs = [
        { id: 'all' as const, label: 'All', count: media.length },
        { id: 'image' as const, label: 'Images', count: imageCount },
        { id: 'video' as const, label: 'Videos', count: videoCount },
        { id: 'document' as const, label: 'Documents', count: docCount },
    ];

    return (
        <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="relative"
        >
            {/* Full-page drag overlay */}
            {dragActive && (
                <div className="fixed inset-0 z-40 bg-red-600/10 backdrop-blur-sm border-4 border-dashed border-red-500 rounded-3xl flex items-center justify-center pointer-events-none">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 shadow-2xl text-center">
                        <Upload className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
                        <p className="text-xl font-bold text-gray-900 dark:text-white">Drop files to upload</p>
                        <p className="text-sm text-gray-500 mt-2">Images, videos, and PDFs up to 10MB</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <ImageIcon className="w-6 h-6 text-pink-500" /> Media Library
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">{media.length} files • {formatSize(totalSize)} total</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <button onClick={() => setViewMode('grid')} className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}><Grid className="w-4 h-4" /></button>
                        <button onClick={() => setViewMode('list')} className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}><List className="w-4 h-4" /></button>
                    </div>
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm cursor-pointer transition-colors shadow-lg shadow-red-600/20">
                        <Upload className="w-4 h-4" /> {uploading ? `Uploading ${uploadProgress}/${totalToUpload}...` : 'Upload'}
                        <input ref={fileInputRef} type="file" multiple onChange={handleUpload} className="hidden" accept="image/*,video/*,application/pdf" />
                    </label>
                </div>
            </div>

            {/* Search + Filter Bar */}
            <div className="flex items-center gap-4 mb-5">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search files..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-red-500/30 outline-none"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <div className="flex gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-gray-50 dark:bg-gray-800/50">
                    {filterTabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setFilter(t.id)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === t.id
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            {t.label} <span className="text-gray-400 ml-1">{t.count}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Upload Progress */}
            {uploading && (
                <div className="mb-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
                        <span className="text-sm font-medium text-red-700 dark:text-red-400">
                            Uploading {uploadProgress} of {totalToUpload} files...
                        </span>
                    </div>
                    <div className="w-full bg-red-100 dark:bg-red-900/30 rounded-full h-2 overflow-hidden">
                        <div
                            className="h-full bg-red-500 rounded-full transition-all duration-300"
                            style={{ width: `${totalToUpload ? (uploadProgress / totalToUpload) * 100 : 0}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                    <Loader2 className="w-10 h-10 animate-spin mb-3" />
                    <p className="text-sm">Loading media library...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-24 text-gray-400">
                    <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">
                        {search ? 'No files match your search' : 'No files yet'}
                    </p>
                    <p className="text-sm mt-1">
                        {search ? 'Try a different search term' : 'Upload your first file to get started'}
                    </p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filtered.map(m => {
                        const Icon = getIcon(m.mimeType);
                        return (
                            <div key={m.id} onClick={() => setSelected(m)}
                                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg hover:border-red-500/30 transition-all group">
                                <div className="aspect-square bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden relative">
                                    {isImage(m.mimeType) ? (
                                        <img src={getMediaUrl(m)} alt={m.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                                    ) : (
                                        <Icon className="w-10 h-10 text-gray-300" />
                                    )}
                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                        <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                                <div className="p-3">
                                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{m.filename}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{formatSize(m.size)}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500">
                            <tr>
                                <th className="text-left px-5 py-3 font-medium">File</th>
                                <th className="text-left px-5 py-3 font-medium">Type</th>
                                <th className="text-left px-5 py-3 font-medium">Size</th>
                                <th className="text-left px-5 py-3 font-medium">Uploaded</th>
                                <th className="text-right px-5 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filtered.map(m => {
                                const Icon = getIcon(m.mimeType);
                                return (
                                    <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer" onClick={() => setSelected(m)}>
                                        <td className="px-5 py-3.5 flex items-center gap-3">
                                            {isImage(m.mimeType) ? (
                                                <img src={getMediaUrl(m)} alt={m.filename} className="w-10 h-10 object-cover rounded-lg shrink-0" loading="lazy" />
                                            ) : (
                                                <Icon className="w-5 h-5 text-gray-400 shrink-0" />
                                            )}
                                            <span className="font-medium text-gray-900 dark:text-white truncate">{m.filename}</span>
                                        </td>
                                        <td className="px-5 py-3.5 text-gray-400 text-xs">{m.mimeType}</td>
                                        <td className="px-5 py-3.5 text-gray-400">{formatSize(m.size)}</td>
                                        <td className="px-5 py-3.5 text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center gap-1 justify-end">
                                                <button
                                                    onClick={e => { e.stopPropagation(); copyUrl(getMediaUrl(m)); }}
                                                    className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                    title="Copy URL"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={e => { e.stopPropagation(); handleDelete(m.id); }}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Detail Modal */}
            {selected && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-800 overflow-hidden" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Eye className="w-5 h-5 text-red-500" /> File Preview
                            </h2>
                            <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Preview */}
                        {isImage(selected.mimeType) && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-4">
                                <img src={getMediaUrl(selected)} alt={selected.filename} className="w-full max-h-80 object-contain rounded-lg" />
                            </div>
                        )}
                        {isVideo(selected.mimeType) && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-4">
                                <video src={getMediaUrl(selected)} controls className="w-full max-h-80 rounded-lg" />
                            </div>
                        )}

                        {/* File info */}
                        <div className="px-6 py-4 space-y-3">
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2.5">
                                <div className="flex items-start gap-2">
                                    <File className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Filename</p>
                                        <p className="text-sm text-gray-900 dark:text-white font-medium break-all">{selected.filename}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <HardDrive className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Size & Type</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{formatSize(selected.size)} • {selected.mimeType}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Uploaded</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{new Date(selected.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* URL Copy Box */}
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 flex items-center gap-2">
                                <code className="text-xs text-blue-500 flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono">
                                    {selected.url.startsWith('data:') ? `data:${selected.mimeType};base64,...` : selected.url}
                                </code>
                                <button
                                    onClick={() => copyUrl(getMediaUrl(selected))}
                                    className={`p-2 rounded-lg text-sm font-medium transition-all ${copied
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                            <button
                                onClick={() => copyUrl(getMediaUrl(selected))}
                                className="flex-1 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                            >
                                {copied ? <><Check className="w-4 h-4 text-green-500" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy URL</>}
                            </button>
                            <button
                                onClick={() => handleDelete(selected.id)}
                                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-red-600/20"
                            >
                                <Trash2 className="w-4 h-4" /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
