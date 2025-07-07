import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faSpinner, faCopy, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useSocket } from '../contexts/SocketContext.jsx';

const NoteEditor = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const [note, setNote] = useState({ title: '', content: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  const [lastSaved, setLastSaved] = useState(null);
  const [username, setUsername] = useState('');
  const saveTimeoutRef = useRef(null);
  const usernameInputRef = useRef(null);

  // Generate a random username if not set
  useEffect(() => {
    const savedUsername = localStorage.getItem('collab-notes-username');
    if (savedUsername) {
      setUsername(savedUsername);
    } else {
      const randomUsername = `User-${Math.floor(1000 + Math.random() * 9000)}`;
      setUsername(randomUsername);
      localStorage.setItem('collab-notes-username', randomUsername);
    }
  }, []);

  // Fetch note data
  useEffect(() => {
    if (!username) return;

    const fetchNote = async () => {
      setIsLoading(true);
      setError('');
      try {
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/notes/${noteId}`;
        console.log('Fetching note from:', apiUrl);
        
        const response = await axios.get(apiUrl, {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          timeout: 10000 // 10 second timeout
        });
        
        console.log('Note fetched successfully:', response.data);
        setNote({
          title: response.data.title,
          content: response.data.content
        });
        setLastSaved(new Date(response.data.updatedAt).toLocaleTimeString());
      } catch (err) {
        console.error('Error fetching note:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          config: {
            url: err.config?.url,
            method: err.config?.method,
            headers: err.config?.headers
          }
        });
        
        if (err.response?.status === 404) {
          setError('Note not found. It may have been deleted.');
        } else if (err.response?.status === 400) {
          setError('Invalid note ID format.');
        } else if (err.code === 'ECONNABORTED') {
          setError('Request timed out. Please check your connection and try again.');
        } else {
          setError('Failed to load note. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [noteId, username]);

  // Socket.io setup
  useEffect(() => {
    if (!socket || !isConnected || !username) return;

    const handleNoteUpdate = (data) => {
      // Only update if the update is from another user
      if (data.userId !== socket.id) {
        setNote(prev => ({
          ...prev,
          content: data.content,
        }));
      }
      setLastSaved(new Date().toLocaleTimeString());
    };

    const handleActiveUsers = ({ users }) => {
      setActiveUsers(users);
    };

    const handleUserJoined = (data) => {
      if (data.userId !== socket.id) {
        console.log(`${data.username} joined the note`);
      }
    };

    const handleUserLeft = (data) => {
      console.log(`${data.username} left the note`);
    };

    // Join the note room
    socket.emit('join_note', { 
      noteId,
      username
    });

    // Listen for updates
    socket.on('note_updated', handleNoteUpdate);
    socket.on('active_users', handleActiveUsers);
    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      socket.off('note_updated', handleNoteUpdate);
      socket.off('active_users', handleActiveUsers);
      socket.off('user_joined', handleUserJoined);
      socket.off('user_left', handleUserLeft);
      socket.off('error');
    };
  }, [socket, isConnected, noteId, username]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setNote(prev => ({
      ...prev,
      content: newContent
    }));

    // Debounce the socket emit
    if (socket && isConnected) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        socket.emit('note_update', {
          noteId,
          content: newContent
        });
      }, 300);
    }
  };

  const copyNoteLink = () => {
    const url = `${window.location.origin}/notes/${noteId}`;
    navigator.clipboard.writeText(url);
    alert('Note link copied to clipboard!');
  };

  const handleUsernameChange = (e) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    localStorage.setItem('collab-notes-username', newUsername);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-indigo-600 mb-4" />
          <p className="text-gray-600">Loading note...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-300 hover:text-indigo-400 flex items-center transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Back
            </button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">You are:</span>
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                className="text-sm bg-transparent border-b border-gray-500 focus:border-indigo-400 focus:outline-none px-1 py-0.5 w-32 text-gray-100 placeholder-gray-400"
                ref={usernameInputRef}
                style={{ color: 'inherit' }}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <FontAwesomeIcon icon={faUsers} className="mr-1" />
              <span>{activeUsers.length} {activeUsers.length === 1 ? 'person' : 'people'} online</span>
            </div>
            <button
              onClick={copyNoteLink}
              className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded flex items-center transition-colors"
              title="Copy note link"
            >
              <FontAwesomeIcon icon={faCopy} className="mr-1.5" />
              Share
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 text-gray-100">
        <h1 className="text-3xl font-bold mb-6 text-white">{note.title}</h1>
        
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden">
          <TextareaAutosize
            value={note.content}
            onChange={handleContentChange}
            className="w-full p-4 focus:outline-none resize-none min-h-[300px] text-gray-100 leading-relaxed bg-transparent placeholder-gray-500"
            style={{ color: 'inherit' }}
            placeholder="Start typing your note here..."
            disabled={!isConnected}
          />
        </div>

        {!isConnected && (
          <div className="mt-2 text-sm text-yellow-600 flex items-center">
            <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
            Connecting to server...
          </div>
        )}

        {lastSaved && (
          <div className="mt-4 text-sm text-gray-400">
            Last saved at {lastSaved}
          </div>
        )}
      </main>
    </div>
  );
};

export default NoteEditor;
