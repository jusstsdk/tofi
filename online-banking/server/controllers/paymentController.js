const db = require("../db");

class PaymentController {
    async createPayment(req, res) {
        const {sender_account_id, receiver_account_id, transfer_amount} = req.body
        const newPayment = await db.query('INSERT INTO transactions_histories (sender_account_id, receiver_account_id, transfer_amount)' +
            'VALUES ($1, $2, $3) RETURNING *', [sender_account_id, receiver_account_id, transfer_amount])

        await db.query(
            'UPDATE accounts SET balance = balance - $1 WHERE account_id = $2',
            [transfer_amount, sender_account_id]
        );

        await db.query(
            'UPDATE accounts SET balance = balance + $1 WHERE account_id = $2',
            [transfer_amount, receiver_account_id]
        );

    }

    async getAllUserPayments(req, res) {
        const user_id = req.params.id
        const payments = await db.query(`SELECT th.*
            FROM transactions_histories th
            JOIN accounts a ON th.sender_account_id = a.account_id
            WHERE a.user_id = ${user_id}
            ORDER BY th.transaction_date DESC;
        `)
        return res.json(payments.rows)
    }

    async getOne(req, res) {

    }
}

module.exports = new PaymentController()