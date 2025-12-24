import React from 'react';
import './PostCard.css';
import { FaHeart, FaRegHeart, FaComment, FaRetweet, FaShare } from 'react-icons/fa';

const PostCard = ({ post }) => {
  const isRepost = !!post.original_post_id;
  // If it's a repost, we might want to display the original post content if available.
  // For now, we assume 'post' contains the relevant content to display.

  return (
    <div className="post-card">
      {isRepost && (
        <div className="repost-header">
          <FaRetweet /> Reposted by {post.username}
        </div>
      )}

      <div className="post-header">
        <img src={post.avatar_url || 'https://via.placeholder.com/50'} alt="Avatar" className="avatar" />
        <div className="user-info">
          <span className="name">{post.username}</span>
          <span className="username">@{post.username}</span>
          <span className="time">{new Date(post.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="post-content">
        {post.content && <p>{post.content}</p>}
        {post.media_url && (
          <div className="media-container">
            {post.media_type === 'IMAGE' ? (
              <img src={post.media_url} alt="Post media" />
            ) : (
              <video src={post.media_url} controls />
            )}
          </div>
        )}
      </div>

      <div className="post-actions">
        <button className="action-btn">
          <FaComment /> {post.comments_count}
        </button>
        <button className="action-btn">
          <FaRetweet /> {post.reposts_count}
        </button>
        <button className="action-btn">
          {post.is_liked ? <FaHeart className="liked" /> : <FaRegHeart />} {post.likes_count}
        </button>
        <button className="action-btn">
          <FaShare />
        </button>
      </div>
    </div>
  );
};

export default PostCard;
