const { pool } = require('../db');
const multer = require('multer');
const path = require('path');

// Multer Setup (Disk Storage for MVP)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const getProfile = async (req, res) => {
    const { userId } = req.params;
    const viewerId = req.user ? req.user.userId : null;

    try {
        // Optimized query with is_following and is_followed_by boolean columns
        const query = `
      SELECT 
          U.UserID,
          U.UsernameUnique,
          P.DisplayName,
          P.Bio,
          P.AvatarURL,
          P.HeaderURL,
          (SELECT COUNT(*) FROM Follows WHERE FollowingUserID = U.UserID) AS FollowersCount,
          (SELECT COUNT(*) FROM Follows WHERE FollowerUserID = U.UserID) AS FollowingCount,
          CASE WHEN F_MeToThem.FollowID IS NOT NULL THEN true ELSE false END AS is_following,
          CASE WHEN F_ThemToMe.FollowID IS NOT NULL THEN true ELSE false END AS is_followed_by,
          CASE
              WHEN F_MeToThem.FollowID IS NOT NULL AND F_ThemToMe.FollowID IS NOT NULL THEN 'Following'
              WHEN F_MeToThem.FollowID IS NOT NULL THEN 'Following'
              WHEN F_ThemToMe.FollowID IS NOT NULL THEN 'Follow Back'
              WHEN B_MeToThem.BlockID IS NOT NULL THEN 'Blocked'
              ELSE 'Follow'
          END AS RelationshipStatus
      FROM Users U
      JOIN Profiles P ON U.UserID = P.UserID
      LEFT JOIN Follows F_MeToThem ON F_MeToThem.FollowerUserID = $1 AND F_MeToThem.FollowingUserID = U.UserID
      LEFT JOIN Follows F_ThemToMe ON F_ThemToMe.FollowerUserID = U.UserID AND F_ThemToMe.FollowingUserID = $1
      LEFT JOIN User_Blocks B_MeToThem ON B_MeToThem.BlockerUserID = $1 AND B_MeToThem.BlockedUserID = U.UserID
      WHERE U.UserID = $2;
    `;

        const result = await pool.query(query, [viewerId || 0, userId]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

// Update Profile with File Upload
const updateProfile = [
    upload.single('avatar'), // Expect field name 'avatar'
    async (req, res) => {
        const userId = req.user.userId;
        const { bio, displayName } = req.body;
        let avatarUrl = req.body.avatarUrl; // Allow URL if not uploading file

        if (req.file) {
            // In a real app, upload to S3/Cloudinary here and get URL
            avatarUrl = `/uploads/${req.file.filename}`;
        }

        try {
            await pool.query(
                'UPDATE Profiles SET Bio = COALESCE($1, Bio), AvatarURL = COALESCE($2, AvatarURL), DisplayName = COALESCE($3, DisplayName) WHERE UserID = $4',
                [bio, avatarUrl, displayName, userId]
            );
            res.json({ message: 'Profile updated successfully', avatarUrl });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to update profile' });
        }
    }
];

const followUser = async (req, res) => {
    const followerId = req.user.userId;
    const { userId: followingId } = req.params;

    // Self-follow prevention
    if (followerId === parseInt(followingId)) {
        return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    try {
        // Check if user exists
        const userCheck = await pool.query('SELECT UserID FROM Users WHERE UserID = $1', [followingId]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if already following
        const existingFollow = await pool.query(
            'SELECT FollowID FROM Follows WHERE FollowerUserID = $1 AND FollowingUserID = $2',
            [followerId, followingId]
        );

        if (existingFollow.rows.length > 0) {
            // Unfollow
            await pool.query(
                'DELETE FROM Follows WHERE FollowerUserID = $1 AND FollowingUserID = $2',
                [followerId, followingId]
            );
            return res.json({ following: false, message: 'Unfollowed successfully' });
        } else {
            // Follow
            await pool.query(
                'INSERT INTO Follows (FollowerUserID, FollowingUserID) VALUES ($1, $2)',
                [followerId, followingId]
            );
            return res.json({ following: true, message: 'Followed successfully' });
        }
    } catch (error) {
        console.error('Follow error:', error);
        // Handle unique constraint violation gracefully
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Already following this user' });
        }
        res.status(500).json({ error: 'Failed to follow/unfollow user' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    followUser
};
