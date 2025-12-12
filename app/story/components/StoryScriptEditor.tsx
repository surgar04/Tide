import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSave, faArrowRight, faList, faCode, faComment, faFilm, faMicrophone, faCodeBranch, faTasks, faGift, faGavel, faRandom, faEquals } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';

import { StoryScriptExtension } from './StoryScriptExtension';

interface StoryScriptEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
}

export default function StoryScriptEditor({ content, onChange, onSave }: StoryScriptEditorProps) {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPos, setSlashMenuPos] = useState({ top: 0, left: 0 });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      StoryScriptExtension,
      Placeholder.configure({
        placeholder: 'Write your story script... Type / for commands',
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getText({ blockSeparator: "\n" }));
      
      // Simple Slash Command Detection
      const { state, view } = editor;
      const { selection } = state;
      const { $from } = selection;
      const charBefore = $from.parent.textBetween(Math.max(0, $from.parentOffset - 1), $from.parentOffset, undefined, "\uFFFC");
      
      if (charBefore === '/') {
        const coords = view.coordsAtPos($from.pos);
        // Calculate relative position to the editor container
        const editorRect = view.dom.getBoundingClientRect();
        setSlashMenuPos({
            top: coords.top - editorRect.top + 30,
            left: coords.left - editorRect.left
        });
        setShowSlashMenu(true);
      } else {
        setShowSlashMenu(false);
      }
    },
    editorProps: {
        attributes: {
            class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-4 text-[var(--end-text-main)]'
        }
    }
  });

  // Sync content if it changes externally (e.g. switching back and forth)
  useEffect(() => {
    if (editor && content !== editor.getText({ blockSeparator: "\n" })) {
        const htmlContent = content.split('\n').map(line => `<p>${line || '<br>'}</p>`).join('');
        editor.commands.setContent(htmlContent);
    }
  }, [content, editor]);
  
  // Actually, we should set content only once on mount or when switching modes explicitly.
  // The parent handles that.

  if (!editor) {
    return null;
  }

  const insertTemplate = (template: string) => {
      // Remove the slash
      editor.commands.deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from });
      editor.commands.insertContent(template);
      setShowSlashMenu(false);
      editor.commands.focus();
  };

  return (
    <div className="relative w-full h-full bg-[var(--end-surface)] border border-[var(--end-border)] rounded-xl overflow-hidden flex flex-col">
       {/* Toolbar */}
       <div className="flex items-center justify-between p-2 border-b border-[var(--end-border)] bg-[var(--end-surface-hover)]">
         <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[var(--end-text-dim)] uppercase px-2">Script Mode</span>
         </div>
         <button 
            onClick={onSave}
            className="flex items-center gap-2 px-3 py-1.5 bg-[var(--end-yellow)] text-black rounded text-xs font-bold hover:bg-[var(--end-yellow-dim)] transition-colors"
         >
            <FontAwesomeIcon icon={faSave} />
            APPLY TO GRAPH
         </button>
       </div>

       <div className="flex-1 overflow-y-auto relative">
         <EditorContent editor={editor} />
         
         {/* Custom Slash Menu */}
         {showSlashMenu && (
            <div 
                className="absolute z-50 w-48 bg-[var(--end-surface)] border border-[var(--end-border)] shadow-xl rounded-lg overflow-hidden flex flex-col animate-in fade-in zoom-in duration-100"
                style={{ top: slashMenuPos.top, left: slashMenuPos.left }}
            >
                <div className="px-3 py-2 bg-[var(--end-surface-hover)] text-[10px] font-bold text-[var(--end-text-dim)] uppercase tracking-wider">
                    Basic Nodes
                </div>
                <button 
                    onClick={() => insertTemplate(`\n# Scene_Node\nID: ${uuidv4()}\nType: scene\n\nScene Description...\n\n### Links\n- Next -> [[Target]]\n\n---\n`)}
                    className="text-left px-4 py-2 text-sm hover:bg-[var(--end-yellow)] hover:text-black transition-colors flex items-center gap-2"
                >
                    <FontAwesomeIcon icon={faFilm} className="w-3" /> Scene
                </button>
                <button 
                    onClick={() => insertTemplate(`\n# Dialogue_Node\nID: ${uuidv4()}\nType: dialogue\nSpeaker: Name\n\nDialogue content...\n\n### Links\n- Next -> [[Target]]\n\n---\n`)}
                    className="text-left px-4 py-2 text-sm hover:bg-[var(--end-yellow)] hover:text-black transition-colors flex items-center gap-2"
                >
                    <FontAwesomeIcon icon={faComment} className="w-3" /> Dialogue
                </button>
                <button 
                    onClick={() => insertTemplate(`\n# Narration_Node\nID: ${uuidv4()}\nType: narration\n\nNarration content...\n\n### Links\n- Next -> [[Target]]\n\n---\n`)}
                    className="text-left px-4 py-2 text-sm hover:bg-[var(--end-yellow)] hover:text-black transition-colors flex items-center gap-2"
                >
                    <FontAwesomeIcon icon={faMicrophone} className="w-3" /> Narration
                </button>
                
                <div className="px-3 py-2 bg-[var(--end-surface-hover)] text-[10px] font-bold text-[var(--end-text-dim)] uppercase tracking-wider border-t border-[var(--end-border)]">
                    Logic & Control
                </div>
                <button 
                    onClick={() => insertTemplate(`\n# Choice_Node\nID: ${uuidv4()}\nType: choice\n\n### Links\n- Option A -> [[Target A]]\n- Option B -> [[Target B]]\n\n---\n`)}
                    className="text-left px-4 py-2 text-sm hover:bg-[var(--end-yellow)] hover:text-black transition-colors flex items-center gap-2"
                >
                    <FontAwesomeIcon icon={faList} className="w-3" /> Choice
                </button>
                <button 
                    onClick={() => insertTemplate(`\n# Condition_Node\nID: ${uuidv4()}\nType: condition\nCondition: variable == true\n\n### Links\n- True -> [[True_Target]]\n- False -> [[False_Target]]\n\n---\n`)}
                    className="text-left px-4 py-2 text-sm hover:bg-[var(--end-yellow)] hover:text-black transition-colors flex items-center gap-2"
                >
                    <FontAwesomeIcon icon={faRandom} className="w-3" /> Condition
                </button>
                <button 
                    onClick={() => insertTemplate(`\n# Setter_Node\nID: ${uuidv4()}\nType: setter\nVariable: varName\nValue: true\n\n### Links\n- Next -> [[Target]]\n\n---\n`)}
                    className="text-left px-4 py-2 text-sm hover:bg-[var(--end-yellow)] hover:text-black transition-colors flex items-center gap-2"
                >
                    <FontAwesomeIcon icon={faEquals} className="w-3" /> Set Variable
                </button>
                <button 
                    onClick={() => insertTemplate(`\n# Branch_Node\nID: ${uuidv4()}\nType: branch\n\nSubplot description...\n\n### Links\n- Next -> [[Target]]\n\n---\n`)}
                    className="text-left px-4 py-2 text-sm hover:bg-[var(--end-yellow)] hover:text-black transition-colors flex items-center gap-2"
                >
                    <FontAwesomeIcon icon={faCodeBranch} className="w-3" /> Subplot Branch
                </button>

                <div className="px-3 py-2 bg-[var(--end-surface-hover)] text-[10px] font-bold text-[var(--end-text-dim)] uppercase tracking-wider border-t border-[var(--end-border)]">
                    Gameplay
                </div>
                <button 
                    onClick={() => insertTemplate(`\n# Task_Node\nID: ${uuidv4()}\nType: task\nTaskStatus: pending\n\nTask description...\n\n### Links\n- Next -> [[Target]]\n\n---\n`)}
                    className="text-left px-4 py-2 text-sm hover:bg-[var(--end-yellow)] hover:text-black transition-colors flex items-center gap-2"
                >
                    <FontAwesomeIcon icon={faTasks} className="w-3" /> Task
                </button>
                <button 
                    onClick={() => insertTemplate(`\n# Reward_Node\nID: ${uuidv4()}\nType: reward\nRewardType: Gold\nAmount: 100\n\n### Links\n- Next -> [[Target]]\n\n---\n`)}
                    className="text-left px-4 py-2 text-sm hover:bg-[var(--end-yellow)] hover:text-black transition-colors flex items-center gap-2"
                >
                    <FontAwesomeIcon icon={faGift} className="w-3" /> Reward
                </button>
                <button 
                    onClick={() => insertTemplate(`\n# Punishment_Node\nID: ${uuidv4()}\nType: punishment\nPunishmentType: HP\nAmount: 10\n\n### Links\n- Next -> [[Target]]\n\n---\n`)}
                    className="text-left px-4 py-2 text-sm hover:bg-[var(--end-yellow)] hover:text-black transition-colors flex items-center gap-2"
                >
                    <FontAwesomeIcon icon={faGavel} className="w-3" /> Punishment
                </button>
                
                <div className="border-t border-[var(--end-border)] my-1"></div>
                <button 
                    onClick={() => insertTemplate("- Link Label -> [[Target Node]]")}
                    className="text-left px-4 py-2 text-sm hover:bg-[var(--end-yellow)] hover:text-black transition-colors flex items-center gap-2"
                >
                    <FontAwesomeIcon icon={faArrowRight} className="w-3" /> Link Connection
                </button>
            </div>
         )}
       </div>
    </div>
  );
}
