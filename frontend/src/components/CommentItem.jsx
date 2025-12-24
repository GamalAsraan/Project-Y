import { Link } from 'react-router-dom';
import './CommentItem.css';

const CommentItem = ({ comment }) => {
  return (
    <div className="comment-item">
      <Link to={`/profile/${comment.user?.id || 1}`} className="comment-avatar-link">
        <div className="comment-avatar">
          {comment.user?.avatar ? (
            <img src={comment.user.avatar} alt={comment.user.username} />
          ) : (
            <div className="comment-avatar-placeholder">
              {comment.user?.username?.[0]?.toUpperCase() || '?'}
            </div>
          )}
        </div>
      </Link>
      <div className="comment-content">
        <div className="comment-header">
          <Link to={`/profile/${comment.user?.id || 1}`} className="comment-username-link">
            <span className="comment-username">{comment.user?.username || 'Anonymous'}</span>
          </Link>
        </div>
        <p className="comment-text">{comment.text}</p>
      </div>
    </div>
  );
};

export default CommentItem;

