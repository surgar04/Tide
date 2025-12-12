import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faSave, faArrowRight, faList, faCode, faComment, faFilm, 
  faMicrophone, faCodeBranch, faTasks, faGift, faGavel, faRandom, faEquals,
  faBold, faItalic, faStrikethrough, faListUl, faListOl, faQuoteLeft, 
  faUndo, faRedo, faMinus, faHeading
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';

import { StoryScriptExtension } from './StoryScriptExtension';

interface StoryScriptEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  prefabBindings?: Record<string, any[]>; // Add this prop
}

const ToolbarButton = ({ onClick, isActive = false, disabled = false, icon, label, title }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "p-1.5 min-w-[28px] h-[28px] flex items-center justify-center rounded hover:bg-[var(--end-surface-hover)] transition-colors text-[var(--end-text-dim)] hover:text-[var(--end-text-main)]",
      isActive && "bg-[var(--end-surface-hover)] text-[var(--end-yellow)]",
      disabled && "opacity-30 cursor-not-allowed"
    )}
    title={title}
  >
    {icon && <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5" />}
    {label && <span className="text-xs font-bold">{label}</span>}
  </button>
);

const Divider = () => <div className="w-[1px] h-4 bg-[var(--end-border)] mx-1" />;

export default function StoryScriptEditor({ content, onChange, onSave, prefabBindings = {} }: StoryScriptEditorProps) {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPos, setSlashMenuPos] = useState({ top: 0, left: 0 });

  // ID Generation Menu State
  const [showIdMenu, setShowIdMenu] = useState(false);
  const [idMenuPos, setIdMenuPos] = useState({ top: 0, left: 0 });
  const [generatedId, setGeneratedId] = useState("");

  // Existing ID Autocomplete State
  const [showIdSelectMenu, setShowIdSelectMenu] = useState(false);
  const [existingIds, setExistingIds] = useState<string[]>([]);
  const [idSelectPos, setIdSelectPos] = useState({ top: 0, left: 0 });

  // Prefab Menu State
  const [showPrefabMenu, setShowPrefabMenu] = useState(false);
  const [prefabMenuPos, setPrefabMenuPos] = useState({ top: 0, left: 0 });
  const [availablePrefabs, setAvailablePrefabs] = useState<any[]>([]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      StoryScriptExtension,
      Placeholder.configure({
        placeholder: 'Write your story script... Type / for commands, type "id" to generate ID',
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getText({ blockSeparator: "\n" }));
      
      const { state, view } = editor;
      const { selection } = state;
      const { $from } = selection;

      // 1. Slash Command Detection (/ or 、)
      const charBefore = $from.parent.textBetween(Math.max(0, $from.parentOffset - 1), $from.parentOffset, undefined, "\uFFFC");
      if (charBefore === '/' || charBefore === '、') {
        const coords = view.coordsAtPos($from.pos);
        const editorRect = view.dom.getBoundingClientRect();
        setSlashMenuPos({
            top: coords.top - editorRect.top + 30,
            left: coords.left - editorRect.left
        });
        setShowSlashMenu(true);
        setShowIdMenu(false); // Close other menus
      } else {
        setShowSlashMenu(false);
      }

      // 2. ID Generation Detection (type "id" followed by space or just "id" at end?)
      // User said "when input id, generate an id for user to select"
      // Let's trigger when "id" is typed as a standalone word or at end of line?
      // Or simply check last 2 chars are "id"
      const lastTwoChars = $from.parent.textBetween(Math.max(0, $from.parentOffset - 2), $from.parentOffset, undefined, "\uFFFC");
      // Check char before "id" to ensure it's a word boundary (space, start of line, or bracket, or ->)
      // FIX: Also check if "id" is NOT followed by other characters (must be end of word)
      // But here we are at cursor position, so usually it is end of word unless we are editing middle.
      
      const charBeforeId = $from.parent.textBetween(Math.max(0, $from.parentOffset - 3), Math.max(0, $from.parentOffset - 2), undefined, "\uFFFC");
      
      // We accept if charBeforeId is whitespace, empty (start of line), or specific punctuation
      // We also need to make sure we are NOT inside another word (e.g. "void")
      const isWordBoundary = !charBeforeId || /[\s\[\]\->:：.,]/.test(charBeforeId);

      // We also need to check if we just inserted content? No, generatedId state handles menu.
      // But we should regenerate ID if we are opening menu anew.
      
      if (lastTwoChars === 'id' && isWordBoundary) {
            const coords = view.coordsAtPos($from.pos);
            const editorRect = view.dom.getBoundingClientRect();
            
            // Only generate new ID if menu was NOT open, or if we want to refresh?
            // Actually, if we type "id" again elsewhere, we want a new ID.
            // The issue user reported: "next id input no reaction".
            // This might be because showIdMenu is already true? Or state not resetting?
            // Or maybe because of the word boundary check failing for some reason?
            // Or maybe uuidv4().split('-')[0] is generating same ID? Unlikely.
            
            // If menu is already open, maybe we shouldn't reset generatedId?
            // But if we moved cursor to new location and typed "id", we want menu there.
            
            // Let's just always update pos and open menu.
            // If we are "typing" id, we update generatedId only if menu wasn't open?
            // No, we should update it if we just finished typing "id".
            
            // To fix "no reaction", ensure we detect it correctly.
            
            if (!showIdMenu) {
                setGeneratedId(uuidv4().split('-')[0]);
            }
            
            setIdMenuPos({
                top: coords.top - editorRect.top + 30,
                left: coords.left - editorRect.left
            });
            setShowIdMenu(true);
            setShowSlashMenu(false);
            setShowIdSelectMenu(false);
       } else {
            // If we move away or type more, hide it?
            // For simplicity, strict match "id" at cursor.
            setShowIdMenu(false);
       }

       // 3. Existing ID Autocomplete Detection (type "[[")
       const lastTwoCharsBracket = $from.parent.textBetween(Math.max(0, $from.parentOffset - 2), $from.parentOffset, undefined, "\uFFFC");
       if (lastTwoCharsBracket === '[[') {
           // Find all existing IDs in the content
           const allText = editor.getText();
           const idMatches = Array.from(allText.matchAll(/\[\[([a-zA-Z0-9]+)\]\]/g));
           const ids = [...new Set(idMatches.map(m => m[1]))]; // Unique IDs
           
           if (ids.length > 0) {
               setExistingIds(ids);
               const coords = view.coordsAtPos($from.pos);
               const editorRect = view.dom.getBoundingClientRect();
               
               setIdSelectPos({
                   top: coords.top - editorRect.top + 30,
                   left: coords.left - editorRect.left
               });
               setShowIdSelectMenu(true);
               setShowSlashMenu(false);
               setShowIdMenu(false);
               setShowPrefabMenu(false);
           }
       } else {
           // Check if we are inside [[...]]?
           // Let's close if we are not right after [[
           if (showIdSelectMenu && lastTwoCharsBracket !== '[[') {
               setShowIdSelectMenu(false);
           }
       }

       // 4. Prefab Menu Detection (type "{")
       const charBeforeBrace = $from.parent.textBetween(Math.max(0, $from.parentOffset - 1), $from.parentOffset, undefined, "\uFFFC");
       if (charBeforeBrace === '{') {
           // Collect all prefabs from props
           const allPrefabs: any[] = [];
           Object.entries(prefabBindings).forEach(([name, bindings]) => {
               bindings.forEach(binding => {
                   allPrefabs.push({ ...binding, npcName: name });
               });
           });

           if (allPrefabs.length > 0) {
               setAvailablePrefabs(allPrefabs);
               const coords = view.coordsAtPos($from.pos);
               const editorRect = view.dom.getBoundingClientRect();
               
               setPrefabMenuPos({
                   top: coords.top - editorRect.top + 30,
                   left: coords.left - editorRect.left
               });
               setShowPrefabMenu(true);
               setShowSlashMenu(false);
               setShowIdMenu(false);
               setShowIdSelectMenu(false);
           }
       } else {
           setShowPrefabMenu(false);
       }
     },
    editorProps: {
        attributes: {
            class: 'prose prose-invert prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-8 text-[var(--end-text-main)] max-w-none'
        },
        handleKeyDown: (view, event) => {
            // Auto-indentation logic
            if (event.key === 'Enter') {
                const { state, dispatch } = view;
                const { selection } = state;
                const { $from } = selection;
                const line = $from.parent.textBetween(0, $from.parent.content.size, undefined, "\uFFFC");
                
                // Get current indentation
                const indentMatch = line.match(/^\s*/);
                const currentIndent = indentMatch ? indentMatch[0] : '';
                
                // Check if line ends with opening block syntax (e.g. [ 选项： or [ 判断：)
                // Or if it's an option line "- ..." inside a block?
                // Actually, if we hit enter inside a block, we want to maintain indent.
                // If we opened a block, we want to increase indent.
                
                const isBlockStart = /\[\s*(选项|判断).*?\]?\s*$/.test(line) && !/\]\s*$/.test(line); // Opened but not closed on same line? 
                // Wait, our blocks are:
                // [ 选项：
                //     - ...
                // ]
                // So if line matches /\[\s*(选项|判断).*?[：:]\s*$/, we increase indent.
                
                const shouldIncreaseIndent = /\[\s*(选项|判断).*?[：:]\s*$/.test(line);
                
                if (shouldIncreaseIndent) {
                    event.preventDefault();
                    const tr = state.tr.insertText('\n' + currentIndent + '    '); // 4 spaces indent
                    dispatch(tr);
                    return true;
                }
                
                // Maintain indent
                if (currentIndent.length > 0) {
                    event.preventDefault();
                    const tr = state.tr.insertText('\n' + currentIndent);
                    dispatch(tr);
                    return true;
                }
            }
            
            if (event.key === 'F12') {
                event.preventDefault();
                event.stopPropagation();
                
                // Trigger slash menu manually
                const { state } = view;
                const { selection } = state;
                const { $from } = selection;
                const coords = view.coordsAtPos($from.pos);
                const editorRect = view.dom.getBoundingClientRect();
                
                setSlashMenuPos({
                    top: coords.top - editorRect.top + 30,
                    left: coords.left - editorRect.left
                });
                setShowSlashMenu(true);
                return true;
            }
            return false;
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

  const insertTemplate = (template: string, cursorOffset: number = 0) => {
      // Remove the trigger character (slash or comma or none if F12)
      // Check if we were triggered by char or key
      const { selection } = editor.state;
      const { $from } = selection;
      const charBefore = $from.parent.textBetween(Math.max(0, $from.parentOffset - 1), $from.parentOffset, undefined, "\uFFFC");
      
      if (charBefore === '/' || charBefore === '、') {
          editor.commands.deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from });
      }

      editor.commands.insertContent(template);
      
      if (cursorOffset !== 0) {
          const pos = editor.state.selection.from + cursorOffset;
          editor.commands.setTextSelection(pos);
      }
      
      setShowSlashMenu(false);
      editor.commands.focus();
  };

  const insertGeneratedId = () => {
       // Replace "id" with the generated ID
       editor.commands.deleteRange({ from: editor.state.selection.from - 2, to: editor.state.selection.from });
       editor.commands.insertContent(`[[${generatedId}]]`);
       setShowIdMenu(false);
       editor.commands.focus();
   };

   const insertExistingId = (id: string) => {
       // We assume cursor is after [[
       // Just insert ID and closing ]]
       // Wait, if we typed [[, do we insert just ID]] or replace [[?
       // The trigger is [[. So content is ...[[|
       // We should just insert ID + ]]
       
       editor.commands.insertContent(`${id}]]`);
       setShowIdSelectMenu(false);
       editor.commands.focus();
   };

   const insertPrefab = (prefab: any) => {
       // We assume cursor is after {
       // Remove {
       editor.commands.deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from });
       
       // Insert format: {{NPCName:BindingID}}
       // This is distinct from [[OptionID]] and allows parsing both name and ID.
       editor.commands.insertContent(`{{${prefab.npcName}:${prefab.id}}}`);
       
       setShowPrefabMenu(false);
       editor.commands.focus();
   };

  return (
    <div className="relative w-full h-full bg-[var(--end-surface)] border border-[var(--end-border)] rounded-xl overflow-hidden flex flex-col shadow-sm">
       {/* Toolbar */}
       <div className="flex flex-wrap items-center gap-1 p-2 border-b border-[var(--end-border)] bg-[var(--end-surface)] sticky top-0 z-10 backdrop-blur-sm bg-opacity-95">
         
         {/* History */}
         <ToolbarButton 
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            icon={faUndo}
            title="Undo"
         />
         <ToolbarButton 
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            icon={faRedo}
            title="Redo"
         />
         
         <Divider />
         
         {/* Headings */}
         <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            label="H1"
            title="Heading 1"
         />
         <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            label="H2"
            title="Heading 2"
         />
         <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            label="H3"
            title="Heading 3"
         />
         
         <Divider />
         
         {/* Formatting */}
         <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            icon={faBold}
            title="Bold"
         />
         <ToolbarButton 
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            icon={faItalic}
            title="Italic"
         />
         <ToolbarButton 
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            icon={faStrikethrough}
            title="Strike"
         />
         <ToolbarButton 
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            icon={faCode}
            title="Code"
         />
         
         <Divider />
         
         {/* Lists */}
         <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            icon={faListUl}
            title="Bullet List"
         />
         <ToolbarButton 
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            icon={faListOl}
            title="Ordered List"
         />
         
         <Divider />
         
         {/* Blocks */}
         <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            icon={faQuoteLeft}
            title="Blockquote"
         />
         <ToolbarButton 
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            icon={faMinus}
            title="Horizontal Rule"
         />
         
         <div className="flex-1" />
         
         {/* Action */}
         <button 
            onClick={onSave}
            className="flex items-center gap-2 px-3 py-1.5 bg-[var(--end-yellow)] text-black rounded text-xs font-bold hover:bg-[var(--end-yellow-dim)] transition-colors shadow-sm"
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
                    基础节点
                </div>
                <button 
                    onClick={() => insertTemplate(`\n[ 场景： ]\n`, -2)}
                    className="text-left px-4 py-2 text-sm hover:bg-[var(--end-yellow)] hover:text-black transition-colors flex items-center gap-2"
                >
                    <span className="w-2 h-2 rounded-full bg-slate-800"></span> 场景 (Scene)
                </button>
                <button 
                    onClick={() => insertTemplate(`\n[ 对话-： ]\n`, -3)}
                    className="text-left px-4 py-2 text-sm hover:bg-[var(--end-yellow)] hover:text-black transition-colors flex items-center gap-2"
                >
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> 对话 (Dialogue)
                </button>
                <button 
                    onClick={() => insertTemplate(`\n[ 旁白： ]\n`, -2)}
                    className="text-left px-4 py-2 text-sm hover:bg-[var(--end-yellow)] hover:text-black transition-colors flex items-center gap-2"
                >
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span> 旁白 (Narration)
                </button>
                <button 
                    onClick={() => insertTemplate(`\n[ 支线： ]\n`, -2)}
                    className="text-left px-4 py-2 text-sm hover:bg-[var(--end-yellow)] hover:text-black transition-colors flex items-center gap-2"
                >
                    <span className="w-2 h-2 rounded-full bg-teal-500"></span> 支线 (Subplot)
                </button>
                <button 
                    onClick={() => insertTemplate(`\n[ 任务： ]\n`, -2)}
                    className="text-left px-4 py-2 text-sm hover:bg-[var(--end-yellow)] hover:text-black transition-colors flex items-center gap-2"
                >
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span> 任务 (Task)
                </button>
                
                <div className="px-3 py-2 bg-[var(--end-surface-hover)] text-[10px] font-bold text-[var(--end-text-dim)] uppercase tracking-wider border-t border-[var(--end-border)]">
                    逻辑控制
                </div>
                <button 
                    onClick={() => insertTemplate(`\n[ 选项：\n    - \n    - \n]\n`, -10)}
                    className="text-left px-4 py-2 text-sm hover:bg-[var(--end-yellow)] hover:text-black transition-colors flex items-center gap-2"
                >
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span> 选项 (Choice)
                </button>
                <button 
                    onClick={() => insertTemplate(`\n[ 判断：\n    - ：\n    - ：\n]\n`, -12)}
                    className="text-left px-4 py-2 text-sm hover:bg-[var(--end-yellow)] hover:text-black transition-colors flex items-center gap-2"
                >
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span> 判断 (Condition)
                </button>
                <button 
                    onClick={() => insertTemplate(`\n[ 变量： = ]\n`, -3)}
                    className="text-left px-4 py-2 text-sm hover:bg-[var(--end-yellow)] hover:text-black transition-colors flex items-center gap-2"
                >
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> 变量 (Set Var)
                </button>
                <button 
                    onClick={() => insertTemplate(`\n[ 奖励： ]\n`, -2)}
                    className="text-left px-4 py-2 text-sm hover:bg-[var(--end-yellow)] hover:text-black transition-colors flex items-center gap-2"
                >
                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span> 奖励 (Reward)
                </button>
                <button 
                    onClick={() => insertTemplate(`\n[ 惩罚： ]\n`, -2)}
                    className="text-left px-4 py-2 text-sm hover:bg-[var(--end-yellow)] hover:text-black transition-colors flex items-center gap-2"
                >
                    <span className="w-2 h-2 rounded-full bg-red-500"></span> 惩罚 (Punishment)
                </button>
                
                <div className="border-t border-[var(--end-border)] my-1"></div>
                <button 
                    onClick={() => insertTemplate(" -> [[Target Node Name]]", -18)}
                    className="text-left px-4 py-2 text-sm hover:bg-[var(--end-yellow)] hover:text-black transition-colors flex items-center gap-2"
                >
                    <FontAwesomeIcon icon={faArrowRight} className="w-3" /> 连接 (Link Connection)
                </button>
            </div>
         )}

         {/* ID Generation Menu */}
          {showIdMenu && (
             <div 
                 className="absolute z-50 w-64 bg-[var(--end-surface)] border border-[var(--end-border)] shadow-xl rounded-lg overflow-hidden flex flex-col animate-in fade-in zoom-in duration-100"
                 style={{ top: idMenuPos.top, left: idMenuPos.left }}
             >
                 <div className="px-3 py-2 bg-[var(--end-surface-hover)] text-[10px] font-bold text-[var(--end-text-dim)] uppercase tracking-wider flex justify-between items-center">
                     <span>生成唯一标识符</span>
                     <span className="bg-[var(--end-yellow)] text-black px-1 rounded text-[9px]">ENTER</span>
                 </div>
                 <button 
                     onClick={insertGeneratedId}
                     className="text-left px-4 py-3 text-sm hover:bg-[var(--end-surface-hover)] transition-colors flex items-center gap-3 group"
                 >
                     <div className="w-8 h-8 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                         ID
                     </div>
                     <div>
                         <div className="font-mono font-bold text-[var(--end-text-main)]">[[{generatedId}]]</div>
                         <div className="text-[10px] text-[var(--end-text-dim)]">点击插入此唯一ID</div>
                     </div>
                 </button>
             </div>
          )}

          {/* Existing ID Selection Menu */}
          {showIdSelectMenu && (
             <div 
                 className="absolute z-50 w-64 max-h-60 bg-[var(--end-surface)] border border-[var(--end-border)] shadow-xl rounded-lg overflow-hidden flex flex-col animate-in fade-in zoom-in duration-100"
                 style={{ top: idSelectPos.top, left: idSelectPos.left }}
             >
                 <div className="px-3 py-2 bg-[var(--end-surface-hover)] text-[10px] font-bold text-[var(--end-text-dim)] uppercase tracking-wider border-b border-[var(--end-border)]">
                     选择已有 ID ({existingIds.length})
                 </div>
                 <div className="overflow-y-auto">
                    {existingIds.map(id => (
                        <button 
                            key={id}
                            onClick={() => insertExistingId(id)}
                            className="w-full text-left px-4 py-2 text-xs font-mono hover:bg-[var(--end-surface-hover)] transition-colors flex items-center gap-2 border-b border-slate-100 last:border-0"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                            {id}
                        </button>
                    ))}
                 </div>
             </div>
          )}
        </div>
     </div>
  );
}
