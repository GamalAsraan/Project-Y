import './CommentItem.css';

const CommentItem = ({ comment }) => {
  return (
    <div className="comment-item">
      <div className="comment-avatar">
        {comment.user?.avatar ? (
          <img src={comment.user.avatar} alt={comment.user.username} />
        ) : (
          <div className="comment-avatar-placeholder">
            {comment.user?.username?.[0]?.toUpperCase() || '?'}
          </div>
        )}
      </div>
      <div className="comment-content">
        <div className="comment-header">
          <span className="comment-username">{comment.user?.username || 'Anonymous'}</span>
        </div>
        <p className="comment-text">{comment.text}</p>
      </div>
    </div>
  );
};

export default CommentItem;

