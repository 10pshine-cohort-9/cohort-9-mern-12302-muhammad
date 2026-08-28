import React from 'react';
import { Edit2, Trash2, Calendar, Hash, Mic, Video } from 'lucide-react';
import DOMPurify from 'dompurify';
import useAuthenticatedMedia from '../hooks/useAuthenticatedMedia';


const NoteCard = ({ note, onEdit, onDelete }) => {
  const mediaUrl = useAuthenticatedMedia(
    (note.type === 'voice' || note.type === 'video') ? note.media_url : null
  );

  // Keep basic formatting (bold/italic/lists/etc.) for the preview, but strip
  // everything else (scripts, attributes, images...) to stay safe from XSS.
  const createPreview = (htmlString) => {
    if (!htmlString) return '';
    const cleanHTML = DOMPurify.sanitize(htmlString, {
      ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'u', 's', 'ol', 'ul', 'li', 'br', 'p', 'span'],
      ALLOWED_ATTR: [],
    });
    // Quill's empty state is "<p><br></p>" — treat that as no content.
    const isEmpty = cleanHTML.replace(/<[^>]*>/g, '').trim() === '';
    return isEmpty ? '' : cleanHTML;
  };

  const formattedDate = note.updated_at ? new Date(note.updated_at).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }) : 'No date';

  const tags = note.tags ? note.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
      <style>{`
        .note-preview ol { list-style: decimal; padding-left: 1.25rem; }
        .note-preview ul { list-style: disc; padding-left: 1.25rem; }
      `}</style>
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight truncate flex-grow mr-2" title={note.title}>
            {note.title}
          </h3>
          {note.type === 'voice' && (
            <Mic className="h-4 w-4 text-blue-500 dark:text-blue-400 shrink-0" title="Voice Note" />
          )}
          {note.type === 'video' && (
            <Video className="h-4 w-4 text-blue-500 dark:text-blue-400 shrink-0" title="Video Note" />
          )}
        </div>

        {note.type === 'voice' && note.media_url && (
          mediaUrl
            ? <audio src={mediaUrl} controls className="w-full mb-3" />
            : <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 italic">Loading audio...</p>
        )}

        {note.type === 'video' && note.media_url && (
          mediaUrl
            ? <video src={mediaUrl} controls className="w-full rounded-lg mb-3 max-h-48 bg-black" />
            : <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 italic">Loading video...</p>
        )}

        {(() => {
          const preview = createPreview(note.content);
          return preview ? (
            <div
              className="note-preview text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 italic opacity-50">No content</p>
          );
        })()}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {tags.map((tag, index) => (
              <span 
                key={index} 
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800"
              >
                <Hash className="h-3 w-3 mr-0.5 opacity-70" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center text-gray-400 dark:text-gray-500">
          <Calendar className="h-3.5 w-3.5 mr-1.5" />
          <span className="text-xs font-medium">
            {formattedDate}
          </span>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => onEdit(note)}
            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title="Edit Note"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
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
