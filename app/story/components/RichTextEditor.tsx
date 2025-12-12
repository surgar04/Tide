import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBold, faItalic, faListUl, faListOl, faQuoteLeft, faCode, 
  faUndo, faRedo, faHeading, faParagraph 
} from '@fortawesome/free-solid-svg-icons';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-slate-200 bg-slate-50 rounded-t-lg">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-1.5 rounded text-sm min-w-[28px] ${editor.isActive('bold') ? 'bg-[var(--end-yellow)] text-black' : 'text-slate-600 hover:bg-slate-200'}`}
        title="Bold"
      >
        <FontAwesomeIcon icon={faBold} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded text-sm min-w-[28px] ${editor.isActive('italic') ? 'bg-[var(--end-yellow)] text-black' : 'text-slate-600 hover:bg-slate-200'}`}
        title="Italic"
      >
        <FontAwesomeIcon icon={faItalic} />
      </button>
      
      <div className="w-px h-6 bg-slate-300 mx-1 self-center" />

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1.5 rounded text-sm min-w-[28px] ${editor.isActive('heading', { level: 1 }) ? 'bg-[var(--end-yellow)] text-black' : 'text-slate-600 hover:bg-slate-200'}`}
        title="H1"
      >
        <FontAwesomeIcon icon={faHeading} />
      </button>
      <button
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={`p-1.5 rounded text-sm min-w-[28px] ${editor.isActive('paragraph') ? 'bg-[var(--end-yellow)] text-black' : 'text-slate-600 hover:bg-slate-200'}`}
        title="Paragraph"
      >
        <FontAwesomeIcon icon={faParagraph} />
      </button>

      <div className="w-px h-6 bg-slate-300 mx-1 self-center" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded text-sm min-w-[28px] ${editor.isActive('bulletList') ? 'bg-[var(--end-yellow)] text-black' : 'text-slate-600 hover:bg-slate-200'}`}
        title="Bullet List"
      >
        <FontAwesomeIcon icon={faListUl} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded text-sm min-w-[28px] ${editor.isActive('orderedList') ? 'bg-[var(--end-yellow)] text-black' : 'text-slate-600 hover:bg-slate-200'}`}
        title="Ordered List"
      >
        <FontAwesomeIcon icon={faListOl} />
      </button>

      <div className="w-px h-6 bg-slate-300 mx-1 self-center" />

      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded text-sm min-w-[28px] ${editor.isActive('blockquote') ? 'bg-[var(--end-yellow)] text-black' : 'text-slate-600 hover:bg-slate-200'}`}
        title="Quote"
      >
        <FontAwesomeIcon icon={faQuoteLeft} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-1.5 rounded text-sm min-w-[28px] ${editor.isActive('codeBlock') ? 'bg-[var(--end-yellow)] text-black' : 'text-slate-600 hover:bg-slate-200'}`}
        title="Code Block"
      >
        <FontAwesomeIcon icon={faCode} />
      </button>

      <div className="w-px h-6 bg-slate-300 mx-1 self-center" />

      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-1.5 rounded text-sm min-w-[28px] text-slate-600 hover:bg-slate-200 disabled:opacity-30"
        title="Undo"
      >
        <FontAwesomeIcon icon={faUndo} />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-1.5 rounded text-sm min-w-[28px] text-slate-600 hover:bg-slate-200 disabled:opacity-30"
        title="Redo"
      >
        <FontAwesomeIcon icon={faRedo} />
      </button>
    </div>
  );
};

export default function RichTextEditor({ content, onChange, readOnly = false }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: '在此编写您的剧情内容...',
      }),
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm md:prose-base max-w-none focus:outline-none min-h-[300px] p-4 font-mono text-[var(--end-text-main)]',
      },
    },
  });

  // Sync content from prop
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-slate-200 overflow-hidden">
      {!readOnly && <MenuBar editor={editor} />}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
