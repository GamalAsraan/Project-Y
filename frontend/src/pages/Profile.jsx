import { useParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { usePosts } from '../context/PostsContext';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import { useState, useEffect, useMemo } from 'react';
import './Profile.css';

const Profile = () => {
  const { userId } = useParams();
  const { currentUser, updateProfile, blockUser, unblockUser, isUserBlocked, logout } = useUser();
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
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const profileId = userId === 'me' ? (currentUser?.id) : userId;
        if (!profileId) return;

        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        // Fetch Profile
        const profileRes = await fetch(`${API_URL}/api/profile/${profileId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!profileRes.ok) throw new Error('Failed to fetch profile');
        const profileData = await profileRes.json();

        // Fetch User Posts
        const postsRes = await fetch(`${API_URL}/posts/user/${profileId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!postsRes.ok) throw new Error('Failed to fetch user posts');
        const postsData = await postsRes.json();

        // Map backend profile to frontend format
        const mappedProfile = {
          id: profileData.userid,
          username: profileData.usernameunique,
          displayName: profileData.displayname,
          bio: profileData.bio,
          avatar: profileData.avatarurl,
          followers: profileData.followerscount || 0,
          following: profileData.followingcount || 0,
          location: '', // Not in DB yet
          birthDate: '', // Not in DB yet
          is_following: profileData.is_following
        };

        setProfileUser(mappedProfile);

        // Initialize edit form
        setEditForm({
          bio: mappedProfile.bio || '',
          birthDate: '',
          location: ''
        });

        // Map posts
        const formattedPosts = postsData.map(post => ({
          id: post.postid,
          user: {
            id: post.userid,
            username: post.usernameunique,
            avatar: post.avatarurl,
            displayName: post.displayname
          },
          text: post.contentbody,
          timestamp: post.createdat,
          likes: post.likecount || 0,
          reposts: post.repostcount || 0,
          comments: post.commentcount || 0,
          liked: false
        }));

        // We can set these to a local state or just rely on the context if we want global posts
        // But for profile, we usually want specific user posts.
        // The original code used a mix. Let's override the userPosts memo logic with this data.
        // Actually, the original code used `getUserPosts` helper. 
        // We should probably store these fetched posts in a state.
        setFetchedUserPosts(formattedPosts);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, currentUser]);

  // We need a state for userPosts since we are fetching them now
  const [fetchedUserPosts, setFetchedUserPosts] = useState([]);

  // Update fetchProfile to setFetchedUserPosts
  // ... (inside fetchProfile)
  // setFetchedUserPosts(formattedPosts);

  // Sync profileUser with currentUser when viewing own profile
  useEffect(() => {
    if (isOwnProfile && currentUser && profileUser) {
      setProfileUser(prev => ({
        ...prev,
        bio: currentUser.bio || prev.bio,
        // birthDate and location are not in DB yet
      }));
    }
  }, [currentUser, isOwnProfile]);

  // Use fetched posts
  const userPosts = fetchedUserPosts;

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

  const handleFollow = async () => {
    if (!currentUser) return;

    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      const res = await fetch(`${API_URL}/api/users/${profileUser.id}/follow`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to follow/unfollow');

      const data = await res.json();

      setProfileUser(prev => ({
        ...prev,
        followers: data.following ? prev.followers + 1 : prev.followers - 1,
        is_following: data.following
      }));
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  const handleLogout = async () => {
    // Use the logout function from UserContext
    // We need to import it first
    const { logout } = useUser(); // This won't work inside the function scope if not destructured at top
    // But we already have access to logout from useUser() at the top of the component?
    // Let's check the top of the component.
    // const { currentUser, updateProfile, blockUser, unblockUser, isUserBlocked } = useUser();
    // We need to add logout to the destructuring.
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
              {isOwnProfile ? (
                !isEditing && (
                  <button className="profile-edit-btn" onClick={handleEdit}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit Profile
                  </button>
                )
              ) : (
                <>
                  <button
                    className={`profile-follow-btn ${profileUser.is_following ? 'following' : ''}`}
                    onClick={handleFollow}
                  >
                    {profileUser.is_following ? 'Following' : 'Follow'}
                  </button>
                  <button className="profile-message-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Message
                  </button>
                  {currentUser && (
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
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                          Unblock
                        </>
                      ) : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="16" />
                            <line x1="8" y1="12" x2="16" y2="12" />
                          </svg>
                          Block
                        </>
                      )}
                    </button>
                  )}
                </>
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
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{profileUser.location}</span>
                  </div>
                )}
                {profileUser.birthDate && (
                  <div className="profile-info-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
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

      {isOwnProfile && (
        <button className="profile-logout-fab" onClick={logout} title="Logout">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Profile;

