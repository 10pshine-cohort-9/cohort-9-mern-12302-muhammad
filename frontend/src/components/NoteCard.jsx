import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import DOMPurify from 'dompurify';

const NoteCard = ({ note, onEdit, onDelete }) => {
  // Strip HTML tags for preview and truncate
  const createPreview = (htmlString) => {
    const cleanHTML = DOMPurify.sanitize(htmlString, { ALLOWED_TAGS: [] });
    return cleanHTML.length > 150 ? cleanHTML.substring(0, 150) + '...' : cleanHTML;
  };

  const formattedDate = new Date(note.updated_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="p-5 flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate" title={note.title}>
          {note.title}
        </h3>
        <p className="text-gray-600 text-sm whitespace-pre-wrap break-words">
          {createPreview(note.content)}
        </p>
      </div>
      
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {formattedDate}
        </span>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(note)}
            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
            title="Edit Note"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"
            title="Delete Note"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
