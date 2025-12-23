import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { usePosts } from '../context/PostsContext';
import { useUser } from '../context/UserContext';
import PostCard from '../components/PostCard';
import './Search.css';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);
  const { posts, likePost } = usePosts();
  const { blockedUsers } = useUser();

  // Sync search input with URL query parameter
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  // Mock users data - in real app, this would come from API
  const allUsers = [
    { id: 1, username: 'johndoe', bio: 'Software developer passionate about building amazing things!' },
    { id: 2, username: 'janedoe', bio: 'Designer and creative thinker. Always exploring new ideas.' },
    { id: 3, username: 'bobsmith', bio: 'Photographer capturing moments one frame at a time 📸' },
    { id: 4, username: 'alicejones', bio: 'Travel enthusiast | Food lover | Adventure seeker 🌍' },
    { id: 5, username: 'charliebrown', bio: 'Bookworm 📚 | Coffee addict ☕ | Night owl 🦉' },
    { id: 6, username: 'dianawhite', bio: 'Fitness enthusiast | Yoga instructor | Wellness advocate 🧘‍♀️' }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  // Filter out blocked users
  const availableUsers = useMemo(() => {
    if (!blockedUsers || blockedUsers.length === 0) return allUsers;
    return allUsers.filter(user => !blockedUsers.includes(user.id));
  }, [blockedUsers]);

  // Search users
  const searchUsers = useMemo(() => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    return availableUsers.filter(user => 
      user.username.toLowerCase().includes(lowerQuery) ||
      (user.bio && user.bio.toLowerCase().includes(lowerQuery))
    );
  }, [query, availableUsers]);

  // Search posts
  const searchPosts = useMemo(() => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    return posts.filter(post => {
      // Filter out blocked users' posts
      if (blockedUsers && blockedUsers.includes(post.user?.id)) return false;
      if (post.sharedBy && blockedUsers && blockedUsers.includes(post.sharedBy.id)) return false;
      
      // Search in post text
      if (post.text && post.text.toLowerCase().includes(lowerQuery)) return true;
      // Search in username
      if (post.user?.username && post.user.username.toLowerCase().includes(lowerQuery)) return true;
      return false;
    });
  }, [query, posts, blockedUsers]);

  return (
    <div className="search-container">
      <div className="search-header">
        <h1>Search</h1>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search for users or posts..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="search-page-input"
          />
          <button type="submit" className="search-submit-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </button>
        </form>
      </div>

      {query.trim() ? (
        <div className="search-results">
          {/* Users Results */}
          {searchUsers.length > 0 && (
            <div className="search-section">
              <h2 className="search-section-title">Users</h2>
              <div className="search-users-list">
                {searchUsers.map(user => (
                  <Link 
                    key={user.id} 
                    to={`/profile/${user.id}`}
                    className="search-user-item"
                  >
                    <div className="search-user-avatar">
                      {user.username[0].toUpperCase()}
                    </div>
                    <div className="search-user-info">
                      <div className="search-user-username">{user.username}</div>
                      {user.bio && (
                        <div className="search-user-bio">{user.bio}</div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Posts Results */}
          {searchPosts.length > 0 && (
            <div className="search-section">
              <h2 className="search-section-title">Posts</h2>
              <div className="search-posts-list">
                {searchPosts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post}
                    onLike={likePost}
                    onShare={(postId) => {
                      // Handle share
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {searchUsers.length === 0 && searchPosts.length === 0 && (
            <div className="search-no-results">
              <p>No results found for "{query}"</p>
              <p className="search-no-results-hint">Try searching for usernames or post content</p>
            </div>
          )}
        </div>
      ) : (
        <div className="search-empty">
          <p>Enter a search query to find users and posts</p>
        </div>
      )}
    </div>
  );
};

export default Search;

