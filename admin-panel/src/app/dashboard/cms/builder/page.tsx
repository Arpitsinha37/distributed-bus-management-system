'use client';

import { useState, useCallback } from 'react';
import { Type, Image, RectangleHorizontal, Columns, Quote, List, Code, Video, Minus, ArrowUp, ArrowDown, Trash2, GripVertical, Plus, Settings, Eye, Save, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

// ── Block Types ──
export type BlockType = 'hero' | 'text' | 'image' | 'cta' | 'columns' | 'quote' | 'list' | 'code' | 'video' | 'divider';

export interface Block {
    id: string;
    type: BlockType;
    data: Record<string, any>;
}

const blockDefs: { type: BlockType; label: string; icon: any; defaults: Record<string, any> }[] = [
    { type: 'hero', label: 'Hero Section', icon: RectangleHorizontal, defaults: { heading: 'Welcome to Our Website', subheading: 'Discover amazing travel experiences', buttonText: 'Get Started', buttonUrl: '#', bgColor: '#DC2626' } },
    { type: 'text', label: 'Text Block', icon: Type, defaults: { content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', align: 'left' } },
    { type: 'image', label: 'Image', icon: Image, defaults: { url: '', alt: '', caption: '', width: 'full' } },
    { type: 'cta', label: 'Call to Action', icon: RectangleHorizontal, defaults: { heading: 'Ready to Book?', description: 'Start your journey today', buttonText: 'Book Now', buttonUrl: '/booking', style: 'centered' } },
    { type: 'columns', label: '2 Columns', icon: Columns, defaults: { left: 'Left column content goes here.', right: 'Right column content goes here.' } },
    { type: 'quote', label: 'Quote', icon: Quote, defaults: { text: 'Travel is the only thing you buy that makes you richer.', author: 'Anonymous' } },
    { type: 'list', label: 'List', icon: List, defaults: { items: ['First item', 'Second item', 'Third item'], ordered: false } },
    { type: 'code', label: 'Code Block', icon: Code, defaults: { code: '<div>Hello World</div>', language: 'html' } },
    { type: 'video', label: 'Video Embed', icon: Video, defaults: { url: '', caption: '' } },
    { type: 'divider', label: 'Divider', icon: Minus, defaults: { style: 'solid' } },
];

function uid() { return Math.random().toString(36).slice(2, 10); }

// ── Block Renderer (preview) ──
function BlockPreview({ block }: { block: Block }) {
    switch (block.type) {
        case 'hero':
            return (
                <div className="py-16 px-8 text-center text-white rounded-lg" style={{ backgroundColor: block.data.bgColor || '#DC2626' }}>
                    <h1 className="text-3xl font-bold">{block.data.heading}</h1>
                    <p className="mt-2 text-lg opacity-80">{block.data.subheading}</p>
                    {block.data.buttonText && (
                        <button className="mt-4 px-6 py-2 bg-white/20 backdrop-blur rounded-lg text-sm font-medium">{block.data.buttonText}</button>
                    )}
                </div>
            );
        case 'text':
            return <p className="text-gray-700 dark:text-gray-300 leading-relaxed" style={{ textAlign: block.data.align }}>{block.data.content}</p>;
        case 'image':
            return (
                <div className={`${block.data.width === 'full' ? 'w-full' : 'w-2/3 mx-auto'}`}>
                    {block.data.url ? (
                        <img src={block.data.url} alt={block.data.alt} className="w-full rounded-lg" />
                    ) : (
                        <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400"><Image className="w-10 h-10" /></div>
                    )}
                    {block.data.caption && <p className="text-center text-sm text-gray-400 mt-2">{block.data.caption}</p>}
                </div>
            );
        case 'cta':
            return (
                <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white p-8 rounded-lg text-center">
                    <h2 className="text-2xl font-bold">{block.data.heading}</h2>
                    <p className="mt-2 opacity-80">{block.data.description}</p>
                    <button className="mt-4 px-6 py-2 bg-white text-red-600 font-medium rounded-lg text-sm">{block.data.buttonText}</button>
                </div>
            );
        case 'columns':
            return (
                <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">{block.data.left}</div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">{block.data.right}</div>
                </div>
            );
        case 'quote':
            return (
                <blockquote className="border-l-4 border-red-500 pl-6 py-2 italic text-gray-600 dark:text-gray-400">
                    <p className="text-lg">&ldquo;{block.data.text}&rdquo;</p>
                    {block.data.author && <footer className="mt-2 text-sm font-medium text-gray-500">— {block.data.author}</footer>}
                </blockquote>
            );
        case 'list':
            const Tag = block.data.ordered ? 'ol' : 'ul';
            return (
                <Tag className={`${block.data.ordered ? 'list-decimal' : 'list-disc'} ml-6 space-y-1 text-gray-700 dark:text-gray-300`}>
                    {(block.data.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}
                </Tag>
            );
        case 'code':
            return <pre className="p-4 bg-gray-900 text-green-400 rounded-lg text-sm overflow-x-auto font-mono"><code>{block.data.code}</code></pre>;
        case 'video':
            return block.data.url ? (
                <div className="aspect-video rounded-lg overflow-hidden bg-black"><iframe src={block.data.url} className="w-full h-full" allowFullScreen /></div>
            ) : (
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400"><Video className="w-10 h-10" /></div>
            );
        case 'divider':
            return <hr className={`border-gray-200 dark:border-gray-700 ${block.data.style === 'dashed' ? 'border-dashed' : block.data.style === 'dotted' ? 'border-dotted' : ''}`} />;
        default:
            return <div className="text-gray-400 text-sm">Unknown block type</div>;
    }
}

// ── Block Settings Panel ──
function BlockSettings({ block, onChange }: { block: Block; onChange: (data: Record<string, any>) => void }) {
    const d = block.data;
    const set = (key: string, val: any) => onChange({ ...d, [key]: val });

    const field = (label: string, key: string, type: string = 'text', opts?: { placeholder?: string; rows?: number }) => (
        <div key={key}>
            <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
            {type === 'textarea' ? (
                <textarea value={d[key] || ''} onChange={e => set(key, e.target.value)} rows={opts?.rows || 3}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none resize-none" placeholder={opts?.placeholder} />
            ) : type === 'color' ? (
                <div className="flex gap-2 items-center">
                    <input type="color" value={d[key] || '#DC2626'} onChange={e => set(key, e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                    <input type="text" value={d[key] || ''} onChange={e => set(key, e.target.value)} className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono outline-none" />
                </div>
            ) : type === 'select' ? null : (
                <input type={type} value={d[key] || ''} onChange={e => set(key, e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" placeholder={opts?.placeholder} />
            )}
        </div>
    );

    switch (block.type) {
        case 'hero':
            return <div className="space-y-3">{field('Heading', 'heading')}{field('Subheading', 'subheading')}{field('Button Text', 'buttonText')}{field('Button URL', 'buttonUrl')}{field('Background Color', 'bgColor', 'color')}</div>;
        case 'text':
            return (
                <div className="space-y-3">
                    {field('Content', 'content', 'textarea', { rows: 5 })}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Alignment</label>
                        <div className="flex gap-2">
                            {['left', 'center', 'right'].map(a => (
                                <button key={a} onClick={() => set('align', a)}
                                    className={`px-3 py-1.5 rounded text-xs font-medium ${d.align === a ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                    {a}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            );
        case 'image':
            return <div className="space-y-3">{field('Image URL', 'url', 'text', { placeholder: 'https://...' })}{field('Alt Text', 'alt')}{field('Caption', 'caption')}</div>;
        case 'cta':
            return <div className="space-y-3">{field('Heading', 'heading')}{field('Description', 'description')}{field('Button Text', 'buttonText')}{field('Button URL', 'buttonUrl')}</div>;
        case 'columns':
            return <div className="space-y-3">{field('Left Column', 'left', 'textarea', { rows: 3 })}{field('Right Column', 'right', 'textarea', { rows: 3 })}</div>;
        case 'quote':
            return <div className="space-y-3">{field('Quote Text', 'text', 'textarea', { rows: 3 })}{field('Author', 'author')}</div>;
        case 'list':
            return (
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Items (one per line)</label>
                        <textarea value={(d.items || []).join('\n')} onChange={e => set('items', e.target.value.split('\n').filter(Boolean))} rows={5}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none resize-none font-mono" />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => set('ordered', false)} className={`px-3 py-1.5 rounded text-xs ${!d.ordered ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>Bullet</button>
                        <button onClick={() => set('ordered', true)} className={`px-3 py-1.5 rounded text-xs ${d.ordered ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>Numbered</button>
                    </div>
                </div>
            );
        case 'code':
            return <div className="space-y-3">{field('Code', 'code', 'textarea', { rows: 6 })}{field('Language', 'language')}</div>;
        case 'video':
            return <div className="space-y-3">{field('Video URL (embed)', 'url', 'text', { placeholder: 'https://youtube.com/embed/...' })}{field('Caption', 'caption')}</div>;
        case 'divider':
            return (
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Style</label>
                    <div className="flex gap-2">
                        {['solid', 'dashed', 'dotted'].map(s => (
                            <button key={s} onClick={() => set('style', s)}
                                className={`px-3 py-1.5 rounded text-xs ${d.style === s ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            );
        default:
            return <p className="text-gray-400 text-sm">No settings for this block</p>;
    }
}

// ── Main Page Builder ──
export default function PageBuilder() {
    const router = useRouter();
    const [blocks, setBlocks] = useState<Block[]>([
        { id: uid(), type: 'hero', data: blockDefs[0].defaults },
        { id: uid(), type: 'text', data: blockDefs[1].defaults },
    ]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [showBlockPicker, setShowBlockPicker] = useState(false);
    const [insertIndex, setInsertIndex] = useState<number>(-1);

    const selectedBlock = blocks.find(b => b.id === selectedId) || null;

    const addBlock = (type: BlockType, index: number) => {
        const def = blockDefs.find(d => d.type === type)!;
        const newBlock: Block = { id: uid(), type, data: { ...def.defaults } };
        const updated = [...blocks];
        updated.splice(index, 0, newBlock);
        setBlocks(updated);
        setSelectedId(newBlock.id);
        setShowBlockPicker(false);
    };

    const removeBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    const moveBlock = (id: string, dir: -1 | 1) => {
        const idx = blocks.findIndex(b => b.id === id);
        if ((dir === -1 && idx === 0) || (dir === 1 && idx === blocks.length - 1)) return;
        const updated = [...blocks];
        [updated[idx], updated[idx + dir]] = [updated[idx + dir], updated[idx]];
        setBlocks(updated);
    };

    const updateBlockData = (data: Record<string, any>) => {
        setBlocks(blocks.map(b => b.id === selectedId ? { ...b, data } : b));
    };

    const handleSave = () => {
        alert('Page blocks saved! In production, this would call apiPut("/pages/:id", { blocks })');
    };

    return (
        <div className="flex h-[calc(100vh-48px)] -m-6 lg:-m-8">
            {/* Left Panel: Block List */}
            <div className="w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
                    <button onClick={() => router.push('/dashboard/cms')}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded"><ChevronLeft className="w-4 h-4" /></button>
                    <h2 className="font-bold text-gray-900 dark:text-white text-sm flex-1">Page Builder</h2>
                    <span className="text-[10px] text-gray-400">{blocks.length} blocks</span>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    {blocks.map((block, idx) => {
                        const def = blockDefs.find(d => d.type === block.type);
                        const Icon = def?.icon || Type;
                        return (
                            <div key={block.id}
                                onClick={() => setSelectedId(block.id)}
                                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-sm group ${selectedId === block.id ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                    }`}>
                                <GripVertical className="w-3.5 h-3.5 text-gray-300 cursor-grab shrink-0" />
                                <Icon className="w-4 h-4 shrink-0" />
                                <span className="truncate flex-1">{def?.label}</span>
                                <div className="hidden group-hover:flex items-center gap-0.5">
                                    <button onClick={e => { e.stopPropagation(); moveBlock(block.id, -1); }} className="p-0.5 hover:text-blue-500"><ArrowUp className="w-3 h-3" /></button>
                                    <button onClick={e => { e.stopPropagation(); moveBlock(block.id, 1); }} className="p-0.5 hover:text-blue-500"><ArrowDown className="w-3 h-3" /></button>
                                    <button onClick={e => { e.stopPropagation(); removeBlock(block.id); }} className="p-0.5 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                                </div>
                            </div>
                        );
                    })}

                    <button onClick={() => { setInsertIndex(blocks.length); setShowBlockPicker(true); }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-gray-400 hover:border-red-500/50 hover:text-red-500 transition-colors text-sm mt-2">
                        <Plus className="w-4 h-4" /> Add Block
                    </button>
                </div>
            </div>

            {/* Center: Live Preview */}
            <div className="flex-1 bg-gray-50 dark:bg-gray-950 overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowPreview(!showPreview)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${showPreview ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                            <Eye className="w-3.5 h-3.5" /> {showPreview ? 'Edit Mode' : 'Preview'}
                        </button>
                    </div>
                    <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium">
                        <Save className="w-3.5 h-3.5" /> Save
                    </button>
                </div>

                <div className={`max-w-4xl mx-auto py-6 px-6 space-y-4 ${showPreview ? '' : ''}`}>
                    {blocks.map((block, idx) => (
                        <div key={block.id}>
                            {/* Insert Point */}
                            {!showPreview && (
                                <div className="flex justify-center my-1">
                                    <button onClick={() => { setInsertIndex(idx); setShowBlockPicker(true); }}
                                        className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-300 hover:border-red-500 hover:text-red-500 transition-colors opacity-0 hover:opacity-100">
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                            <div
                                onClick={() => !showPreview && setSelectedId(block.id)}
                                className={`rounded-lg transition-all ${showPreview ? '' : `cursor-pointer border-2 p-4 ${selectedId === block.id ? 'border-red-500 shadow-lg shadow-red-500/10' : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                                        }`
                                    }`}
                            >
                                <BlockPreview block={block} />
                            </div>
                        </div>
                    ))}

                    {blocks.length === 0 && (
                        <div className="text-center py-24 text-gray-300">
                            <RectangleHorizontal className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium">Start building your page</p>
                            <p className="text-sm mt-1">Click &ldquo;Add Block&rdquo; to get started</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel: Settings */}
            <div className="w-72 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-gray-400" />
                    <h2 className="font-bold text-gray-900 dark:text-white text-sm">Block Settings</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    {selectedBlock ? (
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                {(() => { const def = blockDefs.find(d => d.type === selectedBlock.type); const Icon = def?.icon || Type; return <><Icon className="w-4 h-4 text-red-500" /><span className="text-sm font-medium text-gray-900 dark:text-white">{def?.label}</span></>; })()}
                            </div>
                            <BlockSettings block={selectedBlock} onChange={updateBlockData} />
                            <button onClick={() => removeBlock(selectedBlock.id)}
                                className="w-full mt-6 py-2 border border-red-200 dark:border-red-800 text-red-600 rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2">
                                <Trash2 className="w-3.5 h-3.5" /> Remove Block
                            </button>
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm text-center py-8">Select a block to edit its settings</p>
                    )}
                </div>
            </div>

            {/* Block Picker Modal */}
            {showBlockPicker && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowBlockPicker(false)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-800" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add Block</h2>
                        <div className="grid grid-cols-2 gap-2">
                            {blockDefs.map(def => (
                                <button key={def.type} onClick={() => addBlock(def.type, insertIndex)}
                                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-red-500/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
                                    <def.icon className="w-5 h-5 text-gray-400 shrink-0" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{def.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
