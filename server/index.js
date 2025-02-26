require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

// Настройка CORS с указанием источника
const corsOptions = {
    origin: 'http://localhost:3000', // Разрешаем только фронтенду на localhost:3000
    methods: ['GET', 'POST']
};

const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000', // Разрешаем только этот источник
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true, // Разрешаем передавать куки и другие данные
    }
});


app.use(cors(corsOptions)); // Применяем CORS для обычных API-запросов
app.use(express.json());

// Роуты
app.get('/start', (req, res) => {
    res.send("API is running...");
});

// Socket.IO
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Подключение к MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};

connectDB();

// Запуск сервера
const PORT = process.env.PORT || 5000; // Порт по умолчанию 5000
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
