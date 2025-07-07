import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const HomePage = () => {
  const [title, setTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setIsCreating(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/notes`, { title });
      navigate(`/notes/${response.data._id}`);
    } catch (error) {
      console.error('Failed to create note:', error);
      alert('Failed to create note. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-700">
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-400">Collaborative Notes</h1>
        <form onSubmit={handleCreateNote} className="space-y-4">
          <div>
            <label htmlFor="note-title" className="block text-sm font-medium text-gray-700 mb-1">
              Note Title
            </label>
            <input
              type="text"
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400"
              placeholder="Enter a title for your note"
              autoComplete="off"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isCreating}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            {isCreating ? 'Creating...' : 'Create New Note'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HomePage;
