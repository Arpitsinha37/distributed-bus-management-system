'use client';

import { useState, useEffect } from 'react';
import { Plug, Plus, Save, X, Trash2 } from 'lucide-react';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { useStore } from '@/lib/store';

type SeatType = 'seat' | 'sleeper' | 'empty' | 'door' | 'driver';

interface SeatConfig {
    row: number;
    col: number;
    label: string;
    type: SeatType;
}

interface LayoutJson {
    rows: number;
    cols: number;
    seats: SeatConfig[];
}

interface LayoutItem {
    id: string;
    name: string;
    totalSeats: number;
    layoutJson: LayoutJson;
    createdAt: string;
}

export default function LayoutsPage() {
    const { accessToken } = useStore();
    const [layouts, setLayouts] = useState<LayoutItem[]>([]);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    
    // Builder State
    const [layoutName, setLayoutName] = useState('');
    const [gridRows, setGridRows] = useState(12);
    const [gridCols, setGridCols] = useState(5); // 2 seats, aisle, 2 seats
    const [seats, setSeats] = useState<SeatConfig[]>([]);
    const [currentTool, setCurrentTool] = useState<SeatType>('seat');

    useEffect(() => {
        if (accessToken) fetchLayouts();
    }, [accessToken]);

    const fetchLayouts = async () => {
        const res = await apiGet('/fleet/seat-layouts', accessToken!);
        if (!res.error) setLayouts(res.data);
    };

    const initGrid = () => {
        const initialSeats: SeatConfig[] = [];
        let seatCounter = 1;
        
        for (let r = 0; r < gridRows; r++) {
            for (let c = 0; c < gridCols; c++) {
                // Default setup: Driver at top right, Door at top left, aisle in middle
                if (r === 0 && c === gridCols - 1) {
                    initialSeats.push({ row: r, col: c, label: '', type: 'driver' });
                } else if (r === 0 && c === 0) {
                    initialSeats.push({ row: r, col: c, label: '', type: 'door' });
                } else if (r === 0 || c === Math.floor(gridCols / 2)) {
                    initialSeats.push({ row: r, col: c, label: '', type: 'empty' });
                } else {
                    initialSeats.push({ row: r, col: c, label: `${seatCounter++}`, type: 'seat' });
                }
            }
        }
        setSeats(initialSeats);
    };

    const openBuilder = () => {
        setLayoutName('');
        setGridRows(12);
        setGridCols(5);
        initGrid();
        setIsBuilderOpen(true);
    };

    const handleCellClick = (r: number, c: number) => {
        const existingIdx = seats.findIndex(s => s.row === r && s.col === c);
        const newSeats = [...seats];
        
        if (existingIdx >= 0) {
            newSeats[existingIdx].type = currentTool;
            // Clear label if not a seat
            if (currentTool !== 'seat' && currentTool !== 'sleeper') {
                newSeats[existingIdx].label = '';
            }
        } else {
            newSeats.push({ row: r, col: c, label: '', type: currentTool });
        }
        
        // Recalculate labels automatically for all seats/sleepers
        let counter = 1;
        for (let currR = 0; currR < gridRows; currR++) {
            for (let currC = 0; currC < gridCols; currC++) {
                const sIdx = newSeats.findIndex(s => s.row === currR && s.col === currC);
                if (sIdx >= 0 && (newSeats[sIdx].type === 'seat' || newSeats[sIdx].type === 'sleeper')) {
                    newSeats[sIdx].label = `${counter++}`;
                }
            }
        }
        setSeats(newSeats);
    };

    const saveLayout = async () => {
        if (!layoutName) return alert("Please enter a layout name.");
        
        const totalSeats = seats.filter(s => s.type === 'seat' || s.type === 'sleeper').length;
        if (totalSeats === 0) return alert("You must add at least one seat.");

        const payload = {
            name: layoutName,
            totalSeats,
            layoutJson: {
                rows: gridRows,
                cols: gridCols,
                seats
            }
        };

        const res = await apiPost('/fleet/seat-layouts', payload, accessToken!);
        if (res.error) alert(res.error);
        else {
            setIsBuilderOpen(false);
            fetchLayouts();
        }
    };

    const deleteLayout = async (id: string) => {
        if (!confirm('Delete this layout template?')) return;
        await apiDelete(`/fleet/seat-layouts/${id}`, accessToken!);
        fetchLayouts();
    };

    return (
        <div className="pb-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Plug className="w-6 h-6 text-brand-500" /> Bus Layouts
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Configure and manage bus seat arrangements.</p>
                </div>
                {!isBuilderOpen && (
                    <button onClick={openBuilder} className="px-4 py-2 bg-brand-500 text-white rounded-xl shadow-md shadow-brand-500/30 text-sm font-medium hover:bg-brand-600 transition-colors">
                        + Create Layout
                    </button>
                )}
            </div>
            
            {isBuilderOpen ? (
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-4">
                            <input 
                                type="text" 
                                placeholder="Layout Name (e.g. 40-Seat 2x2 AC)"
                                value={layoutName}
                                onChange={e => setLayoutName(e.target.value)}
                                className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm min-w-[300px]" 
                            />
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                Rows: <input type="number" min={1} max={30} value={gridRows} onChange={e => {setGridRows(Number(e.target.value)); initGrid();}} className="w-16 px-2 py-1 bg-gray-50 border rounded" />
                                Cols: <input type="number" min={1} max={10} value={gridCols} onChange={e => {setGridCols(Number(e.target.value)); initGrid();}} className="w-16 px-2 py-1 bg-gray-50 border rounded" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setIsBuilderOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-sm font-medium">Cancel</button>
                            <button onClick={saveLayout} className="px-4 py-2 bg-brand-500 text-white rounded-xl shadow-md flex items-center gap-2 text-sm font-medium hover:bg-brand-600">
                                <Save className="w-4 h-4" /> Save Layout
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Toolbar */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Tools</h3>
                            {(['seat', 'sleeper', 'empty', 'door', 'driver'] as SeatType[]).map(tool => (
                                <button
                                    key={tool}
                                    onClick={() => setCurrentTool(tool)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-sm font-medium transition-all ${currentTool === tool ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300'}`}
                                >
                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${
                                        tool === 'seat' ? 'bg-blue-100 border-blue-200 text-blue-600' :
                                        tool === 'sleeper' ? 'bg-indigo-100 border-indigo-200 text-indigo-600 h-10' :
                                        tool === 'door' ? 'bg-green-100 border-green-200 text-green-600' :
                                        tool === 'driver' ? 'bg-orange-100 border-orange-200 text-orange-600 rounded-full' :
                                        'border-dashed border-gray-300'
                                    }`}>
                                        {tool === 'empty' ? '✕' : ''}
                                    </div>
                                    <span className="capitalize">{tool}</span>
                                </button>
                            ))}
                        </div>

                        {/* Visual Canvas */}
                        <div className="lg:col-span-3 flex justify-center p-8 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 w-fit">
                                <div 
                                    className="grid gap-2" 
                                    style={{ 
                                        gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                                        gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))`
                                    }}
                                >
                                    {Array.from({ length: gridRows }).map((_, r) => (
                                        Array.from({ length: gridCols }).map((_, c) => {
                                            const seat = seats.find(s => s.row === r && s.col === c) || { type: 'empty', label: '' };
                                            return (
                                                <div 
                                                    key={`${r}-${c}`}
                                                    onClick={() => handleCellClick(r, c)}
                                                    className={`w-12 h-12 md:w-14 md:h-14 rounded-lg flex flex-col items-center justify-center cursor-pointer border-2 transition-all hover:scale-105 ${
                                                        seat.type === 'seat' ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400' :
                                                        seat.type === 'sleeper' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 h-[2.5rem] dark:bg-indigo-900/30 dark:border-indigo-800' :
                                                        seat.type === 'door' ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 text-xs font-bold' :
                                                        seat.type === 'driver' ? 'bg-orange-50 border-orange-200 text-orange-700 rounded-full dark:bg-orange-900/30 dark:border-orange-800' :
                                                        'border-dashed border-gray-200 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                                                    }`}
                                                >
                                                    {seat.type === 'door' && 'EXIT'}
                                                    {seat.type === 'driver' && 'D'}
                                                    {(seat.type === 'seat' || seat.type === 'sleeper') && <span className="font-bold text-sm">{seat.label}</span>}
                                                </div>
                                            );
                                        })
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {layouts.length === 0 ? (
                        <div className="col-span-full p-12 text-center text-gray-500 glass-card">
                            No layouts created yet. Click "Create Layout" to build one.
                        </div>
                    ) : (
                        layouts.map(layout => (
                            <div key={layout.id} className="glass-card p-6 flex flex-col hover:shadow-lg transition-all group">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">{layout.name}</h3>
                                        <div className="text-sm text-gray-500 mt-1">{layout.totalSeats} Total Seats</div>
                                    </div>
                                    <button onClick={() => deleteLayout(layout.id)} className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                <div className="mt-auto pt-4 flex gap-3 text-xs font-medium text-gray-500 border-t border-gray-100 dark:border-gray-800">
                                    <span>Rows: {layout.layoutJson.rows}</span>
                                    <span>•</span>
                                    <span>Cols: {layout.layoutJson.cols}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
