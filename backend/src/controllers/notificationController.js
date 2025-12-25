const { pool } = require('../db');

const getNotifications = async (req, res) => {
    const userId = req.user.userId;

    try {
        const query = `
            SELECT 
                N.NotificationID,
                N.CreatedAt,
                NT.TypeName,
                U.UsernameUnique AS TriggerUsername,
                P.AvatarURL AS TriggerAvatar,
                CASE 
                    WHEN NT.TypeName = 'Like' THEN 'liked your post'
                    WHEN NT.TypeName = 'Comment' THEN 'commented on your post'
                    WHEN NT.TypeName = 'Follow' THEN 'started following you'
                    WHEN NT.TypeName = 'Repost' THEN 'reposted your post'
                    ELSE 'interacted with you'
                END AS Message
            FROM Notifications N
            JOIN Notification_Types NT ON N.TypeID = NT.TypeID
            JOIN Users U ON N.TriggerUserID = U.UserID
            JOIN Profiles P ON U.UserID = P.UserID
            WHERE N.RecipientUserID = $1
            ORDER BY N.CreatedAt DESC
            LIMIT 50;
        `;

        const result = await pool.query(query, [userId]);

        const notifications = result.rows.map(row => ({
            id: row.notificationid,
            type: row.typename.toLowerCase(),
            message: `${row.triggerusername} ${row.message}`,
            timestamp: row.createdat,
            triggerUser: {
                username: row.triggerusername,
                avatar: row.triggeravatar
            }
        }));

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

module.exports = {
    getNotifications
};
