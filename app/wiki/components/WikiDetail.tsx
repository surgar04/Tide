import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faShareAlt, faPrint, faBookmark, faTag, faClock } from "@fortawesome/free-solid-svg-icons";
import { WikiEntry } from "../types";

interface WikiDetailProps {
  entry: WikiEntry;
  onClose: () => void;
}

export default function WikiDetail({ entry, onClose }: WikiDetailProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[var(--end-surface)]/95 border border-[var(--end-border)] shadow-[0_0_50px_rgba(0,0,0,0.8)] w-full max-w-4xl max-h-[85vh] flex flex-col relative backdrop-blur-sm"
      >
        {/* Deco Corners */}
        <div className="absolute -top-[1px] -left-[1px] w-6 h-6 border-t-2 border-l-2 border-[var(--end-yellow)] z-10" />
        <div className="absolute -top-[1px] -right-[1px] w-6 h-6 border-t-2 border-r-2 border-[var(--end-yellow)] z-10" />
        <div className="absolute -bottom-[1px] -left-[1px] w-6 h-6 border-b-2 border-l-2 border-[var(--end-yellow)] z-10" />
        <div className="absolute -bottom-[1px] -right-[1px] w-6 h-6 border-b-2 border-r-2 border-[var(--end-yellow)] z-10" />

        {/* Tech Decor */}
        <div className="absolute top-10 left-0 w-[1px] h-20 bg-gradient-to-b from-[var(--end-yellow)]/50 to-transparent" />
        <div className="absolute bottom-10 right-0 w-[1px] h-20 bg-gradient-to-t from-[var(--end-yellow)]/50 to-transparent" />

        {/* Header */}
        <div className="p-6 border-b border-[var(--end-border)] bg-black/40 relative overflow-hidden flex justify-between items-start">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-[var(--end-yellow)]/50 to-transparent" />
          
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-[var(--end-yellow)] text-black text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest">
                {entry.category}
              </span>
              <span className="text-[var(--end-text-dim)] text-xs font-mono flex items-center gap-1">
                <FontAwesomeIcon icon={faClock} className="w-3" />
                {entry.date}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-[var(--end-text-main)] uppercase tracking-wide">
              {entry.title}
            </h2>
          </div>

          <div className="flex gap-2">
            <button className="w-8 h-8 flex items-center justify-center text-[var(--end-text-sub)] hover:text-[var(--end-yellow)] transition-colors">
              <FontAwesomeIcon icon={faPrint} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-[var(--end-text-sub)] hover:text-[var(--end-yellow)] transition-colors">
              <FontAwesomeIcon icon={faShareAlt} />
            </button>
            <button 
              onClick={onClose} 
              className="w-8 h-8 flex items-center justify-center text-[var(--end-text-sub)] hover:text-black hover:bg-[var(--end-yellow)] transition-all border border-transparent hover:border-[var(--end-yellow)] ml-2"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="prose prose-invert max-w-none">
             {/* Simulate content rendering - in real app might be Markdown */}
             <div className="text-[var(--end-text-sub)] leading-relaxed space-y-4">
                {entry.content.split('\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                ))}
             </div>
          </div>
          
          {/* Tags */}
          <div className="mt-8 pt-8 border-t border-[var(--end-border)] flex flex-wrap gap-2">
            {entry.tags.map(tag => (
                <span key={tag} className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-[var(--end-border)] text-xs text-[var(--end-text-sub)] hover:border-[var(--end-yellow)] transition-colors cursor-pointer">
                    <FontAwesomeIcon icon={faTag} className="text-[var(--end-text-dim)]" />
                    {tag}
                </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--end-border)] bg-black/40 flex justify-between items-center text-[10px] text-[var(--end-text-dim)] font-mono">
           <span>DOC_ID: {entry.id}</span>
           <span>CLASSIFIED LEVEL: 2</span>
        </div>
      </motion.div>
    </div>
  );
}
