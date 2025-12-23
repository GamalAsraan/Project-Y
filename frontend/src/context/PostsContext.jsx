import { createContext, useContext, useState, useEffect } from 'react';

const PostsContext = createContext();

export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching posts from database
    // TODO: Replace with actual API call
    const fetchPosts = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with actual API call
      const mockPosts = [
        {
          id: 1,
          user: {
            id: 1,
            username: 'johndoe',
            avatar: null
          },
          text: 'Just setting up my Project-Y! This is going to be amazing! 🚀',
          image: null,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          likes: 42,
          liked: false,
          comments: [
            {
              id: 1,
              text: 'Welcome! Looking forward to seeing your posts.',
              user: { id: 2, username: 'janedoe', avatar: null },
              timestamp: new Date(Date.now() - 3300000).toISOString()
            },
            {
              id: 2,
              text: 'Great to have you here!',
              user: { id: 3, username: 'bobsmith', avatar: null },
              timestamp: new Date(Date.now() - 3000000).toISOString()
            }
          ]
        },
        {
          id: 2,
          user: {
            id: 2,
            username: 'janedoe',
            avatar: null
          },
          text: 'Working on some exciting features for the platform. Stay tuned!',
          image: null,
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          likes: 28,
          liked: true,
          comments: []
        },
        {
          id: 3,
          sharedBy: {
            id: 3,
            username: 'bobsmith'
          },
          user: {
            id: 4,
            username: 'alicejones',
            avatar: null
          },
          text: 'Check out this amazing sunset! 🌅',
          image: null,
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          likes: 156,
          liked: false,
          comments: [
            {
              id: 3,
              text: 'Beautiful!',
              user: { id: 1, username: 'johndoe', avatar: null },
              timestamp: new Date(Date.now() - 10500000).toISOString()
            },
            {
              id: 4,
              text: 'Stunning view!',
              user: { id: 2, username: 'janedoe', avatar: null },
              timestamp: new Date(Date.now() - 10200000).toISOString()
            },
            {
              id: 5,
              text: 'Where was this taken?',
              user: { id: 5, username: 'charliebrown', avatar: null },
              timestamp: new Date(Date.now() - 9900000).toISOString()
            },
            {
              id: 6,
              text: 'Amazing colors!',
              user: { id: 6, username: 'dianawhite', avatar: null },
              timestamp: new Date(Date.now() - 9600000).toISOString()
            },
            {
              id: 7,
              text: 'Love it!',
              user: { id: 7, username: 'edwardlee', avatar: null },
              timestamp: new Date(Date.now() - 9300000).toISOString()
            },
            {
              id: 8,
              text: 'Perfect timing!',
              user: { id: 8, username: 'frankmiller', avatar: null },
              timestamp: new Date(Date.now() - 9000000).toISOString()
            }
          ]
        },
        {
          id: 4,
          user: {
            id: 5,
            username: 'charliebrown',
            avatar: null
          },
          text: 'Just finished reading an amazing book. Highly recommend!',
          image: null,
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          likes: 15,
          liked: false,
          comments: []
        },
        {
          id: 5,
          user: {
            id: 6,
            username: 'dianawhite',
            avatar: null
          },
          text: 'Coffee and code - the perfect combination ☕💻',
          image: null,
          timestamp: new Date(Date.now() - 18000000).toISOString(),
          likes: 89,
          liked: true,
          comments: [
            {
              id: 9,
              text: 'Same here!',
              user: { id: 1, username: 'johndoe', avatar: null },
              timestamp: new Date(Date.now() - 17700000).toISOString()
            }
          ]
        }
      ];

      setPosts(mockPosts);
      setLoading(false);
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

