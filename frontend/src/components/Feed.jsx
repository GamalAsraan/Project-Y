import React from 'react';

const Feed = ({ children }) => {
    return (
        <div className="feed">
            <div className="feed-header">
                <h2>Home</h2>
            </div>
            {children}
        </div>
    );
};

export default Feed;
