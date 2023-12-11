// const {User, Users} = require('../models/models')
// const ApiError = require('../error/ApiError')
const db = require('../db')
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');

class UserController {
    async registration(req, res) {
        try {
            const { first_name, last_name, patronymic, passport_number, phone, email, password } = req.body;
            const hashPassword = bcrypt.hashSync(password, 10);
            const newUser = await db.query('INSERT INTO users (first_name, last_name, patronymic, email, password, passport_number, phone) ' +
                'VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [first_name, last_name, patronymic, email, hashPassword, passport_number, phone]);

            res.status(201).json(newUser.rows[0]); // Используйте статус 201 Created
        } catch (e) {
            if (e.code === '23505' && e.constraint === 'users_email_key') {
                return res.status(400).json({ message: 'User with this email already exists' });
            }
            res.status(400).json({ message: 'Registration error' });
        }
    }


    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);

            if (user.rows.length > 0) {
                const hashedPassword = user.rows[0].password;
                const passwordMatch = bcrypt.compareSync(password, hashedPassword);

                if (passwordMatch) {
                    console.log(user.rows[0])
                    res.status(201).json(user.rows[0]);
                } else {
                    res.status(401).json({ message: 'Invalid login or password' });
                }
            } else {
                res.status(401).json({ message: 'Invalid login or password' });
            }
        } catch (e) {
            console.error(e);
            res.status(400).json({ message: 'Login error' });
        }
    }

    async getAllUsers(req, res) {
        // const users = await Users.findAll()
        // return res.json(users)
        const allUsers = await db.query('SELECT * FROM users')
        res.json(allUsers.rows)
    }

    async getUserByPhone(req, res) {
        const userPhone = req.params.phone
        const user = await db.query(`SELECT user_id, first_name, last_name, phone FROM users WHERE users.phone = '${userPhone}'`)

        if (user.rows.length > 0) {
            res.json(user.rows[0]);
        } else {
            // Отправка статуса 404 и сообщения о том, что пользователь не найден
            res.status(404).json({error: 'User not found'});
        }
    }

    async getUserById(req, res) {
        const userId = req.params.id
        console.log(userId)
        const user = await db.query(`SELECT first_name, last_name, phone FROM users WHERE users.user_id = '${userId}'`)

        if (user.rows.length > 0) {
            res.json(user.rows[0]);
        } else {
            // Отправка статуса 404 и сообщения о том, что пользователь не найден
            res.status(404).json({error: 'User not found'});
        }
    }
}

module.exports = new UserController()