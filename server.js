require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://adityabora-realtime-notes-app.vercel.app' 
      : 'http://localhost:3000',
    methods: ["GET", "POST"]
  }
});
// const io = socketIo(server, {
//   cors: {
//     origin: process.env.NODE_ENV === 'production' 
//       ? 'https://your-vercel-app.vercel.app' 
//       : 'http://localhost:3000',
//     methods: ["GET", "POST"]
//   }
// });

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Note Schema
const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

const Note = mongoose.model('Note', noteSchema);

// API Routes
app.post('/api/notes', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const note = new Note({ title });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create note' });
  }
});

app.get('/api/notes/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

app.put('/api/notes/:id', async (req, res) => {
  try {
    const { content } = req.body;
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { content, updatedAt: Date.now() },
      { new: true }
    );
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Socket.IO Connection Handling
const activeUsers = new Map();

const handleUserConnection = (socket) => {
  console.log('New client connected');
  let currentRoom = null;

  socket.on('join_note', async ({ noteId, username }) => {
    try {
      const note = await Note.findById(noteId);
      if (!note) {
        socket.emit('error', 'Note not found');
        return;
      }

      // Leave previous room if any
      if (currentRoom) {
        socket.leave(currentRoom);
        updateActiveUsers(currentRoom);
      }

      // Join new room
      currentRoom = noteId;
      socket.join(noteId);
      
      // Track active user
      if (!activeUsers.has(noteId)) {
        activeUsers.set(noteId, new Set());
      }
      const userId = socket.id;
      activeUsers.get(noteId).add({ id: userId, username: username || `User-${socket.id.slice(0, 5)}` });
      
      // Send current note content and active users
      socket.emit('note_content', { 
        content: note.content, 
        title: note.title,
        activeUsers: Array.from(activeUsers.get(noteId) || [])
      });
      
      // Notify others in the room
      socket.to(noteId).emit('user_joined', { 
        userId,
        username: username || `User-${socket.id.slice(0, 5)}`
      });
      
      updateActiveUsers(noteId);
    } catch (error) {
      console.error('Error joining note:', error);
      socket.emit('error', 'Failed to join note');
    }
  });

  socket.on('note_update', async ({ noteId, content }) => {
    try {
      const note = await Note.findByIdAndUpdate(
        noteId,
        { content, updatedAt: Date.now() },
        { new: true }
      );
      if (note) {
        socket.to(noteId).emit('note_updated', { 
          content: note.content, 
          updatedAt: note.updatedAt,
          userId: socket.id
        });
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    if (currentRoom) {
      // Remove user from active users
      const users = activeUsers.get(currentRoom);
      if (users) {
        const userToRemove = Array.from(users).find(u => u.id === socket.id);
        if (userToRemove) {
          users.delete(userToRemove);
          // Notify others in the room
          socket.to(currentRoom).emit('user_left', { 
            userId: socket.id,
            username: userToRemove.username
          });
          if (users.size === 0) {
            activeUsers.delete(currentRoom);
          } else {
            updateActiveUsers(currentRoom);
          }
        }
      }
    }
  });
};

const updateActiveUsers = (roomId) => {
  const users = Array.from(activeUsers.get(roomId) || []);
  io.to(roomId).emit('active_users', { users });
};

io.on('connection', handleUserConnection);

// Start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  await connectToDatabase();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
