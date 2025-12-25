-- =============================================
-- SEGMENT 1: IDENTITY & ACCESS CONTROL
-- =============================================

CREATE TABLE Account_Statuses (
    StatusID SERIAL PRIMARY KEY,
    StatusName VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO Account_Statuses (StatusName) VALUES ('Active'), ('Inactive'), ('Suspended');

CREATE TABLE Users (
    UserID SERIAL PRIMARY KEY,
    Email VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    UsernameUnique VARCHAR(50) NOT NULL UNIQUE,
    StatusID INT NOT NULL,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (StatusID) REFERENCES Account_Statuses(StatusID)
);

CREATE TABLE Profiles (
    ProfileID SERIAL PRIMARY KEY,
    UserID INT NOT NULL UNIQUE, -- Unique enforces 1:1 relationship
    DisplayName VARCHAR(100),
    Bio TEXT,
    AvatarURL VARCHAR(255),
    HeaderURL VARCHAR(255),
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- =============================================
-- SEGMENT 2: SOCIAL GRAPH & INTERACTIONS
-- =============================================

CREATE TABLE Follows (
    FollowID SERIAL PRIMARY KEY,
    FollowerUserID INT NOT NULL,
    FollowingUserID INT NOT NULL,
    FollowStatus VARCHAR(20) DEFAULT 'Active',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(FollowerUserID, FollowingUserID), -- Prevent duplicate follows
    FOREIGN KEY (FollowerUserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (FollowingUserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- Optimization: Composite index for quick "Am I following X?" checks and Feed generation
CREATE INDEX idx_follows_follower_following ON Follows(FollowerUserID, FollowingUserID);

CREATE TABLE User_Blocks (
    BlockID SERIAL PRIMARY KEY,
    BlockerUserID INT NOT NULL,
    BlockedUserID INT NOT NULL,
    BlockReasonCode VARCHAR(50),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (BlockerUserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (BlockedUserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- Optimization: Composite index for excluding blocked users from feeds
CREATE INDEX idx_blocks_blocker_blocked ON User_Blocks(BlockerUserID, BlockedUserID);

-- =============================================
-- SEGMENT 3: CONTENT (THE FEED)
-- =============================================

CREATE TABLE Posts (
    PostID SERIAL PRIMARY KEY,
    UserID INT NOT NULL,
    ContentBody TEXT,
    LanguageCode VARCHAR(10),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- Optimization: Index for fetching a specific user's posts (Profile View)
CREATE INDEX idx_posts_userid ON Posts(UserID);
-- Optimization: Index for sorting feed by time
CREATE INDEX idx_posts_createdat ON Posts(CreatedAt DESC);

CREATE TABLE Post_Counters (
    CounterID SERIAL PRIMARY KEY,
    PostID INT NOT NULL UNIQUE, -- 1:1 Relationship
    LikeCount INT DEFAULT 0,
    RepostCount INT DEFAULT 0,
    CommentCount INT DEFAULT 0,
    FOREIGN KEY (PostID) REFERENCES Posts(PostID) ON DELETE CASCADE
);

-- Optimization: Ensure Post_Counters is indexed by PostID (already unique, but good to be explicit about usage)
-- Note: UNIQUE constraint on PostID automatically creates an index.

CREATE TABLE Post_Likes (
    LikeID SERIAL PRIMARY KEY,
    UserID INT NOT NULL,
    PostID INT NOT NULL,
    InteractionType VARCHAR(20) DEFAULT 'Like',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(UserID, PostID), -- User can only like a post once
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (PostID) REFERENCES Posts(PostID) ON DELETE CASCADE
);

-- Optimization: Index for counting likes (though we use Post_Counters, this helps with integrity checks)
CREATE INDEX idx_post_likes_postid ON Post_Likes(PostID);
-- Optimization: Index for "Liked by me" checks
CREATE INDEX idx_post_likes_userid ON Post_Likes(UserID);

CREATE TABLE Comments (
    CommentID SERIAL PRIMARY KEY,
    UserID INT NOT NULL,
    PostID INT NOT NULL,
    CommentBody TEXT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (PostID) REFERENCES Posts(PostID) ON DELETE CASCADE
);

-- Optimization: Index for fetching comments for a post
CREATE INDEX idx_comments_postid ON Comments(PostID);

CREATE TABLE Shares_Reposts (
    RepostID SERIAL PRIMARY KEY,
    UserID INT NOT NULL,
    PostID INT NOT NULL,
    RepostQuote TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (PostID) REFERENCES Posts(PostID) ON DELETE CASCADE
);

-- Optimization: Index for fetching reposts
CREATE INDEX idx_reposts_postid ON Shares_Reposts(PostID);

-- =============================================
-- SEGMENT 4: DISCOVERY & METADATA
-- =============================================

CREATE TABLE Interests (
    InterestID SERIAL PRIMARY KEY,
    InterestName VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE User_Interests (
    UserInterestID SERIAL PRIMARY KEY,
    UserID INT NOT NULL,
    InterestID INT NOT NULL,
    InterestWeight INT DEFAULT 1,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (InterestID) REFERENCES Interests(InterestID) ON DELETE CASCADE
);

CREATE TABLE Hashtags (
    HashtagID SERIAL PRIMARY KEY,
    TagName VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Post_Hashtags (
    PostHashtagID SERIAL PRIMARY KEY,
    PostID INT NOT NULL,
    HashtagID INT NOT NULL,
    FOREIGN KEY (PostID) REFERENCES Posts(PostID) ON DELETE CASCADE,
    FOREIGN KEY (HashtagID) REFERENCES Hashtags(HashtagID) ON DELETE CASCADE
);

-- Optimization: Index for searching posts by hashtag
CREATE INDEX idx_post_hashtags_hashtagid ON Post_Hashtags(HashtagID);

-- =============================================
-- SEGMENT 5: MESSAGING
-- =============================================

CREATE TABLE Conversations (
    ConversationID SERIAL PRIMARY KEY,
    ConversationKey VARCHAR(255) UNIQUE -- Hash of UserIDs
);

CREATE TABLE Conversation_Participants (
    ParticipantID SERIAL PRIMARY KEY,
    ConversationID INT NOT NULL,
    UserID INT NOT NULL,
    FOREIGN KEY (ConversationID) REFERENCES Conversations(ConversationID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

CREATE TABLE Messages (
    MessageID SERIAL PRIMARY KEY,
    ConversationID INT NOT NULL,
    SenderUserID INT NOT NULL,
    MessageBody TEXT,
    SentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ConversationID) REFERENCES Conversations(ConversationID) ON DELETE CASCADE,
    FOREIGN KEY (SenderUserID) REFERENCES Users(UserID)
);

-- Optimization: Index for fetching chat history
CREATE INDEX idx_messages_conversationid_sentat ON Messages(ConversationID, SentAt);

-- =============================================
-- SEGMENT 6: NOTIFICATIONS
-- =============================================

CREATE TABLE Notification_Types (
    TypeID SERIAL PRIMARY KEY,
    TypeName VARCHAR(50) NOT NULL
);

CREATE TABLE Notifications (
    NotificationID SERIAL PRIMARY KEY,
    RecipientUserID INT NOT NULL,
    TypeID INT NOT NULL,
    TriggerUserID INT,
    TargetContentID INT, -- Logical Reference (Polymorphic)
    IsRead BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (RecipientUserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (TypeID) REFERENCES Notification_Types(TypeID),
    FOREIGN KEY (TriggerUserID) REFERENCES Users(UserID)
);

-- Optimization: Index for fetching user notifications
CREATE INDEX idx_notifications_recipient_createdat ON Notifications(RecipientUserID, CreatedAt DESC);
