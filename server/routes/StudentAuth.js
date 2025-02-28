const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const validator = require('validator');

const router = express.Router();

// Реєстрація студента (POST /student/register)
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    // Валідація даних для студента
    if (!validator.isEmail(email))
        return res.status(400).json({ error: 'Невірний формат email' });
    if (!validator.isLength(username, { min: 3, max: 20 }))
        return res.status(400).json({ error: 'Ім\'я користувача повинно бути від 3 до 20 символів' });
    if (!validator.isLength(password, { min: 6 }))
        return res.status(400).json({ error: 'Пароль повинен бути не менше 6 символів' });

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ error: 'Такий користувач вже існує' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(201).json({ message: "Користувач успішно зареєстрований!" });
    } catch (error) {
        console.error('Помилка реєстрації студента:', error.message);
        res.status(500).json({ message: 'Помилка сервера реєстрації студента' });
    }
});

// Вхід для студента (POST /student/login)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ message: 'Невірні облікові дані' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: 'Невірні облікові дані' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Помилка логіну студента:', error.message);
        res.status(500).json({ message: 'Помилка сервера логін студента' });
    }
});

module.exports = router;
