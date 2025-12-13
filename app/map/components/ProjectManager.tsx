"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faProjectDiagram, 
    faPlus, 
    faSave,
    faFolderOpen
} from "@fortawesome/free-solid-svg-icons";

export function ProjectManager() {
    return (
        <div className="flex flex-col h-full bg-[var(--end-surface)] border-r border-[var(--end-border)] w-12 items-center py-4 gap-4">
            <button 
                className="w-8 h-8 flex items-center justify-center text-[var(--end-text-sub)] hover:text-[var(--end-text-main)] hover:bg-white/10 rounded transition-colors"
                title="Project Settings"
            >
                <FontAwesomeIcon icon={faProjectDiagram} />
            </button>
            
            <div className="w-8 h-[1px] bg-[var(--end-border)]" />
            
            <button 
                className="w-8 h-8 flex items-center justify-center text-[var(--end-text-sub)] hover:text-[var(--end-yellow)] hover:bg-white/10 rounded transition-colors"
                title="New Map"
            >
                <FontAwesomeIcon icon={faPlus} />
            </button>
            
            <button 
                className="w-8 h-8 flex items-center justify-center text-[var(--end-text-sub)] hover:text-[var(--end-text-main)] hover:bg-white/10 rounded transition-colors"
                title="Open Map"
            >
                <FontAwesomeIcon icon={faFolderOpen} />
            </button>
            
            <button 
                className="w-8 h-8 flex items-center justify-center text-[var(--end-text-sub)] hover:text-[var(--end-text-main)] hover:bg-white/10 rounded transition-colors"
                title="Save Map"
            >
                <FontAwesomeIcon icon={faSave} />
            </button>
        </div>
    );
}
