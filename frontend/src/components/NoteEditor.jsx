import React, { useState, useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { X, Save, Hash, Type, Bold, Link } from 'lucide-react';

const NoteEditor = ({ note, onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const editorRef = useRef(null);
  const quillInstance = useRef(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setTags(note.tags || '');
    } else {
      setTitle('');
      setContent('');
      setTags('');
    }
  }, [note]);

  useEffect(() => {
    if (editorRef.current && !quillInstance.current) {
      const quill = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: 'Start writing your thoughts, ideas, and tasks here...',
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link'],
            ['clean'],
          ],
          history: {
            delay: 2000,
            maxStack: 500,
            userOnly: true
          }
        },
      });

      quillInstance.current = quill;

      // Set initial content
      if (note?.content) {
        quill.clipboard.dangerouslyPasteHTML(note.content);
      }

      quill.on('text-change', () => {
        setContent(quill.root.innerHTML);
      });
    }

    return () => {
      // No explicit destroy in Quill 1.x/2.x, but we can clear the ref
      // to avoid issues on re-mount if needed.
    };
  }, []); // Run once on mount

  // Sync content if note changes externally (e.g. switching between notes)
  useEffect(() => {
    if (quillInstance.current && note && note.content !== quillInstance.current.root.innerHTML) {
      quillInstance.current.clipboard.dangerouslyPasteHTML(note.content || '');
    }
  }, [note]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({ title, content, tags });
    } catch (err) {
      console.error('Failed to save note:', err);
      setError(err.response?.data?.message || 'Failed to save note. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 p-4 overflow-hidden">
      <style>{`
        .quill-parent {
          display: flex;
          flex-direction: column;
        }
        .quill {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .ql-container {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          font-family: inherit;
        }
        .ql-editor {
          flex-grow: 1;
          min-height: 250px;
          font-size: 1rem;
          line-height: 1.6;
        }
        .ql-toolbar.ql-snow {
          border-top: none;
          border-left: none;
          border-right: none;
          border-bottom: 1px solid #e5e7eb;
          padding: 8px 12px;
        }
        .ql-container.ql-snow {
          border: none;
        }
        .dark .ql-toolbar.ql-snow {
          background-color: #1f2937 !important;
          border-color: #374151 !important;
        }
        .dark .ql-container.ql-snow {
          background-color: #111827 !important;
          color: white !important;
        }
        .dark .ql-stroke {
          stroke: #9ca3af !important;
        }
        .dark .ql-fill {
          fill: #9ca3af !important;
        }
        .dark .ql-picker {
          color: #9ca3af !important;
        }
        .dark .ql-picker-options {
          background-color: #1f2937 !important;
          border-color: #374151 !important;
        }
        .dark .ql-editor.ql-blank::before {
          color: #6b7280 !important;
        }
      `}</style>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Type className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {note ? 'Edit Note' : 'Create New Note'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-grow flex flex-col space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1">Title</label>
            <input
              type="text"
              placeholder="Give your note a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-3xl font-bold border-none outline-none focus:ring-0 placeholder-gray-300 dark:placeholder-gray-600 bg-transparent text-gray-900 dark:text-white"
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1">Tags</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Hash className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Add tags separated by commas (e.g. work, personal, idea)..."
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all sm:text-sm"
              />
            </div>
          </div>
          
          <div className="flex-grow flex flex-col space-y-1">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1">Content</label>
            <div className="flex-grow flex flex-col border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden min-h-[350px] bg-white dark:bg-gray-900 shadow-inner">
              <div className="flex-grow flex flex-col h-full quill-parent">
                <div ref={editorRef} className="flex-grow flex flex-col h-full" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <div className="flex flex-wrap items-center text-[10px] text-gray-400 dark:text-gray-500 gap-x-4 gap-y-1">
                <span className="flex items-center"><Bold className="h-3 w-3 mr-1" /> Rich Text</span>
                <span className="flex items-center"><Link className="h-3 w-3 mr-1" /> Links</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            type="button"
            className="px-6 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            type="button"
            className="flex items-center px-8 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
