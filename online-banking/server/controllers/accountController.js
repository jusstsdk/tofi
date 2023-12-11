const uuid = require('uuid')
const db = require("../db");

class AccountController {
    async createAccount(req, res) {
        const account_id = uuid.v4()
        const {user_id, type_id} = req.body
        // console.log(user_id, expiration_date, type_id)
        const newAccount = await db.query('INSERT INTO accounts (account_id, user_id, expiration_date, type_id) VALUES ($1, $2, now(), $3) RETURNING *',
            [account_id, user_id, type_id])
        return res.json(newAccount.rows)
    }

    async getAllAccounts(req, res) {
        const user_id = req.params.userid
        const accounts = await db.query(`SELECT * FROM accounts WHERE user_id = ${user_id}`)
        return res.json(accounts.rows)
    }

    async getOneAccount(req, res) {
        const accountId = req.params.id
        // console.log(accountId)
        const account = await db.query(`SELECT user_id, balance FROM accounts WHERE accounts.account_id = '${accountId}'`)

        if (account.rows.length > 0) {
            res.json(account.rows[0]);
        } else {
            // Отправка статуса 404 и сообщения о том, что пользователь не найден
            res.status(404).json({error: 'Account not found'});
        }
    }

}

module.exports = new AccountController()