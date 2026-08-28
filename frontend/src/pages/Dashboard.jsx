import React, { useState, useEffect, useContext, useMemo } from 'react';
import useAuth from '../hooks/useAuth';
import { LogOut, User, PlusCircle, Search, Moon, Sun, X, StickyNote, ListTodo } from 'lucide-react';
import * as noteService from '../services/notes.service';
import NoteCard from '../components/NoteCard';
import NoteEditor from '../components/NoteEditor';
import ProfileModal from '../components/ProfileModal';
import TaskList from '../components/TaskList';
import { ThemeContext } from '../context/ThemeContext';
import DOMPurify from 'dompurify';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('notes');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentEditingNote, setCurrentEditingNote] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await noteService.getNotes();
      setNotes(response.data || []);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const filteredNotes = useMemo(() => {
    if (!Array.isArray(notes)) return [];
    
    if (!searchQuery.trim()) return notes;
    
    const query = searchQuery.toLowerCase();
    return notes.filter(note => {
      const titleMatch = (note.title || '').toLowerCase().includes(query);
      const contentMatch = DOMPurify.sanitize(note.content || '', { ALLOWED_TAGS: [] }).toLowerCase().includes(query);
      const tagsMatch = note.tags && note.tags.toLowerCase().includes(query);
      return titleMatch || contentMatch || tagsMatch;
    });
  }, [notes, searchQuery]);

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
        const response = await noteService.updateNote(currentEditingNote.id, noteData);
        const updatedNote = response.data;
        setNotes((prevNotes) => 
          prevNotes.map((note) => (note.id === currentEditingNote.id ? updatedNote : note))
        );
      } else {
        const response = await noteService.createNote(noteData);
        const newNote = response.data;
        setNotes((prevNotes) => [newNote, ...prevNotes]);
      }
      setIsEditorOpen(false);
      setCurrentEditingNote(null);
    } catch (err) {
      console.error('Failed to save note:', err);
      alert('Failed to save note. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 shrink-0 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center gap-4">
            <div className="shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">myNotes</h1>
            </div>

            {/* Search Bar */}
            {activeTab === 'notes' && (
              <div className="flex-grow max-w-2xl hidden md:block">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search notes by title, content or tags..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2 md:space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              <button
                onClick={() => setIsProfileOpen(true)}
                className="hidden sm:flex items-center text-gray-700 dark:text-gray-200 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Profile Settings"
              >
                <User className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium truncate max-w-[100px]">{user?.name}</span>
              </button>

              <button
                onClick={logout}
                className="flex items-center rounded-lg bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
              >
                <LogOut className="mr-0 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center py-3 border-b-2 text-sm font-semibold transition-colors ${
                activeTab === 'notes'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <StickyNote className="mr-2 h-4 w-4" />
              Notes
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center py-3 border-b-2 text-sm font-semibold transition-colors ${
                activeTab === 'tasks'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <ListTodo className="mr-2 h-4 w-4" />
              Tasks
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {activeTab === 'notes' && (
        <div className="md:hidden px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search notes..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      <main className="flex-grow flex flex-col overflow-x-hidden">
        <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 flex-grow flex flex-col">
          {activeTab === 'tasks' ? (
            <TaskList />
          ) : (
          <>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">My Notes</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {searchQuery ? `Found ${filteredNotes.length} matches` : `You have ${notes.length} notes`}
              </p>
            </div>
            <button
              onClick={handleCreateNote}
              className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 font-semibold"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              New Note
            </button>
          </div>

          {/* error block removed */}

          {loading ? (
            <div className="flex-grow flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="flex-grow rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 shadow-sm">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-full mb-4">
                <Search className="h-10 w-10 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {searchQuery ? 'No matching notes found' : 'No notes yet'}
              </h3>
              <p className="mb-6 text-center max-w-xs">
                {searchQuery 
                  ? `We couldn't find any notes matching "${searchQuery}". Try a different term.`
                  : 'Get started by creating your first note to capture your thoughts.'
                }
              </p>
              {!searchQuery && (
                <button
                  onClick={handleCreateNote}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Create Your First Note
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredNotes.map((note) => (
                <NoteCard 
                  key={note.id} 
                  note={note} 
                  onEdit={handleEditNote} 
                  onDelete={handleDeleteNote} 
                />
              ))}
            </div>
          )}
          </>
          )}
        </div>
      </main>

      {isEditorOpen && (
        <NoteEditor 
          key={currentEditingNote?.id || 'new'}
          note={currentEditingNote}
          onSave={handleSaveNote}
          onClose={() => setIsEditorOpen(false)}
        />
      )}

      {isProfileOpen && (
        <ProfileModal onClose={() => setIsProfileOpen(false)} />
      )}
    </div>
  );
};

export default Dashboard;
