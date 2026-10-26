import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Palette,
} from 'lucide-react';

const COLOR_PALETTE = [
  '#000000',
  '#1e293b',
  '#0b8843',
  '#2563eb',
  '#7c3aed',
  '#db2777',
  '#dc2626',
  '#d97706',
];

const TitleEditor = ({ value = '', onChange, placeholder = 'Enter title...' }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Underline,
      TextStyle,
      Color,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (onChange) {
        // Strip outer <p>...</p> wrapper if needed, or pass full rich html
        onChange(editor.isEmpty ? '' : html);
      }
    },
    editorProps: {
      handleKeyDown: (view, event) => {
        // Prevent enter key so title stays single line
        if (event.key === 'Enter') {
          event.preventDefault();
          return true;
        }
        return false;
      },
      attributes: {
        'data-placeholder': placeholder,
        class:
          'px-4 py-2.5 outline-none text-slate-900 dark:text-white font-normal text-base sm:text-lg min-h-[46px] flex items-center',
      },
    },
  });

  // Sync external incoming value
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    const incoming = value || '';
    if (incoming !== currentHtml && (incoming !== '' || !editor.isEmpty)) {
      editor.commands.setContent(incoming, false);
    }
  }, [value, editor]);

  // Close color picker on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target)) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (!editor) return null;

  const currentColor = editor.getAttributes('textStyle').color || '#000000';

  return (
    <div className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs overflow-hidden transition-all focus-within:border-[#0B8843] focus-within:ring-2 focus-within:ring-[#0B8843]/15">
      {/* ── Mini Toolbar for Title ── */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 select-none">
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
          Title Formatting
        </span>

        <div className="flex items-center gap-1">
          {/* Bold */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1 rounded-md transition-colors cursor-pointer ${
              editor.isActive('bold')
                ? 'bg-[#0B8843] text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="Bold (Cmd+B)"
          >
            <Bold size={15} />
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1 rounded-md transition-colors cursor-pointer ${
              editor.isActive('italic')
                ? 'bg-[#0B8843] text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="Italic (Cmd+I)"
          >
            <Italic size={15} />
          </button>

          {/* Underline */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1 rounded-md transition-colors cursor-pointer ${
              editor.isActive('underline')
                ? 'bg-[#0B8843] text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="Underline (Cmd+U)"
          >
            <UnderlineIcon size={15} />
          </button>

          {/* Strikethrough */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1 rounded-md transition-colors cursor-pointer ${
              editor.isActive('strike')
                ? 'bg-[#0B8843] text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="Strikethrough"
          >
            <Strikethrough size={15} />
          </button>

          {/* Color Picker */}
          <div className="relative" ref={colorPickerRef}>
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
              title="Title Text Color"
            >
              <Palette size={15} />
              <span
                className="w-2.5 h-2.5 rounded-full border border-slate-300"
                style={{ backgroundColor: currentColor }}
              />
            </button>

            {showColorPicker && (
              <div className="absolute top-full right-0 mt-1.5 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 flex items-center gap-1.5 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      editor.chain().focus().setColor(c).run();
                      setShowColorPicker(false);
                    }}
                    className="w-5 h-5 shrink-0 rounded-full border border-slate-300 hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: c, width: '20px', height: '20px' }}
                    title={c}
                  />
                ))}
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => {
                    editor.chain().focus().setColor(e.target.value).run();
                  }}
                  className="w-6 h-6 shrink-0 border-0 p-0 rounded-full cursor-pointer bg-transparent"
                  style={{ width: '24px', height: '24px' }}
                  title="Custom color"
                />
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().unsetColor().run();
                    setShowColorPicker(false);
                  }}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white px-1.5 py-0.5 rounded cursor-pointer shrink-0"
                  title="Reset color"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Title Input Area ── */}
      <div className="tiptap-title-wrapper">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TitleEditor;
