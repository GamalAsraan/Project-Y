import { createContext, useContext, useState, useEffect } from 'react';

const PostsContext = createContext();

export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const res = await fetch('http://localhost:3000/api/posts/feed', { headers });
        if (!res.ok) throw new Error('Failed to fetch posts');

        const data = await res.json();
        setPosts(data.posts);
      } catch (err) {
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const addPost = (newPost) => {
    const postWithId = {
      ...newPost,
      id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1
    };
    setPosts([postWithId, ...posts]);
  };

  const sharePost = (originalPost, sharingUser) => {
    const sharedPost = {
      id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
      user: originalPost.user,
      text: originalPost.text,
      image: originalPost.image,
      sharedBy: {
        id: sharingUser.id,
        username: sharingUser.username,
        avatar: sharingUser.avatar
      },
      timestamp: new Date().toISOString(),
      likes: 0,
      liked: false,
      comments: [],
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
