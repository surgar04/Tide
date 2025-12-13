"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faFolder, 
    faFile, 
    faImage, 
    faBoxOpen, 
    faCode, 
    faMusic,
    faSearch,
    faFilter
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

const MOCK_FILES = [
    { name: 'Models', type: 'folder', children: [
        { name: 'Buildings', type: 'folder', children: [
            { name: 'Apartment_01.glb', type: 'model' },
            { name: 'Office_Complex.glb', type: 'model' }
        ]},
        { name: 'Characters', type: 'folder' },
        { name: 'Props', type: 'folder' }
    ]},
    { name: 'Textures', type: 'folder', children: [
        { name: 'Ground_Dirt.png', type: 'image' },
        { name: 'Wall_Concrete.jpg', type: 'image' }
    ]},
    { name: 'Scripts', type: 'folder', children: [
        { name: 'PlayerController.cs', type: 'script' },
        { name: 'GameManager.ts', type: 'script' }
    ]},
    { name: 'Audio', type: 'folder' },
    { name: 'Prefabs', type: 'folder' },
];

export function AssetBrowser() {
    const [currentPath, setCurrentPath] = useState<any[]>([]);
    
    // Helper to get current directory contents
    const getCurrentContents = () => {
        let current = MOCK_FILES;
        for (const folder of currentPath) {
            const found = current.find(f => f.name === folder);
            if (found && found.children) {
                current = found.children;
            } else {
                return [];
            }
        }
        return current;
    };

    const handleNavigate = (folderName: string) => {
        setCurrentPath([...currentPath, folderName]);
    };

    const handleUp = () => {
        if (currentPath.length > 0) {
            setCurrentPath(currentPath.slice(0, -1));
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'folder': return faFolder;
            case 'image': return faImage;
            case 'model': return faBoxOpen;
            case 'script': return faCode;
            case 'audio': return faMusic;
            default: return faFile;
        }
    };

    return (
        <div className="flex flex-col h-full bg-[var(--end-surface)] border-t border-[var(--end-border)]">
            {/* Header / Breadcrumbs */}
            <div className="flex items-center gap-2 p-2 border-b border-[var(--end-border)] bg-[var(--end-surface-hover)]">
                <button 
                    onClick={handleUp} 
                    disabled={currentPath.length === 0}
                    className="px-2 py-1 text-xs font-mono text-[var(--end-text-sub)] hover:text-[var(--end-text-main)] disabled:opacity-30"
                >
                    ..
                </button>
                <div className="flex items-center gap-1 text-xs font-mono text-[var(--end-text-sub)]">
                    <span 
                        className="cursor-pointer hover:text-[var(--end-yellow)]"
                        onClick={() => setCurrentPath([])}
                    >
                        ASSETS
                    </span>
                    {currentPath.map((folder, i) => (
                        <span key={i} className="flex items-center gap-1">
                            <span>/</span>
                            <span 
                                className="cursor-pointer hover:text-[var(--end-yellow)]"
                                onClick={() => setCurrentPath(currentPath.slice(0, i + 1))}
                            >
                                {folder}
                            </span>
                        </span>
                    ))}
                </div>
                
                <div className="ml-auto flex items-center gap-2">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Filter..." 
                            className="bg-black/20 border border-[var(--end-border)] rounded px-2 py-1 text-xs text-[var(--end-text-main)] w-32 focus:outline-none focus:border-[var(--end-yellow)]"
                        />
                        <FontAwesomeIcon icon={faSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--end-text-dim)]" />
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="flex-1 overflow-y-auto p-2">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2">
                    {getCurrentContents().map((item, i) => (
                        <div 
                            key={i}
                            className="flex flex-col items-center gap-2 p-2 rounded hover:bg-white/5 cursor-pointer group"
                            onDoubleClick={() => item.type === 'folder' && handleNavigate(item.name)}
                        >
                            <div className={`text-3xl ${item.type === 'folder' ? 'text-[var(--end-yellow)]' : 'text-[var(--end-text-sub)]'} group-hover:scale-110 transition-transform`}>
                                <FontAwesomeIcon icon={getIcon(item.type)} />
                            </div>
                            <span className="text-[10px] text-[var(--end-text-main)] font-mono text-center break-all line-clamp-2">
                                {item.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Footer Info */}
            <div className="px-2 py-1 bg-[var(--end-surface-hover)] border-t border-[var(--end-border)] text-[10px] text-[var(--end-text-dim)] font-mono flex justify-between">
                <span>{getCurrentContents().length} ITEMS</span>
                <span>DRAG & DROP SUPPORTED</span>
            </div>
        </div>
    );
}
