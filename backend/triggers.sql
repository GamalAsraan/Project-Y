-- =============================================
-- TRIGGERS FOR POST COUNTERS
-- =============================================

-- Ensure Post_Counters row exists when a Post is created
CREATE OR REPLACE FUNCTION create_post_counter()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO Post_Counters (PostID, LikeCount, RepostCount, CommentCount)
    VALUES (NEW.PostID, 0, 0, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_post_counter
AFTER INSERT ON Posts
FOR EACH ROW
EXECUTE FUNCTION create_post_counter();

-- 1. Like Counters
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE Post_Counters
        SET LikeCount = LikeCount + 1
        WHERE PostID = NEW.PostID;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE Post_Counters
        SET LikeCount = GREATEST(LikeCount - 1, 0)
        WHERE PostID = OLD.PostID;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_likes
AFTER INSERT OR DELETE ON Post_Likes
FOR EACH ROW
EXECUTE FUNCTION update_post_likes_count();

-- 2. Comment Counters
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE Post_Counters
        SET CommentCount = CommentCount + 1
        WHERE PostID = NEW.PostID;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE Post_Counters
        SET CommentCount = GREATEST(CommentCount - 1, 0)
        WHERE PostID = OLD.PostID;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_comments
AFTER INSERT OR DELETE ON Comments
FOR EACH ROW
EXECUTE FUNCTION update_post_comments_count();

-- 3. Repost Counters
CREATE OR REPLACE FUNCTION update_post_reposts_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE Post_Counters
        SET RepostCount = RepostCount + 1
        WHERE PostID = NEW.PostID;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE Post_Counters
        SET RepostCount = GREATEST(RepostCount - 1, 0)
        WHERE PostID = OLD.PostID;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_reposts
AFTER INSERT OR DELETE ON Shares_Reposts
FOR EACH ROW
EXECUTE FUNCTION update_post_reposts_count();
