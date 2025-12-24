import { useState, useMemo } from 'react';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import { usePosts } from '../context/PostsContext';
import { useUser } from '../context/UserContext';
import './Feed.css';

const Feed = () => {
  const { posts, loading, addPost, likePost } = usePosts();
  const { blockedUsers } = useUser();
  const [showCreatePost, setShowCreatePost] = useState(false);

  // Filter out posts from blocked users
  const filteredPosts = useMemo(() => {
    if (!blockedUsers || blockedUsers.length === 0) return posts;
    
    return posts.filter(post => {
      // Filter out posts by blocked users
      if (blockedUsers.includes(post.user?.id)) return false;
      // Filter out posts shared by blocked users
      if (post.sharedBy && blockedUsers.includes(post.sharedBy.id)) return false;
      return true;
    });
  }, [posts, blockedUsers]);

  const handleNewPost = (newPost) => {
    addPost(newPost);
    setShowCreatePost(false);
  };

  const handleLike = (postId, isLiked) => {
    likePost(postId, isLiked);
  };

  const handleShare = (postId) => {
    // TODO: Replace with actual API call to track shares
    // The actual sharing is handled in PostCard component
    // This callback can be used to log/share analytics
    const post = posts.find(p => p.id === postId);
    if (post) {
      // Optional: Track share event for analytics
      console.log('Post shared:', postId);
    }
  };

  if (loading) {
    return (
      <div className="feed-container">
        <div className="feed-loading">Loading feed...</div>
      </div>
    );
  }

  return (
    <div className="feed-container">
      <div className="feed-header">
        <h1>Feed</h1>
        <button 
          className="feed-create-post-btn"
          onClick={() => setShowCreatePost(!showCreatePost)}
        >
          {showCreatePost ? 'Cancel' : '+ New Post'}
        </button>
      </div>
      
      {showCreatePost && (
        <CreatePost 
          onSubmit={handleNewPost}
          onCancel={() => setShowCreatePost(false)}
        />
      )}

      <div className="feed-posts">
        {filteredPosts.length === 0 ? (
          <div className="feed-empty">No posts yet. Be the first to post!</div>
        ) : (
          filteredPosts.map(post => (
            <PostCard 
              key={post.id} 
              post={post}
              onLike={handleLike}
              onShare={handleShare}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Feed;

