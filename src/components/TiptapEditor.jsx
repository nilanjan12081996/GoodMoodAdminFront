import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Link } from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  ListTodo,
  Indent,
  Outdent,
  Link as LinkIcon,
  Table as TableIcon,
  Undo2,
  Redo2,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  Palette,
  Plus,
  Trash2,
  Columns,
  Rows,
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

const TiptapEditor = ({ value = '', onChange, placeholder = 'Write content here...' }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const colorPickerRef = useRef(null);
  const tableMenuRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (onChange) {
        onChange(editor.isEmpty ? '' : html);
      }
    },
    editorProps: {
      attributes: {
        class:
          'min-h-[220px] max-h-[500px] overflow-y-auto px-4 py-3.5 outline-none text-slate-800 dark:text-slate-100 text-sm sm:text-base leading-relaxed',
      },
    },
  });

  // Sync incoming external value changes
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    const incoming = value || '';
    if (incoming !== currentHtml && (incoming !== '' || !editor.isEmpty)) {
      editor.commands.setContent(incoming, false);
    }
  }, [value, editor]);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target)) {
        setShowColorPicker(false);
      }
      if (tableMenuRef.current && !tableMenuRef.current.contains(e.target)) {
        setShowTableMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (!editor) return null;

  const currentColor = editor.getAttributes('textStyle').color || '#000000';

  const handleSetLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter link URL (e.g. https://example.com):', previousUrl || '');
    if (url === null) return;
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  const handleIndent = () => {
    if (editor.can().sinkListItem('listItem')) {
      editor.chain().focus().sinkListItem('listItem').run();
    } else if (editor.can().sinkListItem('taskItem')) {
      editor.chain().focus().sinkListItem('taskItem').run();
    }
  };

  const handleOutdent = () => {
    if (editor.can().liftListItem('listItem')) {
      editor.chain().focus().liftListItem('listItem').run();
    } else if (editor.can().liftListItem('taskItem')) {
      editor.chain().focus().liftListItem('taskItem').run();
    }
  };

  const canIndent = editor.can().sinkListItem('listItem') || editor.can().sinkListItem('taskItem');
  const canOutdent = editor.can().liftListItem('listItem') || editor.can().liftListItem('taskItem');

  return (
    <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs overflow-hidden transition-all focus-within:border-[#0B8843] focus-within:ring-2 focus-within:ring-[#0B8843]/15">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 select-none">
        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="Undo (Cmd+Z)"
        >
          <Undo2 size={17} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="Redo (Cmd+Shift+Z)"
        >
          <Redo2 size={17} />
        </button>

        <span className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            editor.isActive('paragraph') && !editor.isActive('heading')
              ? 'bg-[#0B8843] text-white'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
          }`}
          title="Normal Paragraph"
        >
          <Pilcrow size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-[#0B8843] text-white'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
          }`}
          title="Heading 1"
        >
          <Heading1 size={17} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-[#0B8843] text-white'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
          }`}
          title="Heading 2"
        >
          <Heading2 size={17} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-[#0B8843] text-white'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
          }`}
          title="Heading 3"
        >
          <Heading3 size={17} />
        </button>

        <span className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Basic Styles */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('bold')
              ? 'bg-[#0B8843] text-white'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
          }`}
          title="Bold (Cmd+B)"
        >
          <Bold size={17} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('italic')
              ? 'bg-[#0B8843] text-white'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
          }`}
          title="Italic (Cmd+I)"
        >
          <Italic size={17} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('underline')
              ? 'bg-[#0B8843] text-white'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
          }`}
          title="Underline (Cmd+U)"
        >
          <UnderlineIcon size={17} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('strike')
              ? 'bg-[#0B8843] text-white'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
          }`}
          title="Strikethrough"
        >
          <Strikethrough size={17} />
        </button>

        {/* Color Picker Dropdown */}
        <div className="relative" ref={colorPickerRef}>
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
            title="Text Color"
          >
            <Palette size={17} />
            <span
              className="w-2.5 h-2.5 rounded-full border border-slate-300"
              style={{ backgroundColor: currentColor }}
            />
          </button>

          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1.5 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setColor(c).run();
                    setShowColorPicker(false);
                  }}
                  className="w-5 h-5 rounded-full border border-slate-300 hover:scale-115 transition-transform cursor-pointer"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
              <input
                type="color"
                value={currentColor}
                onChange={(e) => {
                  editor.chain().focus().setColor(e.target.value).run();
                }}
                className="w-6 h-6 border-0 p-0 rounded-full cursor-pointer bg-transparent"
                title="Custom color"
              />
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  setShowColorPicker(false);
                }}
                className="text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white px-1.5 py-0.5 rounded cursor-pointer"
                title="Reset color"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Link Button */}
        <button
          type="button"
          onClick={handleSetLink}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('link')
              ? 'bg-[#0B8843] text-white'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
          }`}
          title="Insert / Edit Link"
        >
          <LinkIcon size={17} />
        </button>

        <span className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* ── List Variety ── */}
        {/* Bullet List */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('bulletList')
              ? 'bg-[#0B8843] text-white'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
          }`}
          title="Bulleted List (•)"
        >
          <List size={17} />
        </button>

        {/* Numbered List */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('orderedList')
              ? 'bg-[#0B8843] text-white'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
          }`}
          title="Numbered List (1, 2, 3)"
        >
          <ListOrdered size={17} />
        </button>

        {/* Task List / Checklist */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('taskList')
              ? 'bg-[#0B8843] text-white'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
          }`}
          title="Checklist / Task List ([✓])"
        >
          <ListTodo size={17} />
        </button>

        {/* Outdent (Shift+Tab) */}
        <button
          type="button"
          onClick={handleOutdent}
          disabled={!canOutdent}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="Outdent List Item (Shift+Tab)"
        >
          <Outdent size={17} />
        </button>

        {/* Indent (Tab / Sub-list) */}
        <button
          type="button"
          onClick={handleIndent}
          disabled={!canIndent}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="Indent List Item / Make Sub-list (Tab)"
        >
          <Indent size={17} />
        </button>

        <span className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Table Menu */}
        <div className="relative" ref={tableMenuRef}>
          <button
            type="button"
            onClick={() => setShowTableMenu(!showTableMenu)}
            className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
              editor.isActive('table')
                ? 'bg-[#0B8843] text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
            }`}
            title="Table Options"
          >
            <TableIcon size={17} />
            <span className="text-[11px] font-semibold">Table</span>
          </button>

          {showTableMenu && (
            <div className="absolute top-full right-0 sm:left-0 mt-1.5 p-1.5 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 min-w-[190px] flex flex-col gap-0.5 text-xs font-medium text-slate-700 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => {
                  editor
                    .chain()
                    .focus()
                    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                    .run();
                  setShowTableMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-[#0B8843] flex items-center gap-2 cursor-pointer"
              >
                <Plus size={14} /> Insert 3x3 Table
              </button>
              {editor.isActive('table') && (
                <>
                  <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().addRowAfter().run();
                      setShowTableMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Rows size={14} /> Add Row Below
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().deleteRow().run();
                      setShowTableMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 size={14} /> Delete Row
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().addColumnAfter().run();
                      setShowTableMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Columns size={14} /> Add Column Right
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().deleteColumn().run();
                      setShowTableMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 size={14} /> Delete Column
                  </button>
                  <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().deleteTable().run();
                      setShowTableMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 size={14} /> Delete Entire Table
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Content Editable Area ── */}
      <div className="tiptap-content-wrapper">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TiptapEditor;
