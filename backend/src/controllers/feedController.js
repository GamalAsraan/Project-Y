const { pool } = require('../db');

// Fisher-Yates Shuffle
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const getHybridFeed = async (req, res) => {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 20;
    // Cursor Pagination: Use cursor (timestamp) instead of offset
    const cursor = req.query.cursor ? new Date(req.query.cursor) : new Date();

    try {
        // 1. Check if user follows anyone
        const followsCheck = await pool.query(
            'SELECT COUNT(*) FROM Follows WHERE FollowerUserID = $1',
            [userId]
        );
        const followCount = parseInt(followsCheck.rows[0].count);

        if (followCount === 0) {
            // CASE A: COLD START (Interests Only) - Cursor Pagination
            const query = `
        SELECT DISTINCT P.PostID, P.ContentBody, P.CreatedAt, U.UsernameUnique, Pr.DisplayName, Pr.AvatarURL, 
               PC.LikeCount, PC.CommentCount, PC.RepostCount, 'Interest' as SourceType
        FROM Posts P
        JOIN Users U ON P.UserID = U.UserID
        JOIN Profiles Pr ON U.UserID = Pr.UserID
        JOIN Post_Counters PC ON P.PostID = PC.PostID
        JOIN Post_Hashtags PH ON P.PostID = PH.PostID
        JOIN Hashtags H ON PH.HashtagID = H.HashtagID
        JOIN Interests I ON I.InterestName = H.TagName
        JOIN User_Interests UI ON UI.InterestID = I.InterestID
        WHERE UI.UserID = $1
        AND P.CreatedAt < $2
        ORDER BY P.CreatedAt DESC
        LIMIT $3
      `;
            const result = await pool.query(query, [userId, cursor, limit]);
            
            // Get next cursor (timestamp of last post)
            const nextCursor = result.rows.length > 0 
                ? result.rows[result.rows.length - 1].createdat 
                : null;
            
            return res.json({
                posts: result.rows,
                nextCursor,
                hasMore: result.rows.length === limit
            });

        } else {
            // CASE B: HYBRID FEED (80% Friends, 20% Interests) - Cursor Pagination

            const friendsLimit = Math.floor(limit * 0.8); // 16
            const interestsLimit = limit - friendsLimit;  // 4

            // Query 1: Friends (Sorted by Time) - Cursor Pagination
            const friendsQuery = `
        SELECT P.PostID, P.ContentBody, P.CreatedAt, U.UsernameUnique, Pr.DisplayName, Pr.AvatarURL, 
               PC.LikeCount, PC.CommentCount, PC.RepostCount, 'Followed' as SourceType
        FROM Posts P
        JOIN Users U ON P.UserID = U.UserID
        JOIN Profiles Pr ON U.UserID = Pr.UserID
        JOIN Post_Counters PC ON P.PostID = PC.PostID
        JOIN Follows F ON P.UserID = F.FollowingUserID
        WHERE F.FollowerUserID = $1
        AND P.CreatedAt < $2
        ORDER BY P.CreatedAt DESC
        LIMIT $3
      `;

            // Query 2: Interests (Sorted by Popularity/Time) - Cursor Pagination
            const interestsQuery = `
        SELECT DISTINCT P.PostID, P.ContentBody, P.CreatedAt, U.UsernameUnique, Pr.DisplayName, Pr.AvatarURL, 
               PC.LikeCount, PC.CommentCount, PC.RepostCount, 'Interest' as SourceType
        FROM Posts P
        JOIN Users U ON P.UserID = U.UserID
        JOIN Profiles Pr ON U.UserID = Pr.UserID
        JOIN Post_Counters PC ON P.PostID = PC.PostID
        JOIN Post_Hashtags PH ON P.PostID = PH.PostID
        JOIN Hashtags H ON PH.HashtagID = H.HashtagID
        JOIN Interests I ON I.InterestName = H.TagName
        JOIN User_Interests UI ON UI.InterestID = I.InterestID
        WHERE UI.UserID = $1
        AND P.UserID NOT IN (SELECT FollowingUserID FROM Follows WHERE FollowerUserID = $1) -- Avoid duplicates
        AND P.CreatedAt < $2
        ORDER BY PC.LikeCount DESC, P.CreatedAt DESC
        LIMIT $3
      `;

            // Execute in parallel
            const [friendsPosts, interestPosts] = await Promise.all([
                pool.query(friendsQuery, [userId, cursor, friendsLimit]),
                pool.query(interestsQuery, [userId, cursor, interestsLimit])
            ]);

            // Merge and Shuffle
            const combined = [...friendsPosts.rows, ...interestPosts.rows];
            const shuffled = shuffleArray(combined);

            // Get next cursor (timestamp of last post)
            const nextCursor = shuffled.length > 0 
                ? shuffled[shuffled.length - 1].createdat 
                : null;

            return res.json({
                posts: shuffled,
                nextCursor,
                hasMore: shuffled.length === limit
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch feed' });
    }
};

module.exports = { getHybridFeed };
