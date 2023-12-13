const uuid = require('uuid')
const db = require("../db");

class AccountController {
    // async createAccount(req, res) {
    //     const account_id = uuid.v4()
    //     const {user_id, type_id} = req.body
    //     const newAccount = await db.query('INSERT INTO accounts (account_id, user_id, expiration_date, type_id) VALUES ($1, $2, now(), $3) RETURNING *',
    //         [account_id, user_id, type_id])
    //     return res.json(newAccount.rows)
    // }

    async createAccount(req, res) {
        try {
            const account_id = uuid.v4();
            const { user_id, type_id } = req.body;

            const newAccount = await db.query('INSERT INTO accounts (account_id, user_id, expiration_date, type_id) VALUES ($1, $2, now(), $3) RETURNING *',
                [account_id, user_id, type_id]);

            return res.json(newAccount.rows);
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // async getAllAccounts(req, res) {
    //     const user_id = req.params.userid
    //     const accounts = await db.query(`SELECT * FROM accounts WHERE user_id = ${user_id}`)
    //     return res.json(accounts.rows)
    // }

    async getAllAccounts(req, res) {
        try {
            const user_id = req.params.userid;
            const accounts = await db.query('SELECT * FROM accounts WHERE user_id = $1', [user_id]);
            return res.json(accounts.rows);
        } catch (error) {
            // console.error('Error fetching accounts:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getOneAccount(req, res) {
        try {
            const accountId = req.params.id;
            const account = await db.query(`SELECT user_id, balance FROM accounts WHERE accounts.account_id = '${accountId}'`);

            if (account.rows.length > 0) {
                res.json(account.rows[0]);
            } else {
                res.status(404).json({error: 'Account not found'});
            }
        } catch (error) {
            // console.error('Error fetching account:', error.message);
            res.status(500).json({error: 'Internal Server Error'});
        }
    }


}

module.exports = new AccountController()