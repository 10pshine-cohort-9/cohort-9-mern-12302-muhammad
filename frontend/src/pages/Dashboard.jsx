import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { LogOut, User, PlusCircle, Search } from 'lucide-react';
import * as noteService from '../services/notes.service';
import NoteCard from '../components/NoteCard';
import NoteEditor from '../components/NoteEditor';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentEditingNote, setCurrentEditingNote] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await noteService.getNotes();
      setNotes(data);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
      setError('Failed to load notes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = () => {
    setCurrentEditingNote(null);
    setIsEditorOpen(true);
  };

  const handleEditNote = (note) => {
    setCurrentEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleDeleteNote = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await noteService.deleteNote(id);
        setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
      } catch (err) {
        console.error('Failed to delete note:', err);
        alert('Failed to delete note. Please try again.');
      }
    }
  };

  const handleSaveNote = async (noteData) => {
    try {
      if (currentEditingNote) {
        const updatedNote = await noteService.updateNote(currentEditingNote.id, noteData);
        setNotes((prevNotes) => 
          prevNotes.map((note) => (note.id === currentEditingNote.id ? updatedNote : note))
        );
      } else {
        const newNote = await noteService.createNote(noteData);
        setNotes((prevNotes) => [newNote, ...prevNotes]);
      }
      setIsEditorOpen(false);
      setCurrentEditingNote(null);
    } catch (err) {
      throw err; // Let the editor handle the error display
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-white shadow-sm shrink-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="shrink-0">
              <h1 className="text-xl font-bold text-blue-600">NotesApp</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-700">
                <User className="mr-2 h-5 w-5 text-gray-500" />
                <span className="font-medium">{user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center rounded-md bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow flex flex-col">
        <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 flex-grow flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">My Notes</h2>
            <button
              onClick={handleCreateNote}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              New Note
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex-grow flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : notes.length === 0 ? (
            <div className="flex-grow rounded-lg border-2 border-dashed border-gray-300 p-12 flex flex-col items-center justify-center text-gray-500 bg-white">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-1">No notes yet</h3>
              <p className="mb-4">Get started by creating your first note.</p>
              <button
                onClick={handleCreateNote}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                + Create Note
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {notes.map((note) => (
                <NoteCard 
                  key={note.id} 
                  note={note} 
                  onEdit={handleEditNote} 
                  onDelete={handleDeleteNote} 
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {isEditorOpen && (
        <NoteEditor 
          note={currentEditingNote}
          onSave={handleSaveNote}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
