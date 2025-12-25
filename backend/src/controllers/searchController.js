const { pool } = require('../db');

const search = async (req, res) => {
    const { q, type } = req.query; // type: 'users' or 'posts'

    if (!q) return res.status(400).json({ error: 'Query parameter "q" is required' });

    try {
        if (type === 'users') {
            // Search Users
            const query = `
        SELECT 
            U.UserID,
            U.UsernameUnique,
            P.DisplayName,
            P.AvatarURL,
            P.Bio
        FROM Users U
        JOIN Profiles P ON U.UserID = P.UserID
        WHERE U.UsernameUnique ILIKE $1 
           OR P.DisplayName ILIKE $1
        LIMIT 20
      `;
            const result = await pool.query(query, [`%${q}%`]);
            return res.json(result.rows);
        } else {
            // Search Posts (Default)
            const query = `
        SELECT 
            P.PostID,
            P.ContentBody,
            P.CreatedAt,
            U.UsernameUnique,
            PC.LikeCount
        FROM Posts P
        JOIN Users U ON P.UserID = U.UserID
        JOIN Post_Counters PC ON P.PostID = PC.PostID
        LEFT JOIN Post_Hashtags PH ON P.PostID = PH.PostID
        LEFT JOIN Hashtags H ON PH.HashtagID = H.HashtagID
        WHERE P.ContentBody ILIKE $1
           OR H.TagName ILIKE $1
        GROUP BY P.PostID, U.UsernameUnique, PC.LikeCount, P.CreatedAt
        ORDER BY PC.LikeCount DESC
        LIMIT 20
      `;
            const result = await pool.query(query, [`%${q}%`]);
            return res.json(result.rows);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Search failed' });
    }
};

module.exports = { search };
