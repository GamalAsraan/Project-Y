import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './TopBar.css';

const TopBar = () => {
  const { currentUser } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <div className="topbar">
      <div className="topbar-content">
        <div className="topbar-logo">
          <Link to="/">Y</Link>
        </div>
        
        <form className="topbar-search" onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Search..." 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="topbar-actions">
          <Link to="/messages" className="topbar-icon" title="Messages">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.25 3.018H4.75A2.752 2.752 0 0 0 2 5.77v12.495a2.752 2.752 0 0 0 2.75 2.753h14.5A2.752 2.752 0 0 0 22 18.265V5.77a2.752 2.752 0 0 0-2.75-2.752ZM4.75 4.518h14.5c.69 0 1.25.56 1.25 1.25v.714l-8.05 5.367a.81.81 0 0 1-.9-.002L3.5 6.482v-.714c0-.69.56-1.25 1.25-1.25Zm14.5 14.998H4.75c-.69 0-1.25-.56-1.25-1.25V8.885l7.24 4.83a2.265 2.265 0 0 0 2.52.001l7.24-4.83v10.381c0 .69-.56 1.25-1.25 1.25Z"/>
            </svg>
          </Link>
          
          <Link to="/notifications" className="topbar-icon" title="Notifications">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.993 9.042a8.062 8.062 0 0 0-15.996.009L2.866 18H7.1a5.002 5.002 0 0 0 9.8 0h4.236l-1.143-8.958zM12 20a3.001 3.001 0 0 1-2.829-2h5.658A3.001 3.001 0 0 1 12 20zm-6.866-4l.81-6.342a6.062 6.062 0 0 1 12.112.002L18.864 16H5.134z"/>
            </svg>
          </Link>

          <Link 
            to={currentUser ? '/profile/me' : '/auth'} 
            className="topbar-avatar"
            title={currentUser ? 'Profile' : 'Login'}
          >
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.username} />
            ) : (
              <div className="avatar-placeholder">
                {currentUser?.username?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TopBar;

