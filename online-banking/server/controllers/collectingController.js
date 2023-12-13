const db = require("../db");

class CollectingController {
    // async createCollecting(req, res) {
    //     const {name, sum, expiration_date, account, author_id, members} = req.body
    //     const newCollecting = await db.query('INSERT INTO collectings(name, sum, expiration_date, account, author_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    //         [name, sum, expiration_date, account, author_id])
    //
    //     const newCollectingId = newCollecting.rows[0].collecting_id
    //
    //     for (const member of members) {
    //         const newUser = await db.query('INSERT INTO collecting_members(user_id, collecting_id) VALUES ($1, $2)', [member.user_id, newCollectingId])
    //     }
    // }

    async createCollecting(req, res) {
        try {
            const { name, sum, expiration_date, account, author_id, members } = req.body;
            const newCollecting = await db.query('INSERT INTO collectings(name, sum, expiration_date, account, author_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [name, sum, expiration_date, account, author_id]);
            const newCollectingId = newCollecting.rows[0].collecting_id;

            for (const member of members) {
                await db.query('INSERT INTO collecting_members(user_id, collecting_id) VALUES ($1, $2)', [member.user_id, newCollectingId]);
            }

            return res.json({ success: true });
        } catch (error) {
            // console.error('Error creating collecting:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // async getAllUserCollectings(req, res) {
    //     const user_id = req.params.user_id;
    //     // console.log(user_id)
    //     const result = await db.query(`
    //         SELECT
    //             c.collecting_id,
    //             c.name,
    //             c.sum,
    //             c.expiration_date,
    //             COUNT(DISTINCT cm.user_id) AS members_count
    //         FROM
    //             collectings c
    //         JOIN
    //             collecting_members cm ON c.collecting_id = cm.collecting_id
    //         WHERE
    //             cm.user_id = $1 OR c.collecting_id IN (
    //                 SELECT collecting_id
    //                 FROM collecting_members
    //                 WHERE user_id = $1
    //             )
    //         GROUP BY
    //             c.collecting_id, c.name, c.sum, c.expiration_date
    //         ORDER BY
    //             c.collecting_id;
    //     `, [user_id]);
    //
    //     res.json(result.rows)
    // }

    async getAllUserCollectings(req, res) {
        try {
            const user_id = req.params.user_id;
            const result = await db.query(`
            SELECT
                c.collecting_id,
                c.name,
                c.sum,
                c.expiration_date,
                COUNT(DISTINCT cm.user_id) AS members_count
            FROM
                collectings c
            JOIN
                collecting_members cm ON c.collecting_id = cm.collecting_id
            WHERE
                cm.user_id = $1 OR c.collecting_id IN (
                    SELECT collecting_id
                    FROM collecting_members
                    WHERE user_id = $1
                )
            GROUP BY
                c.collecting_id, c.name, c.sum, c.expiration_date
            ORDER BY
                c.collecting_id;
        `, [user_id]);

            res.json(result.rows);
        } catch (error) {
            // console.error('Error fetching user collectings:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // async getOneCollecting(req, res) {
    //     const collecting_id = req.params.id
    //     const collecting = await db.query('SELECT name, sum, expiration_date, account, author_id FROM collectings WHERE collecting_id = $1', [collecting_id])
    //     const users = await db.query('SELECT user_id FROM collecting_members WHERE collecting_id = $1', [collecting_id])
    //
    //     const collectingInfo = {
    //         collecting: collecting.rows,
    //         users: users.rows
    //     }
    //
    //     res.json(collectingInfo)
    // }

    async getOneCollecting(req, res) {
        try {
            const collecting_id = req.params.id;
            const collecting = await db.query('SELECT name, sum, expiration_date, account, author_id FROM collectings WHERE collecting_id = $1', [collecting_id]);
            const users = await db.query('SELECT user_id FROM collecting_members WHERE collecting_id = $1', [collecting_id]);
            const collectingInfo = {
                collecting: collecting.rows,
                users: users.rows
            };
            res.json(collectingInfo);
        } catch (error) {
            // console.error('Error fetching collecting information:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = new CollectingController()