const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');
const validator = require('validator');

const router = express.Router();

// Реєстрація викладача (POST /teacher/register)
router.post('/register', async (req, res) => {
    console.log('Запит на реєстрацію викладача отримано');
    const { username, email, password, subjects, experience, bio } = req.body;

    // Валідація даних для викладача
    if (!validator.isEmail(email))
        return res.status(400).json({ error: 'Невірний формат email' });
    if (!validator.isLength(username, { min: 3, max: 20 }))
        return res.status(400).json({ error: 'Ім\'я користувача повинно бути від 3 до 20 символів' });
    if (!validator.isLength(password, { min: 6 }))
        return res.status(400).json({ error: 'Пароль повинен бути не менше 6 символів' });
    if (!Array.isArray(subjects) || subjects.length === 0)
        return res.status(400).json({ error: 'Вкажіть хоча б один предмет' });

    try {
        // Перевірка на унікальність email
        const existingTeacher = await Teacher.findOne({ email });
        if (existingTeacher)
            return res.status(400).json({ error: 'Користувач з таким email вже існує' });

        // Перевірка на унікальність username
        const existingUsername = await Teacher.findOne({ username });
        if (existingUsername)
            return res.status(400).json({ error: 'Ім\'я користувача вже зайняте' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newTeacher = new Teacher({
            username,
            email,
            password: hashedPassword,
            subjects,
            experience,
            bio,
            role: 'teacher'
        });

        await newTeacher.save();
        res.status(201).json({ message: "Викладач успішно зареєстрований!" });
    } catch (error) {
        console.error('Помилка реєстрації викладача:', error.message);
        res.status(500).json({ message: 'Помилка сервера реєстрації' });
    }
});

// Вхід для викладача (POST /teacher/login)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const teacher = await Teacher.findOne({ email });
        if (!teacher)
            return res.status(400).json({ message: 'Невірні облікові дані' });

        const isMatch = await bcrypt.compare(password, teacher.password);
        if (!isMatch)
            return res.status(400).json({ message: 'Невірні облікові дані' });

        const token = jwt.sign({ id: teacher._id, role: teacher.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({
            token,
            user: {
                id: teacher._id,
                username: teacher.username,
                email: teacher.email,
                role: teacher.role,
                subjects: teacher.subjects,
                experience: teacher.experience,
                bio: teacher.bio
            }
        });
    } catch (error) {
        console.error('Помилка логіну викладача:', error.message);
        res.status(500).json({ message: 'Помилка сервера логін' });
    }
});

module.exports = router;
