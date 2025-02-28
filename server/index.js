require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

// Налаштування CORS
const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Налаштування Socket.IO
const io = socketIo(server, { cors: corsOptions });

// Монтуємо роутери
app.use('/teacher', require('./routes/TeacherAuth')); // Шляхи: /teacher/register, /teacher/login
app.use('/student', require('./routes/StudentAuth')); // Шляхи: /student/register, /student/login

// Socket.IO
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Підключення до MongoDB
const connectDB = async () => {
    try {
        mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};

connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
