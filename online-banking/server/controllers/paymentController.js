const db = require("../db");

class PaymentController {
    async createPayment(req, res) {
        try {
            const {sender_account_id, receiver_account_id, transfer_amount} = req.body;

            const newPayment = await db.query(
                'INSERT INTO transactions_histories (sender_account_id, receiver_account_id, transfer_amount) ' +
                'VALUES ($1, $2, $3) RETURNING *',
                [sender_account_id, receiver_account_id, transfer_amount]
            );

            await db.query(
                'UPDATE accounts SET balance = balance - $1 WHERE account_id = $2',
                [transfer_amount, sender_account_id]
            );

            await db.query(
                'UPDATE accounts SET balance = balance + $1 WHERE account_id = $2',
                [transfer_amount, receiver_account_id]
            );

            res.json(newPayment.rows);
        } catch (error) {
            // console.error('Error creating payment:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getAllUserPayments(req, res) {
        try {
            const user_id = req.params.id;

            const payments = await db.query(`
            SELECT th.*
            FROM transactions_histories th
            JOIN accounts a ON th.sender_account_id = a.account_id
            WHERE a.user_id = $1
            ORDER BY th.transaction_date DESC;
        `, [user_id]);

            return res.json(payments.rows);
        } catch (error) {
            // console.error('Error fetching user payments:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = new PaymentController()