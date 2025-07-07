# Real-Time Collaborative Notes App

A full-stack real-time collaborative note-taking application that allows multiple users to edit the same document simultaneously. Built with the MERN stack and Socket.IO for real-time updates.

## 🌟 Features

- Real-time collaborative editing
- Live user presence (see who's online)
- No login required
- Share notes via URL
- Dark mode support
- Auto-save functionality
- Responsive design

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite (for faster development)
- Tailwind CSS (for styling)
- Socket.IO Client (for real-time updates)
- React Router (for navigation)
- Font Awesome (for icons)

### Backend
- Node.js
- Express.js
- Socket.IO (for WebSocket communication)
- MongoDB (with Mongoose ODM)
- CORS (for cross-origin requests)

### Development Tools
- npm (package manager)
- nodemon (for development server)
- dotenv (for environment variables)

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- MongoDB Atlas account (or local MongoDB instance)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Aditroid/goforit.git
   cd goforit
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Set up environment variables**

   Create a `.env` file in the root directory with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   ```

   Create a `.env` file in the `client` directory with:
   ```
   VITE_API_URL=http://localhost:5000
   ```

### Running the Application

1. **Start the backend server** (from root directory)
   ```bash
   npm run dev
   ```

2. **Start the frontend development server** (in a new terminal)
   ```bash
   cd client
   npm run dev
   ```

3. Open your browser and visit: `http://localhost:3000`

## 📦 Production Build

To create a production build of the frontend:

```bash
cd client
npm run build
```

## 🌐 Deployment

### Backend
Deploy the backend to a platform like Render, Railway, or Heroku. Set the following environment variables:
- `MONGODB_URI`: Your MongoDB connection string
- `PORT`: The port to run the server on (usually set by the platform)

### Frontend
1. Update the `VITE_API_URL` in `client/.env` to point to your deployed backend
2. Deploy the `client` directory to Vercel, Netlify, or GitHub Pages

## 🧪 Testing

To test the real-time functionality:
1. Open the app in two different browsers (or incognito windows)
2. Create or open the same note in both windows
3. Type in one window - changes should appear in the other window instantly

## 📝 Project Structure

```
collaborative-notes/
├── client/                   # Frontend React application
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── contexts/        # React context providers
│   │   ├── pages/           # Page components
│   │   ├── App.jsx          # Main App component
│   │   └── main.jsx         # Entry point
│   ├── .env                 # Frontend environment variables
│   └── package.json         # Frontend dependencies
├── models/                  # MongoDB models
├── node_modules/            # Backend dependencies
├── .env                     # Backend environment variables
├── .gitignore              # Git ignore file
├── package.json             # Backend dependencies and scripts
├── README.md               # This file
└── server.js               # Backend server entry point
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Socket.IO for real-time communication
- React for the frontend framework
- Tailwind CSS for styling
- MongoDB for data persistence

## 📧 Contact

Your Name - your.email@example.com

Project Link: [https://github.com/yourusername/collaborative-notes](https://github.com/yourusername/collaborative-notes)
