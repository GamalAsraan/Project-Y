import { useParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { usePosts } from '../context/PostsContext';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import { useState, useEffect, useMemo } from 'react';
import './Profile.css';

const Profile = () => {
  const { userId } = useParams();
  const { currentUser, updateProfile } = useUser();
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

  useEffect(() => {
    // TODO: Replace with actual API call
    // For now, use mock data
    const fetchProfile = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock user data - use currentUser data if viewing own profile
      const mockUser = {
        id: userId === 'me' ? currentUser?.id || 1 : parseInt(userId),
        username: userId === 'me' ? currentUser?.username || 'johndoe' : 'janedoe',
        bio: userId === 'me' 
          ? (currentUser?.bio || 'Software developer passionate about building amazing things!')
          : 'Designer and creative thinker. Always exploring new ideas.',
        birthDate: userId === 'me' ? (currentUser?.birthDate || '') : '1990-01-15',
        location: userId === 'me' ? (currentUser?.location || '') : 'New York, NY',
        avatar: userId === 'me' ? (currentUser?.avatar || null) : null,
        followers: 1234,
        following: 567
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

  // Filter posts by user ID - include both original posts and shared posts
  const userPosts = useMemo(() => {
    if (!profileUser) return [];
    return posts.filter(post => 
      post.user?.id === profileUser.id || 
      post.sharedBy?.id === profileUser.id
    );
  }, [posts, profileUser]);

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
            {isOwnProfile && !isEditing && (
              <button className="profile-edit-btn" onClick={handleEdit}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit Profile
              </button>
            )}
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
    </div>
  );
};

export default Profile;

