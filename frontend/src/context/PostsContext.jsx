import { createContext, useContext, useState, useEffect } from 'react';
import { getPosts, createPost } from '../services/posts';

const PostsContext = createContext();

export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts();
        // Map backend data to frontend format if necessary
        const formattedPosts = data.map(post => ({
          id: post.postid,
          user: {
            id: post.userid,
            username: post.usernameunique || 'Unknown', // Fallback
            avatar: post.avatarurl || null,
            displayName: post.displayname
          },
          text: post.contentbody,
          image: post.imageurl,
          timestamp: post.createdat,
          likes: post.likecount || 0,
          reposts: post.repostcount || 0,
          commentCount: post.commentcount || 0,
          comments: [], // Initialize empty, fetch on demand
          liked: false // TODO: Check if liked by current user
        }));
        setPosts(formattedPosts);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const addPost = async (postData) => {
    try {
      const rawPost = await createPost(postData.text, postData.image);

      const newPost = {
        id: rawPost.postid,
        user: {
          id: rawPost.userid,
          username: rawPost.usernameunique || 'Unknown',
          avatar: rawPost.avatarurl || null,
          displayName: rawPost.displayname
        },
        text: rawPost.contentbody,
        image: rawPost.imageurl,
        timestamp: rawPost.createdat,
        likes: rawPost.likecount || 0,
        reposts: rawPost.repostcount || 0,
        commentCount: rawPost.commentcount || 0,
        comments: [],
        liked: false
      };

      setPosts((prev) => [newPost, ...prev]);
    } catch (err) {
      console.error(err);
      alert('Error creating post');
    }
  };


  const sharePost = (originalPost, sharingUser) => {
    // Create a shared post (repost) - keep original post data but mark as shared
    const sharedPost = {
      id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
      user: originalPost.user, // Original poster
      text: originalPost.text,
      image: originalPost.image,
      sharedBy: {
        id: sharingUser.id,
        username: sharingUser.username,
        avatar: sharingUser.avatar
      },
      timestamp: new Date().toISOString(),
      // Reset likes/comments for the shared post (fresh share)
      likes: 0,
      liked: false,
      comments: [],
      // Keep reference to original post ID for tracking
      originalPostId: originalPost.id
    };
    setPosts([sharedPost, ...posts]);
    return sharedPost;
  };

  const updatePost = (postId, updates) => {
    setPosts(posts.map(post =>
      post.id === postId ? { ...post, ...updates } : post
    ));
  };

  const likePost = (postId, isLiked) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? {
          ...post,
          liked: isLiked,
          likes: isLiked ? (post.likes || 0) + 1 : Math.max(0, (post.likes || 0) - 1)
        }
        : post
    ));
  };

  const addComment = (postId, comment) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? {
          ...post,
          commentCount: (post.commentCount || 0) + 1,
          comments: [...(post.comments || []), comment]
        }
        : post
    ));
  };

  return (
    <PostsContext.Provider value={{
      posts,
      loading,
      addPost,
      updatePost,
      likePost,
      addComment,
      sharePost
    }}>
      {children}
    </PostsContext.Provider>
  );
};

export const usePosts = () => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error('usePosts must be used within PostsProvider');
  }
  return context;
};

