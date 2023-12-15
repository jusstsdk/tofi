const uuid = require('uuid')
const db = require("../db");

function calculateDateWithPeriod(years) {
    const currentDate = new Date();
    const newDate = new Date(currentDate.getFullYear() + years, currentDate.getMonth(), currentDate.getDate(), 3);
    return newDate.toISOString();
}

class CreditController {
    async getAllUserCredits(req, res) {
        try {
            const user_id = req.params.id;
            const credits = await db.query(`SELECT * FROM credits WHERE user_id = $1`, [user_id]);
            return res.json(credits.rows);
        } catch (error) {
            // console.error('Error fetching user payments:', error);
            return res.status(500).json({error: 'Internal Server Error'});
        }
    }

    async createCredit(req, res) {
        try {
            const {user_id, credit_type, sum, period, percent} = req.body
            const account_id = uuid.v4();

            // create credit account
            const newAccount = await db.query('INSERT INTO accounts (account_id, user_id, expiration_date, type_id, balance) VALUES ($1, $2, now(), $3, $4) RETURNING *',
                [account_id, user_id, 2, sum]);

            // create credit
            const creditExpirationDate = calculateDateWithPeriod(period)
            const newCredit = await db.query('INSERT INTO credits (account_id, user_id, expiration_date, type_id, creation_date, debt, percent, sum, period) ' +
                'VALUES ($1, $2, $3, $4, now(), $5, $6, $7, $8) RETURNING *', [account_id, user_id, creditExpirationDate, credit_type, sum, percent, sum, period])

        }
        catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async payCredit(req, res) {
        const {credit_account_id, principal_payment, total_payment, sender_account_id} = req.body

        await db.query('UPDATE credits SET debt = debt - $1, last_payment = now() WHERE account_id = $2', [principal_payment, credit_account_id])
        await db.query('UPDATE accounts SET balance = balance - $1 WHERE account_id = $2', [total_payment, sender_account_id]);
    }
}

module.exports = new CreditController()