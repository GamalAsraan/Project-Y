import React from 'react';

const Sidebar = () => {
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
            <button className="tweet-btn">Tweet</button>
        </div>
    );
};

export default Sidebar;
