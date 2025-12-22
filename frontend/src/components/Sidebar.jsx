import React from 'react';

const Sidebar = ({ onTweetClick }) => {  // ADD THE PROPS HERE
    return (
        <div className="sidebar">
            <div className="logo">X</div>
            <nav>
                <a href="#" className="active">Home</a>
                <a href="#">Explore</a>
                <a href="#">Notifications</a>
                <a href="#">Messages</a>
                <a href="#">Profile</a>
            </nav>
            {/* ADD onClick HANDLER */}
            <button 
              className="tweet-btn" 
              onClick={onTweetClick}
            >
                Tweet
            </button>
        </div>
    );
};

export default Sidebar;