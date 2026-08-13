'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { apiGet } from '@/lib/api';
import { Search, X, Image as ImageIcon, Film, File, Upload, Loader2, Check, FolderOpen, Images, HardDrive } from 'lucide-react';

interface MediaItem {
    id: string;
    filename: string;
    url: string;
    mimeType: string;
    size: number;
    folder: string;
    createdAt: string;
    /** source indicates where this item came from */
    _source?: 'media' | 'gallery';
    /** gallery-specific fields */
    _category?: string;
}

interface GalleryItem {
    id: string;
    title: string;
    image: string;
    altText: string;
    category: string;
    status: string;
    displayOrder: number;
    createdAt: string;
}

interface MediaPickerModalProps {
    onSelect: (url: string, filename: string) => void;
    onClose: () => void;
    accept?: 'image' | 'video' | 'all';
    /** If true, allows selecting multiple items (returns them via onSelectMultiple) */
    multiple?: boolean;
    onSelectMultiple?: (items: { url: string; filename: string }[]) => void;
}

export default function MediaPickerModal({ onSelect, onClose, accept = 'all', multiple = false, onSelectMultiple }: MediaPickerModalProps) {
    const { accessToken } = useStore();
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [galleryItems, setGalleryItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [source, setSource] = useState<'all' | 'media' | 'gallery'>('all');
    const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'document'>('all');
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

    const fetchMedia = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch both media uploads and gallery items in parallel
            const [mediaRes, galleryRes] = await Promise.all([
                apiGet<any[]>('/media', accessToken!).catch(() => []),
                apiGet<GalleryItem[]>('/gallery', accessToken!).catch(() => []),
            ]);

            const mediaItems: MediaItem[] = (Array.isArray(mediaRes) ? mediaRes : []).map(m => ({
                ...m,
                _source: 'media' as const,
            }));

            // Convert gallery items to MediaItem format
            const galleryMediaItems: MediaItem[] = (Array.isArray(galleryRes) ? galleryRes : [])
                .filter(g => g.image) // Only include items that have an image
                .map(g => ({
                    id: `gallery-${g.id}`,
                    filename: g.title || g.altText || 'Gallery Image',
                    url: g.image,
                    mimeType: 'image/webp', // Gallery images are uploaded through ImageUpload which converts to webp
                    size: 0,
                    folder: g.category || 'Gallery',
                    createdAt: g.createdAt,
                    _source: 'gallery' as const,
                    _category: g.category,
                }));

            setMedia(mediaItems);
            setGalleryItems(galleryMediaItems);
        } catch { }
        setLoading(false);
    }, [accessToken]);

    useEffect(() => { fetchMedia(); }, [fetchMedia]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setUploading(true);

        for (const file of Array.from(files)) {
            const formData = new FormData();
            formData.append('file', file);
            try {
                await fetch(`${API_URL}/media/upload`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${accessToken}` },
                    body: formData,
                });
            } catch { }
        }

        setUploading(false);
        fetchMedia();
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const isImage = (mime: string) => mime?.startsWith('image/');
    const isVideo = (mime: string) => mime?.startsWith('video/');

    const getMediaUrl = (item: MediaItem) => {
        if (item.url.startsWith('data:') || item.url.startsWith('http')) return item.url;
        return `${API_URL.replace('/api', '')}${item.url}`;
    };

    const formatSize = (bytes: number) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    };

    // Combine all items based on source
    const allItems = source === 'media' ? media
        : source === 'gallery' ? galleryItems
        : [...media, ...galleryItems];

    // Apply type filters
    let filtered = allItems;
    if (accept === 'image') filtered = filtered.filter(m => isImage(m.mimeType));
    else if (accept === 'video') filtered = filtered.filter(m => isVideo(m.mimeType));

    if (filter === 'image') filtered = filtered.filter(m => isImage(m.mimeType));
    else if (filter === 'video') filtered = filtered.filter(m => isVideo(m.mimeType));
    else if (filter === 'document') filtered = filtered.filter(m => !isImage(m.mimeType) && !isVideo(m.mimeType));

    if (search) filtered = filtered.filter(m => m.filename.toLowerCase().includes(search.toLowerCase()));

    // Sort: newest first
    filtered = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const handleItemClick = (item: MediaItem) => {
        if (multiple) {
            const newSet = new Set(selectedItems);
            if (newSet.has(item.id)) newSet.delete(item.id);
            else newSet.add(item.id);
            setSelectedItems(newSet);
        } else {
            onSelect(getMediaUrl(item), item.filename);
        }
    };

    const handleInsertSelected = () => {
        const combinedItems = [...media, ...galleryItems];
        if (onSelectMultiple) {
            const items = combinedItems
                .filter(m => selectedItems.has(m.id))
                .map(m => ({ url: getMediaUrl(m), filename: m.filename }));
            onSelectMultiple(items);
        } else if (selectedItems.size === 1) {
            const item = combinedItems.find(m => selectedItems.has(m.id));
            if (item) onSelect(getMediaUrl(item), item.filename);
        }
    };

    const sourceTabs = [
        { id: 'all' as const, label: 'All Sources', icon: FolderOpen, count: media.length + galleryItems.length },
        { id: 'media' as const, label: 'Media Uploads', icon: HardDrive, count: media.length },
        { id: 'gallery' as const, label: 'Gallery', icon: Images, count: galleryItems.length },
    ];

    const filterTabs = [
        { id: 'all' as const, label: 'All Types' },
        { id: 'image' as const, label: 'Images' },
        { id: 'video' as const, label: 'Videos' },
        { id: 'document' as const, label: 'Documents' },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5 bg-white dark:bg-slate-900 shrink-0">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-red-500" /> Media Library
                    </h3>
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm cursor-pointer transition-colors">
                            <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload New'}
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                onChange={handleUpload}
                                className="hidden"
                                accept={accept === 'image' ? 'image/*' : accept === 'video' ? 'video/*' : 'image/*,video/*,application/pdf'}
                            />
                        </label>
                        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500 transition-colors cursor-pointer">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Source Tabs + Search + Type Filter */}
                <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-slate-800/50 shrink-0 space-y-3">
                    {/* Source tabs */}
                    <div className="flex gap-2 overflow-x-auto">
                        {sourceTabs.map(t => (
                            <button
                                key={t.id}
                                onClick={() => { setSource(t.id); setSelectedItems(new Set()); }}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${source === t.id
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                                    : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/10'
                                    }`}
                            >
                                <t.icon className="w-4 h-4" />
                                {t.label}
                                <span className={`text-xs ml-1 px-1.5 py-0.5 rounded-full ${source === t.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-white/10'}`}>
                                    {t.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={source === 'gallery' ? 'Search gallery images...' : 'Search media files...'}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:text-white"
                            autoFocus
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Type filter (only when not gallery-only) */}
                    {source !== 'gallery' && (
                        <div className="flex gap-2 overflow-x-auto">
                            {filterTabs.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setFilter(t.id)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === t.id
                                        ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                                        : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/10'
                                        }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                            <span className="text-xs text-gray-400 self-center ml-auto">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
                        </div>
                    )}
                    {source === 'gallery' && (
                        <div className="flex items-center">
                            <span className="text-xs text-gray-400">{filtered.length} gallery image{filtered.length !== 1 ? 's' : ''} available</span>
                        </div>
                    )}
                </div>

                {/* Media Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-3" />
                            <p className="text-sm">Loading media library...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <FolderOpen className="w-12 h-12 mb-3 opacity-30" />
                            <p className="text-sm font-medium">
                                {source === 'gallery' ? 'No gallery images found' : 'No media files found'}
                            </p>
                            <p className="text-xs mt-1">
                                {source === 'gallery'
                                    ? 'Add images in the Gallery section to see them here'
                                    : 'Try uploading a file or adjusting your search'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                            {filtered.map(m => {
                                const isSelected = selectedItems.has(m.id);
                                const isGalleryItem = m._source === 'gallery';
                                return (
                                    <button
                                        key={m.id}
                                        onClick={() => handleItemClick(m)}
                                        className={`group relative rounded-xl overflow-hidden border-2 transition-all text-left ${isSelected
                                            ? 'border-red-500 ring-2 ring-red-500/30 shadow-lg'
                                            : 'border-gray-200 dark:border-white/10 hover:border-red-300 dark:hover:border-red-500/50 hover:shadow-md'
                                            }`}
                                    >
                                        <div className="aspect-square bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                                            {isImage(m.mimeType) ? (
                                                <img src={getMediaUrl(m)} alt={m.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                                            ) : isVideo(m.mimeType) ? (
                                                <Film className="w-8 h-8 text-gray-300" />
                                            ) : (
                                                <File className="w-8 h-8 text-gray-300" />
                                            )}
                                        </div>
                                        <div className="p-2 bg-white dark:bg-slate-900">
                                            <p className="text-[11px] font-medium text-gray-800 dark:text-white truncate">{m.filename}</p>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                {isGalleryItem ? (
                                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-medium">Gallery</span>
                                                ) : (
                                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">Media</span>
                                                )}
                                                {m.size > 0 && <span className="text-[10px] text-gray-400">{formatSize(m.size)}</span>}
                                                {m._category && <span className="text-[10px] text-gray-400 truncate">• {m._category}</span>}
                                            </div>
                                        </div>
                                        {/* Selection overlay */}
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                                                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                            </div>
                                        )}
                                        {/* Hover overlay for single select */}
                                        {!multiple && !isSelected && (
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                                                    Select
                                                </span>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer with insert button (for multiple selection) */}
                {multiple && selectedItems.size > 0 && (
                    <div className="px-6 py-4 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-slate-900 shrink-0 flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                            {selectedItems.size} file{selectedItems.size !== 1 ? 's' : ''} selected
                        </span>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setSelectedItems(new Set())}
                                className="px-4 py-2 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            >
                                Clear
                            </button>
                            <button
                                onClick={handleInsertSelected}
                                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors shadow-lg shadow-red-600/20"
                            >
                                Insert Selected
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
