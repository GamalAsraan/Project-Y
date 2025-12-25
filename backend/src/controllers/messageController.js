const { pool } = require('../db');

// Get all conversations for the current user
const getConversations = async (req, res) => {
    const userId = req.user.userId;

    try {
        const query = `
            SELECT 
                C.ConversationID,
                U.UserID,
                U.UsernameUnique,
                P.DisplayName,
                P.AvatarURL,
                M.MessageBody AS LastMessage,
                M.SentAt AS LastMessageTime,
                (SELECT COUNT(*) 
                 FROM Messages Msg 
                 WHERE Msg.ConversationID = C.ConversationID 
                 AND Msg.SenderUserID != $1 
                 AND Msg.SentAt > COALESCE((
                    SELECT SentAt FROM Messages 
                    WHERE ConversationID = C.ConversationID 
                    AND SenderUserID = $1 
                    ORDER BY SentAt DESC LIMIT 1
                 ), '1970-01-01')
                ) AS UnreadCount -- Simplified unread logic for now
            FROM Conversations C
            JOIN Conversation_Participants CP ON C.ConversationID = CP.ConversationID
            JOIN Users U ON CP.UserID = U.UserID
            JOIN Profiles P ON U.UserID = P.UserID
            LEFT JOIN Messages M ON M.ConversationID = C.ConversationID
            WHERE C.ConversationID IN (
                SELECT ConversationID FROM Conversation_Participants WHERE UserID = $1
            )
            AND CP.UserID != $1 -- Get the OTHER participant
            AND M.MessageID = (
                SELECT MAX(MessageID) FROM Messages WHERE ConversationID = C.ConversationID
            )
            ORDER BY M.SentAt DESC;
        `;

        const result = await pool.query(query, [userId]);

        // Format for frontend
        const conversations = result.rows.map(row => ({
            id: row.conversationid,
            user: {
                id: row.userid,
                username: row.usernameunique,
                displayName: row.displayname,
                avatar: row.avatarurl
            },
            lastMessage: row.lastmessage,
            timestamp: row.lastmessagetime,
            unread: parseInt(row.unreadcount) || 0
        }));

        res.json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
};

// Get messages for a specific conversation
const getMessages = async (req, res) => {
    const userId = req.user.userId;
    const { conversationId } = req.params;

    try {
        // Verify participation
        const participantCheck = await pool.query(
            'SELECT 1 FROM Conversation_Participants WHERE ConversationID = $1 AND UserID = $2',
            [conversationId, userId]
        );

        if (participantCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Not a participant in this conversation' });
        }

        const query = `
            SELECT 
                M.MessageID,
                M.MessageBody,
                M.SentAt,
                M.SenderUserID,
                U.UsernameUnique
            FROM Messages M
            JOIN Users U ON M.SenderUserID = U.UserID
            WHERE M.ConversationID = $1
            ORDER BY M.SentAt ASC;
        `;

        const result = await pool.query(query, [conversationId]);

        const messages = result.rows.map(row => ({
            id: row.messageid,
            text: row.messagebody,
            timestamp: row.sentat,
            senderId: row.senderuserid,
            senderUsername: row.usernameunique
        }));

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

// Send a message
const sendMessage = async (req, res) => {
    const senderId = req.user.userId;
    const { conversationId, text } = req.body;

    if (!text || !text.trim()) {
        return res.status(400).json({ error: 'Message text is required' });
    }

    try {
        // Verify participation
        const participantCheck = await pool.query(
            'SELECT 1 FROM Conversation_Participants WHERE ConversationID = $1 AND UserID = $2',
            [conversationId, senderId]
        );

        if (participantCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Not a participant in this conversation' });
        }

        const result = await pool.query(
            'INSERT INTO Messages (ConversationID, SenderUserID, MessageBody) VALUES ($1, $2, $3) RETURNING *',
            [conversationId, senderId, text]
        );

        const newMessage = result.rows[0];

        // Fetch sender details for response
        const userRes = await pool.query('SELECT UsernameUnique FROM Users WHERE UserID = $1', [senderId]);

        res.json({
            id: newMessage.messageid,
            text: newMessage.messagebody,
            timestamp: newMessage.sentat,
            senderId: newMessage.senderuserid,
            senderUsername: userRes.rows[0].usernameunique
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

// Start or get existing conversation with a user
const startConversation = async (req, res) => {
    const userId = req.user.userId;
    const { targetUserId } = req.body;

    if (userId === parseInt(targetUserId)) {
        return res.status(400).json({ error: 'Cannot message yourself' });
    }

    try {
        // Check if conversation already exists
        // We need to find a conversation where both users are participants
        const query = `
            SELECT C.ConversationID 
            FROM Conversations C
            JOIN Conversation_Participants CP1 ON C.ConversationID = CP1.ConversationID
            JOIN Conversation_Participants CP2 ON C.ConversationID = CP2.ConversationID
            WHERE CP1.UserID = $1 AND CP2.UserID = $2
            LIMIT 1;
        `;

        const existing = await pool.query(query, [userId, targetUserId]);

        if (existing.rows.length > 0) {
            return res.json({ conversationId: existing.rows[0].conversationid });
        }

        // Create new conversation
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const convRes = await client.query('INSERT INTO Conversations DEFAULT VALUES RETURNING ConversationID');
            const conversationId = convRes.rows[0].conversationid;

            await client.query(
                'INSERT INTO Conversation_Participants (ConversationID, UserID) VALUES ($1, $2), ($1, $3)',
                [conversationId, userId, targetUserId]
            );

            await client.query('COMMIT');
            res.json({ conversationId });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error starting conversation:', error);
        res.status(500).json({ error: 'Failed to start conversation' });
    }
};

module.exports = {
    getConversations,
    getMessages,
    sendMessage,
    startConversation
};
