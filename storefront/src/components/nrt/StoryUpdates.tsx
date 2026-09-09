import * as React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, User } from "lucide-react";
import { StoryViewer } from "@/components/nrt/ui/story-viewer";
import { cn } from "@/lib/utils";
import api from "../lib/api";

function AddStoryButton() {
    return (
        <button
            className={cn(
                "relative flex flex-col items-center gap-2 group cursor-pointer"
            )}
            aria-label="Add your story"
        >
            <div className="relative">
                <div className="w-[72px] h-[72px] rounded-full p-1">
                    <div
                        className={cn(
                            "w-full h-full rounded-full flex items-center justify-center",
                            "border-2 border-dashed border-slate-300",
                            "bg-slate-50 transition-all duration-200",
                            "group-hover:border-rose-500 group-hover:bg-rose-50"
                        )}
                    >
                        <User className="w-7 h-7 text-slate-400" />
                    </div>
                </div>
                <motion.div
                    className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-rose-600 flex items-center justify-center shadow-sm"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Plus className="w-4 h-4 text-white" strokeWidth={2.5} />
                </motion.div>
            </div>
            <span className="text-xs text-slate-800 font-medium truncate max-w-[80px]">
                Your story
            </span>
        </button>
    );
}

// Fallback hardcoded stories
const fallbackUsers = [
    {
        username: "Nepal Travel",
        avatar: "https://api.dicebear.com/6.x/adventurer-neutral/svg?seed=Yuki+Tanaka",
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        stories: [
            { id: "yuki-1", type: "image" as const, src: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=1200&fit=crop" },
            { id: "yuki-2", type: "video" as const, src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" },
        ],
    },
    {
        username: "Adventures",
        avatar: "https://api.dicebear.com/6.x/adventurer-neutral/svg?seed=Matt+Cooper",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        stories: [
            { id: "matt-1", type: "video" as const, src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
        ],
    },
    {
        username: "Kathmandu",
        avatar: "https://api.dicebear.com/6.x/adventurer-neutral/svg?seed=Sofia+Martinez",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        stories: [
            { id: "sofia-1", type: "image" as const, src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=1200&fit=crop" },
        ],
    },
];

export default function StoryUpdates() {
    const [users, setUsers] = useState(fallbackUsers);

    useEffect(() => {
        api.stories.list().then((data: any[]) => {
            if (data && data.length > 0) {
                const mapped = data.map((s: any, idx: number) => ({
                    username: s.name,
                    avatar: s.avatar || `https://api.dicebear.com/6.x/adventurer-neutral/svg?seed=${encodeURIComponent(s.name)}`,
                    timestamp: new Date(Date.now() - (idx + 1) * 60 * 60 * 1000).toISOString(),
                    stories: (s.mediaItems || []).map((m: any, i: number) => ({
                        id: `${s.id}-${i}`,
                        type: m.type || 'image',
                        src: m.src || m.url || '',
                    })),
                }));
                setUsers(mapped);
            }
        }).catch(() => {
            // Keep fallback
        });
    }, []);

    return (
        <div className="w-full max-w-5xl mx-auto px-4 pt-10 pb-4">
            <div className="flex gap-4 overflow-x-auto py-2 px-1 [&::-webkit-scrollbar]:hidden md:[&::-webkit-scrollbar]:block md:[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
                <AddStoryButton />
                {users.map((user) => (
                    <StoryViewer
                        key={user.username}
                        stories={user.stories}
                        username={user.username}
                        avatar={user.avatar}
                        timestamp={user.timestamp}
                        onStoryView={() => { }}
                        onAllStoriesViewed={() => { }}
                    />
                ))}
            </div>
        </div>
    );
}

