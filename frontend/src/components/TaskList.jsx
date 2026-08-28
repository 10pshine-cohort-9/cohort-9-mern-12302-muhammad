import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, CheckSquare, ListTodo, Clock } from 'lucide-react';
import * as taskService from '../services/tasks.service';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'completed', label: 'Completed' },
];

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTasks();
      setTasks(response.data || []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      setIsAdding(true);
      const response = await taskService.createTask({ title: newTaskTitle.trim() });
      setTasks((prev) => [response.data, ...prev]);
      setNewTaskTitle('');
    } catch (err) {
      console.error('Failed to create task:', err);
      alert('Failed to create task. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleTask = async (task) => {
    try {
      const response = await taskService.updateTask(task.id, { is_completed: !task.is_completed });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? response.data : t)));
    } catch (err) {
      console.error('Failed to update task:', err);
      alert('Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskService.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Failed to delete task:', err);
      alert('Failed to delete task. Please try again.');
    }
  };

  const pendingCount = tasks.filter((t) => !t.is_completed).length;

  const filteredTasks = useMemo(() => {
    const sorted = [...tasks].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    if (filter === 'pending') return sorted.filter((t) => !t.is_completed);
    if (filter === 'completed') return sorted.filter((t) => t.is_completed);
    return sorted;
  }, [tasks, filter]);

  const formatTimestamp = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex-grow flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">My Tasks</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {tasks.length === 0
              ? 'No tasks yet'
              : `${pendingCount} pending of ${tasks.length} tasks${filter !== 'all' ? ` · showing ${filteredTasks.length} ${filter}` : ''}`}
          </p>
        </div>
      </div>

      <form onSubmit={handleAddTask} className="flex items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Add a new task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="flex-grow px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <button
          type="submit"
          disabled={isAdding || !newTaskTitle.trim()}
          className="flex items-center px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-5 w-5 mr-1" />
          Add
        </button>
      </form>

      <div className="flex items-center gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              filter === f.key
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex-grow rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 shadow-sm">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-full mb-4">
            <ListTodo className="h-10 w-10 text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {filter === 'pending' ? 'No pending tasks' : filter === 'completed' ? 'No completed tasks' : 'No tasks yet'}
          </h3>
          <p className="mb-2 text-center max-w-xs">
            {filter === 'all'
              ? 'Add a task above to start tracking your to-dos.'
              : 'Try switching to a different filter.'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            >
              <button
                onClick={() => handleToggleTask(task)}
                className={`shrink-0 h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                  task.is_completed
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
                }`}
                title={task.is_completed ? 'Mark as pending' : 'Mark as done'}
              >
                {task.is_completed && <CheckSquare className="h-4 w-4 text-white" />}
              </button>
              <div className="flex-grow min-w-0">
                <span
                  className={`block text-sm sm:text-base truncate ${
                    task.is_completed
                      ? 'line-through text-gray-400 dark:text-gray-500'
                      : 'text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {task.title}
                </span>
                <span className="flex items-center text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTimestamp(task.created_at)}
                </span>
              </div>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                title="Delete task"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;
