import { useParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { usePosts } from '../context/PostsContext';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import { useState, useEffect, useMemo } from 'react';
import './Profile.css';

const Profile = () => {
  const { userId } = useParams();
  const { currentUser, updateProfile, blockUser, unblockUser, isUserBlocked } = useUser();
  const { posts, loading: postsLoading, likePost, addPost } = usePosts();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: '',
    birthDate: '',
    location: ''
  });

  // Check if viewing own profile
  const isOwnProfile = useMemo(() => {
    if (userId === 'me') return true;
    if (!currentUser || !profileUser) return false;
    return currentUser.id === profileUser.id;
  }, [userId, currentUser, profileUser]);

  // Get user-specific profile data
  const getUserProfileData = (id) => {
    const profiles = {
      1: {
        username: 'johndoe',
        bio: 'Software developer passionate about building amazing things!',
        birthDate: '1992-05-20',
        location: 'San Francisco, CA',
        followers: 1234,
        following: 567
      },
      2: {
        username: 'janedoe',
        bio: 'Designer and creative thinker. Always exploring new ideas.',
        birthDate: '1990-01-15',
        location: 'New York, NY',
        followers: 2345,
        following: 890
      },
      3: {
        username: 'bobsmith',
        bio: 'Photographer capturing moments one frame at a time 📸',
        birthDate: '1988-08-10',
        location: 'Los Angeles, CA',
        followers: 5678,
        following: 1234
      },
      4: {
        username: 'alicejones',
        bio: 'Travel enthusiast | Food lover | Adventure seeker 🌍',
        birthDate: '1995-03-22',
        location: 'Miami, FL',
        followers: 3456,
        following: 678
      },
      5: {
        username: 'charliebrown',
        bio: 'Bookworm 📚 | Coffee addict ☕ | Night owl 🦉',
        birthDate: '1993-11-05',
        location: 'Seattle, WA',
        followers: 1890,
        following: 456
      },
      6: {
        username: 'dianawhite',
        bio: 'Fitness enthusiast | Yoga instructor | Wellness advocate 🧘‍♀️',
        birthDate: '1991-07-18',
        location: 'Portland, OR',
        followers: 4123,
        following: 789
      }
    };

    return profiles[id] || profiles[1];
  };

  // Get user-specific posts
  const getUserPosts = (id) => {
    const userPostsData = {
      1: [
        {
          id: 101,
          user: { id: 1, username: 'johndoe', avatar: null },
          text: 'Just setting up my Project-Y! This is going to be amazing! 🚀',
          image: null,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          likes: 42,
          liked: false,
          comments: []
        },
        {
          id: 102,
          user: { id: 1, username: 'johndoe', avatar: null },
          text: 'Just deployed a new feature. The team worked incredibly hard on this one! 💪',
          image: null,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          likes: 78,
          liked: true,
          comments: []
        },
        {
          id: 103,
          user: { id: 1, username: 'johndoe', avatar: null },
          text: 'Late night coding session. Coffee is my best friend right now ☕',
          image: null,
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          likes: 56,
          liked: false,
          comments: []
        }
      ],
      2: [
        {
          id: 201,
          user: { id: 2, username: 'janedoe', avatar: null },
          text: 'Working on some exciting features for the platform. Stay tuned!',
          image: null,
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          likes: 28,
          liked: true,
          comments: []
        },
        {
          id: 202,
          user: { id: 2, username: 'janedoe', avatar: null },
          text: 'New design system is live! So proud of what we\'ve built 🎨',
          image: null,
          timestamp: new Date(Date.now() - 259200000).toISOString(),
          likes: 134,
          liked: false,
          comments: []
        },
        {
          id: 203,
          user: { id: 2, username: 'janedoe', avatar: null },
          text: 'Design inspiration can come from anywhere. Today it was a walk in the park 🌳',
          image: null,
          timestamp: new Date(Date.now() - 345600000).toISOString(),
          likes: 67,
          liked: true,
          comments: []
        }
      ],
      3: [
        {
          id: 301,
          user: { id: 3, username: 'bobsmith', avatar: null },
          text: 'Golden hour never disappoints. Nature\'s best lighting 🌅',
          image: null,
          timestamp: new Date(Date.now() - 432000000).toISOString(),
          likes: 234,
          liked: false,
          comments: []
        },
        {
          id: 302,
          user: { id: 3, username: 'bobsmith', avatar: null },
          text: 'Street photography is all about capturing authentic moments 📷',
          image: null,
          timestamp: new Date(Date.now() - 518400000).toISOString(),
          likes: 189,
          liked: true,
          comments: []
        },
        {
          id: 303,
          user: { id: 3, username: 'bobsmith', avatar: null },
          text: 'New camera gear arrived! Can\'t wait to test it out this weekend 🎥',
          image: null,
          timestamp: new Date(Date.now() - 604800000).toISOString(),
          likes: 145,
          liked: false,
          comments: []
        }
      ],
      4: [
        {
          id: 401,
          user: { id: 4, username: 'alicejones', avatar: null },
          text: 'Just landed in Tokyo! The food here is absolutely incredible 🍜',
          image: null,
          timestamp: new Date(Date.now() - 691200000).toISOString(),
          likes: 312,
          liked: false,
          comments: []
        },
        {
          id: 402,
          user: { id: 4, username: 'alicejones', avatar: null },
          text: 'Beach vibes in Bali 🌴 Life is good!',
          image: null,
          timestamp: new Date(Date.now() - 777600000).toISOString(),
          likes: 456,
          liked: true,
          comments: []
        },
        {
          id: 403,
          user: { id: 4, username: 'alicejones', avatar: null },
          text: 'Travel tip: Always try the local street food. Best meals I\'ve had! 🍲',
          image: null,
          timestamp: new Date(Date.now() - 864000000).toISOString(),
          likes: 278,
          liked: false,
          comments: []
        }
      ],
      5: [
        {
          id: 501,
          user: { id: 5, username: 'charliebrown', avatar: null },
          text: 'Just finished reading an amazing book. Highly recommend!',
          image: null,
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          likes: 15,
          liked: false,
          comments: []
        },
        {
          id: 502,
          user: { id: 5, username: 'charliebrown', avatar: null },
          text: 'Bookstore haul! My reading list just got a lot longer 📚',
          image: null,
          timestamp: new Date(Date.now() - 950400000).toISOString(),
          likes: 89,
          liked: true,
          comments: []
        },
        {
          id: 503,
          user: { id: 5, username: 'charliebrown', avatar: null },
          text: 'Nothing beats a rainy day with a good book and hot coffee ☕📖',
          image: null,
          timestamp: new Date(Date.now() - 1036800000).toISOString(),
          likes: 123,
          liked: false,
          comments: []
        }
      ],
      6: [
        {
          id: 601,
          user: { id: 6, username: 'dianawhite', avatar: null },
          text: 'Coffee and code - the perfect combination ☕💻',
          image: null,
          timestamp: new Date(Date.now() - 18000000).toISOString(),
          likes: 89,
          liked: true,
          comments: []
        },
        {
          id: 602,
          user: { id: 6, username: 'dianawhite', avatar: null },
          text: 'Morning yoga session complete! Starting the day with positive energy 🧘‍♀️',
          image: null,
          timestamp: new Date(Date.now() - 1123200000).toISOString(),
          likes: 167,
          liked: false,
          comments: []
        },
        {
          id: 603,
          user: { id: 6, username: 'dianawhite', avatar: null },
          text: 'Healthy meal prep Sunday! Fueling my body for the week ahead 🥗',
          image: null,
          timestamp: new Date(Date.now() - 1209600000).toISOString(),
          likes: 234,
          liked: true,
          comments: []
        }
      ]
    };

    return userPostsData[id] || userPostsData[1];
  };

  useEffect(() => {
    // TODO: Replace with actual API call
    // For now, use mock data
    const fetchProfile = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const profileId = userId === 'me' ? (currentUser?.id || 1) : parseInt(userId);
      const profileData = getUserProfileData(profileId);
      
      // Mock user data - use currentUser data if viewing own profile
      const mockUser = {
        id: profileId,
        username: userId === 'me' ? (currentUser?.username || profileData.username) : profileData.username,
        bio: userId === 'me' 
          ? (currentUser?.bio || profileData.bio)
          : profileData.bio,
        birthDate: userId === 'me' ? (currentUser?.birthDate || profileData.birthDate) : profileData.birthDate,
        location: userId === 'me' ? (currentUser?.location || profileData.location) : profileData.location,
        avatar: userId === 'me' ? (currentUser?.avatar || null) : null,
        followers: profileData.followers,
        following: profileData.following
      };

      setProfileUser(mockUser);
      // Initialize edit form with current values
      setEditForm({
        bio: mockUser.bio || '',
        birthDate: mockUser.birthDate || '',
        location: mockUser.location || ''
      });
      setLoading(false);
    };

    fetchProfile();
  }, [userId, currentUser]);

  // Sync profileUser with currentUser when viewing own profile
  useEffect(() => {
    if (isOwnProfile && currentUser && profileUser) {
      setProfileUser(prev => ({
        ...prev,
        bio: currentUser.bio || prev.bio,
        birthDate: currentUser.birthDate || prev.birthDate,
        location: currentUser.location || prev.location
      }));
      setEditForm({
        bio: currentUser.bio || '',
        birthDate: currentUser.birthDate || '',
        location: currentUser.location || ''
      });
    }
  }, [currentUser, isOwnProfile]);

  // Get posts for the profile - combine hardcoded posts with shared posts from global feed
  const userPosts = useMemo(() => {
    if (!profileUser) return [];
    
    // If user is blocked, don't show their posts
    if (currentUser && isUserBlocked(profileUser.id)) {
      return [];
    }
    
    // Get hardcoded posts for this user
    const hardcodedPosts = getUserPosts(profileUser.id);
    
    // Get shared posts from global feed
    const sharedPosts = posts.filter(post => 
      post.sharedBy?.id === profileUser.id
    );
    
    // Combine and sort by timestamp (newest first)
    const allPosts = [...hardcodedPosts, ...sharedPosts].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    return allPosts;
  }, [posts, profileUser, currentUser, isUserBlocked]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({
      bio: profileUser.bio || '',
      birthDate: profileUser.birthDate || '',
      location: profileUser.location || ''
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      bio: profileUser.bio || '',
      birthDate: profileUser.birthDate || '',
      location: profileUser.location || ''
    });
  };

  const handleSaveProfile = () => {
    // Update local profile state
    const updatedUser = {
      ...profileUser,
      ...editForm
    };
    setProfileUser(updatedUser);

    // Update current user context if viewing own profile
    if (isOwnProfile && currentUser) {
      updateProfile({
        bio: editForm.bio,
        birthDate: editForm.birthDate,
        location: editForm.location
      });
    }

    setIsEditing(false);
    // TODO: Replace with actual API call to save profile
  };

  const formatBirthDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading || postsLoading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">Loading profile...</div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="profile-container">
        <div className="profile-error">User not found</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar-large">
          {profileUser.avatar ? (
            <img src={profileUser.avatar} alt={profileUser.username} />
          ) : (
            <div className="profile-avatar-placeholder-large">
              {profileUser.username[0].toUpperCase()}
            </div>
          )}
        </div>
        <div className="profile-info">
          <div className="profile-name-section">
            <h1 className="profile-username">{profileUser.username}</h1>
            <div className="profile-action-buttons">
              {isOwnProfile && !isEditing && (
                <button className="profile-edit-btn" onClick={handleEdit}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit Profile
                </button>
              )}
              {!isOwnProfile && currentUser && (
                <button 
                  className={`profile-block-btn ${isUserBlocked(profileUser.id) ? 'blocked' : ''}`}
                  onClick={() => {
                    if (isUserBlocked(profileUser.id)) {
                      unblockUser(profileUser.id);
                    } else {
                      if (window.confirm(`Are you sure you want to block ${profileUser.username}? You won't see their posts or be able to message them.`)) {
                        blockUser(profileUser.id);
                      }
                    }
                  }}
                >
                  {isUserBlocked(profileUser.id) ? (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                      Unblock
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="16"/>
                        <line x1="8" y1="12" x2="16" y2="12"/>
                      </svg>
                      Block
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="profile-edit-form">
              <div className="profile-edit-field">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="profile-edit-textarea"
                />
              </div>

              <div className="profile-edit-field">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="City, Country"
                  className="profile-edit-input"
                />
              </div>

              <div className="profile-edit-field">
                <label htmlFor="birthDate">Birth Date</label>
                <input
                  id="birthDate"
                  type="date"
                  value={editForm.birthDate}
                  onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                  className="profile-edit-input"
                />
              </div>

              <div className="profile-edit-actions">
                <button 
                  className="profile-save-btn"
                  onClick={handleSaveProfile}
                >
                  Save Changes
                </button>
                <button 
                  className="profile-cancel-btn"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-details">
              {profileUser.bio && (
                <p className="profile-bio">{profileUser.bio}</p>
              )}
              <div className="profile-additional-info">
                {profileUser.location && (
                  <div className="profile-info-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span>{profileUser.location}</span>
                  </div>
                )}
                {profileUser.birthDate && (
                  <div className="profile-info-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span>Born {formatBirthDate(profileUser.birthDate)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="profile-stats">
            <span className="profile-stat">
              <strong>{profileUser.followers}</strong> Followers
            </span>
            <span className="profile-stat">
              <strong>{profileUser.following}</strong> Following
            </span>
          </div>
        </div>
      </div>

      {currentUser && isUserBlocked(profileUser.id) ? (
        <div className="profile-blocked-message">
          <p>You have blocked this user. Their posts are hidden from your feed.</p>
        </div>
      ) : (
        <div className="profile-posts-section">
          <div className="profile-posts-header">
            <h2 className="profile-posts-title">Posts</h2>
            {isOwnProfile && (
              <button 
                className="profile-create-post-btn"
                onClick={() => setShowCreatePost(!showCreatePost)}
              >
                {showCreatePost ? 'Cancel' : '+ New Post'}
              </button>
            )}
          </div>

          {showCreatePost && isOwnProfile && (
            <CreatePost 
              onSubmit={(newPost) => {
                addPost(newPost);
                setShowCreatePost(false);
              }}
              onCancel={() => setShowCreatePost(false)}
            />
          )}

          <div className="profile-posts">
            {userPosts.length === 0 ? (
              <div className="profile-no-posts">No posts yet</div>
            ) : (
              userPosts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post}
                  onLike={likePost}
                  onShare={(postId) => {
                    // Optional: Track share event for analytics
                    const post = posts.find(p => p.id === postId);
                    if (post) {
                      console.log('Post shared:', postId);
                    }
                  }}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

