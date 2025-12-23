import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { usePosts } from '../context/PostsContext';
import CommentItem from './CommentItem';
import './PostCard.css';

const PostCard = ({ post, onLike, onShare }) => {
  const { currentUser } = useUser();
  const { addComment, sharePost, posts: allPosts } = usePosts();
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState('');
  const comments = post.comments || [];
  const [showAllComments, setShowAllComments] = useState(false);
  const [liked, setLiked] = useState(post.liked || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);

  // Sync local state with post prop when it changes
  useEffect(() => {
    setLiked(post.liked || false);
    setLikeCount(post.likes || 0);
  }, [post.liked, post.likes]);

  const displayedComments = showAllComments 
    ? comments 
    : comments.slice(0, 5);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    const comment = {
      id: Date.now(),
      text: newComment,
      user: {
        id: currentUser.id,
        username: currentUser.username,
        avatar: currentUser.avatar
      },
      timestamp: new Date().toISOString()
    };

    addComment(post.id, comment);
    setNewComment('');
  };

  const toggleComments = () => {
    setIsExpanded(!isExpanded);
  };

  const handleLike = () => {
    if (!currentUser) {
      alert('Please log in to like posts');
      return;
    }
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1);
    if (onLike) {
      onLike(post.id, newLiked);
    }
  };

  const handleShare = () => {
    if (!currentUser) {
      alert('Please log in to share posts');
      return;
    }

    // Check if user already shared this exact post
    const alreadyShared = allPosts.some(p => 
      p.sharedBy?.id === currentUser.id && 
      (p.originalPostId === post.id || 
       (p.user?.id === post.user?.id && 
        p.text === post.text && 
        p.image === post.image &&
        !p.sharedBy))
    );

    if (alreadyShared) {
      alert('You have already shared this post');
      return;
    }

    // Create a shared post (repost)
    sharePost(post, currentUser);

    // Call the onShare callback if provided (for API integration)
    if (onShare) {
      onShare(post.id);
    }
  };

  return (
    <div className="post-card">
      {/* Repost Indicator */}
      {post.sharedBy && (
        <div className="repost-indicator">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.75 3.79l4.603 4.3-1.706 1.82L6 8.38v7.37c0 .97.784 1.75 1.75 1.75H13V20H7.75c-2.347 0-4.25-1.9-4.25-4.25V8.38L1.853 9.91.147 8.09l4.603-4.3zm11.5 2.71H11V4h5.25c2.347 0 4.25 1.9 4.25 4.25v7.37l1.647-1.53 1.706 1.82-4.603 4.3-4.603-4.3 1.706-1.82L18 15.62V8.25c0-.97-.784-1.75-1.75-1.75z"/>
          </svg>
          <span>{post.sharedBy.username} shared this</span>
        </div>
      )}

      {/* Header */}
      <div className="post-header">
        <Link to={`/profile/${post.user?.id || 1}`} className="post-avatar-link">
          <div className="post-avatar">
            {post.user?.avatar ? (
              <img src={post.user.avatar} alt={post.user.username} />
            ) : (
              <div className="post-avatar-placeholder">
                {post.user?.username?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>
        </Link>
        <div className="post-user-info">
          <Link to={`/profile/${post.user?.id || 1}`} className="post-username-link">
            <span className="post-username">{post.user?.username || 'Anonymous'}</span>
          </Link>
          <span className="post-timestamp">
            {post.timestamp ? new Date(post.timestamp).toLocaleDateString() : 'Just now'}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="post-body">
        {post.text && <p className="post-text">{post.text}</p>}
        {post.image && (
          <div className="post-image-container">
            <img src={post.image} alt="Post" className="post-image" />
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="post-actions">
        <button 
          className={`action-btn ${liked ? 'liked' : ''}`}
          onClick={handleLike}
          title="Like"
        >
          {liked ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          )}
          <span>{likeCount}</span>
        </button>

        <button 
          className="action-btn"
          onClick={toggleComments}
          title="Comment"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span>{comments.length}</span>
        </button>

        <button 
          className="action-btn"
          onClick={handleShare}
          title="Share"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>
          </svg>
        </button>
      </div>

      {/* Expanded Comment Section */}
      {isExpanded && (
        <div className="comment-section">
          {/* Comment Input */}
          {currentUser && (
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <div className="comment-input-wrapper">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="comment-input"
                />
                <button type="submit" className="comment-submit-btn" disabled={!newComment.trim()}>
                  Post
                </button>
              </div>
            </form>
          )}

          {/* Comment List */}
          {displayedComments.length > 0 ? (
            <div className="comment-list">
              {displayedComments.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          ) : (
            <div className="no-comments">No comments yet. Be the first to comment!</div>
          )}

          {/* Load More Button */}
          {comments.length > 5 && !showAllComments && (
            <button 
              className="load-more-comments"
              onClick={() => setShowAllComments(true)}
            >
              Load more comments ({comments.length - 5} more)
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;

