-- =============================================
-- CORE SQL QUERIES
-- =============================================

-- ---------------------------------------------
-- QUERY 1: PROFILE VIEW & RELATIONSHIP STATUS
-- ---------------------------------------------
-- Fetch target user's profile and calculate relationship status relative to Viewer (e.g., UserID = 1)
-- :ViewerID = 1, :TargetUserID = 5

SELECT 
    U.UserID,
    U.UsernameUnique,
    P.DisplayName,
    P.Bio,
    P.AvatarURL,
    P.HeaderURL,
    (
        SELECT COUNT(*) FROM Follows WHERE FollowingUserID = U.UserID
    ) AS FollowersCount,
    (
        SELECT COUNT(*) FROM Follows WHERE FollowerUserID = U.UserID
    ) AS FollowingCount,
    CASE
        WHEN F_MeToThem.FollowID IS NOT NULL AND F_ThemToMe.FollowID IS NOT NULL THEN 'Following' -- Mutual (could be 'Friends' depending on UI)
        WHEN F_MeToThem.FollowID IS NOT NULL THEN 'Following'
        WHEN F_ThemToMe.FollowID IS NOT NULL THEN 'Follow Back'
        WHEN B_MeToThem.BlockID IS NOT NULL THEN 'Blocked'
        ELSE 'Follow'
    END AS RelationshipStatus
FROM Users U
JOIN Profiles P ON U.UserID = P.UserID
LEFT JOIN Follows F_MeToThem ON F_MeToThem.FollowerUserID = 1 AND F_MeToThem.FollowingUserID = U.UserID
LEFT JOIN Follows F_ThemToMe ON F_ThemToMe.FollowerUserID = U.UserID AND F_ThemToMe.FollowingUserID = 1
LEFT JOIN User_Blocks B_MeToThem ON B_MeToThem.BlockerUserID = 1 AND B_MeToThem.BlockedUserID = U.UserID
WHERE U.UserID = 5;


-- ---------------------------------------------
-- QUERY 2: EDIT PROFILE
-- ---------------------------------------------
-- Update Bio and AvatarURL
-- :UserID = 1

UPDATE Profiles
SET 
    Bio = 'New Bio Content',
    AvatarURL = 'https://new-avatar-url.com/image.jpg'
WHERE UserID = 1;


-- ---------------------------------------------
-- QUERY 3: HYBRID NEWS FEED (COLD START LOGIC)
-- ---------------------------------------------
-- Logic:
-- 1. Get posts from people I follow.
-- 2. IF I follow no one (or few), fill with posts matching my Interests.
-- 3. ALWAYS exclude posts from people I have blocked.
-- :ViewerID = 1, :Limit = 20, :Offset = 0

WITH BlockedUsers AS (
    SELECT BlockedUserID FROM User_Blocks WHERE BlockerUserID = 1
),
FollowedUsers AS (
    SELECT FollowingUserID FROM Follows WHERE FollowerUserID = 1
),
MyInterests AS (
    SELECT InterestID FROM User_Interests WHERE UserID = 1
)
SELECT 
    P.PostID,
    P.ContentBody,
    P.CreatedAt,
    U.UsernameUnique,
    Pr.DisplayName,
    Pr.AvatarURL,
    PC.LikeCount,
    PC.CommentCount,
    PC.RepostCount,
    'Followed' AS SourceType
FROM Posts P
JOIN Users U ON P.UserID = U.UserID
JOIN Profiles Pr ON U.UserID = Pr.UserID
JOIN Post_Counters PC ON P.PostID = PC.PostID
WHERE P.UserID IN (SELECT FollowingUserID FROM FollowedUsers)
  AND P.UserID NOT IN (SELECT BlockedUserID FROM BlockedUsers)

UNION ALL

SELECT 
    P.PostID,
    P.ContentBody,
    P.CreatedAt,
    U.UsernameUnique,
    Pr.DisplayName,
    Pr.AvatarURL,
    PC.LikeCount,
    PC.CommentCount,
    PC.RepostCount,
    'Interest' AS SourceType
FROM Posts P
JOIN Users U ON P.UserID = U.UserID
JOIN Profiles Pr ON U.UserID = Pr.UserID
JOIN Post_Counters PC ON P.PostID = PC.PostID
JOIN Post_Hashtags PH ON P.PostID = PH.PostID
JOIN Hashtags H ON PH.HashtagID = H.HashtagID
JOIN Interests I ON I.InterestName = H.TagName -- Assuming InterestName maps to Hashtag TagName
WHERE I.InterestID IN (SELECT InterestID FROM MyInterests)
  AND P.UserID NOT IN (SELECT BlockedUserID FROM BlockedUsers)
  -- Optimization: Avoid duplicates if a followed user posts about an interest
  AND P.PostID NOT IN (
      SELECT P2.PostID 
      FROM Posts P2 
      WHERE P2.UserID IN (SELECT FollowingUserID FROM FollowedUsers)
  )

ORDER BY CreatedAt DESC
LIMIT 20 OFFSET 0;


-- ---------------------------------------------
-- QUERY 4: POST DETAILS CARD
-- ---------------------------------------------
-- Fetch single post with aggregated counts and Repost context
-- :PostID = 101

SELECT 
    P.PostID,
    P.ContentBody,
    P.CreatedAt,
    U.UsernameUnique AS AuthorUsername,
    Pr.DisplayName AS AuthorName,
    Pr.AvatarURL AS AuthorAvatar,
    PC.LikeCount,
    PC.CommentCount,
    PC.RepostCount,
    -- Repost Context
    SR.RepostID,
    OriginalPoster.UsernameUnique AS RepostedByUsername
FROM Posts P
JOIN Users U ON P.UserID = U.UserID
JOIN Profiles Pr ON U.UserID = Pr.UserID
LEFT JOIN Post_Counters PC ON P.PostID = PC.PostID
LEFT JOIN Shares_Reposts SR ON P.PostID = SR.PostID -- Check if this post is a repost itself (simplified logic)
LEFT JOIN Users OriginalPoster ON SR.UserID = OriginalPoster.UserID
WHERE P.PostID = 101;


-- ---------------------------------------------
-- QUERY 5: NOTIFICATIONS
-- ---------------------------------------------
-- Fetch unread notifications
-- :UserID = 1

SELECT 
    N.NotificationID,
    NT.TypeName,
    TriggerUser.UsernameUnique AS TriggerUsername,
    TriggerProfile.AvatarURL AS TriggerAvatar,
    N.CreatedAt,
    N.IsRead
FROM Notifications N
JOIN Notification_Types NT ON N.TypeID = NT.TypeID
JOIN Users TriggerUser ON N.TriggerUserID = TriggerUser.UserID
JOIN Profiles TriggerProfile ON TriggerUser.UserID = TriggerProfile.UserID
WHERE N.RecipientUserID = 1
ORDER BY N.CreatedAt DESC
LIMIT 50;


-- ---------------------------------------------
-- QUERY 6: MESSAGING HISTORY
-- ---------------------------------------------
-- Fetch messages between two users
-- :ViewerID = 1, :OtherUserID = 5

SELECT 
    M.MessageID,
    M.SenderUserID,
    M.MessageBody,
    M.SentAt,
    SenderProfile.AvatarURL
FROM Messages M
JOIN Conversations C ON M.ConversationID = C.ConversationID
JOIN Conversation_Participants CP1 ON C.ConversationID = CP1.ConversationID
JOIN Conversation_Participants CP2 ON C.ConversationID = CP2.ConversationID
JOIN Profiles SenderProfile ON M.SenderUserID = SenderProfile.UserID
WHERE CP1.UserID = 1 
  AND CP2.UserID = 5
ORDER BY M.SentAt ASC
LIMIT 100;


-- ---------------------------------------------
-- QUERY 7: SEARCH (USERS & POSTS)
-- ---------------------------------------------

-- A. Search Users
-- :Query = 'john'
SELECT 
    U.UserID,
    U.UsernameUnique,
    P.DisplayName,
    P.AvatarURL,
    P.Bio
FROM Users U
JOIN Profiles P ON U.UserID = P.UserID
WHERE U.UsernameUnique ILIKE '%john%' 
   OR P.DisplayName ILIKE '%john%'
LIMIT 20;

-- B. Search Posts
-- :Query = 'tech'
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
WHERE P.ContentBody ILIKE '%tech%'
   OR H.TagName ILIKE '%tech%'
GROUP BY P.PostID, U.UsernameUnique, PC.LikeCount, P.CreatedAt -- Group to remove duplicates from joins
ORDER BY PC.LikeCount DESC -- Show popular results first
LIMIT 20;
