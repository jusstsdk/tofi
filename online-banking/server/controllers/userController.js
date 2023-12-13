const db = require('../db')
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer')
require('dotenv').config();

function generateRandom6DigitNumber() {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const sendEmail = async (receiver, content) => {
    const mailTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_NAME,
            pass: process.env.GMAIL_PASS
        }
    })

    const details = {
        from: process.env.GMAIL_NAME,
        to: receiver,
        subject: "Код подтвеждения",
        text: `Код подтверждения входа: ${content}`
    }

    await mailTransporter.sendMail(details);
};

class UserController {
    async registration(req, res) {
        try {
            const { first_name, last_name, patronymic, passport_number, phone, email, password } = req.body;
            const hashPassword = bcrypt.hashSync(password, 10);
            const newUser = await db.query('INSERT INTO users (first_name, last_name, patronymic, email, password, passport_number, phone) ' +
                'VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [first_name, last_name, patronymic, email, hashPassword, passport_number, phone]);

            res.status(201).json(newUser.rows[0]);
        } catch (e) {
            if (e.code === '23505' && e.constraint === 'users_email_key') {
                return res.status(400).json({ message: 'User with this email already exists' });
            }
            res.status(400).json({ message: 'Registration error' });
        }
    }

    async sendVerificationCode(req, res) {
        try {
            const email = req.params.email
            const verificationCode = generateRandom6DigitNumber()
            const authCode = await db.query('UPDATE users SET auth_code = $1 WHERE email = $2', [verificationCode, email])
            await sendEmail(email, verificationCode)
            res.status(200).json({ authCode: verificationCode })
        }
        catch {
            res.status(500).json({ message: 'Internal server error' });
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
                    res.status(201).json(user.rows[0]);
                } else {
                    res.status(401).json({ message: 'Invalid login or password' });
                }
            } else {
                res.status(401).json({ message: 'Invalid login or password' });
            }
        } catch (e) {
            // console.error(e);
            res.status(400).json({ message: 'Login error' });
        }
    }

    // async getAllUsers(req, res) {
    //     const allUsers = await db.query('SELECT * FROM users')
    //     res.json(allUsers.rows)
    // }

    async getUserByPhone(req, res) {
        const userPhone = req.params.phone
        const user = await db.query(`SELECT user_id, first_name, last_name, phone FROM users WHERE users.phone = '${userPhone}'`)

        if (user.rows.length > 0) {
            res.json(user.rows[0]);
        } else {
            res.status(404).json({error: 'User not found'});
        }
    }

    async getUserById(req, res) {
        const userId = req.params.id
        const user = await db.query(`SELECT first_name, last_name, phone FROM users WHERE users.user_id = '${userId}'`)

        if (user.rows.length > 0) {
            res.json(user.rows[0]);
        } else {
            res.status(404).json({error: 'User not found'});
        }
    }
}

module.exports = new UserController()