import React from 'react';

const Tweet = ({ content }) => {
    return (
        <div className="tweet">
            <div className="avatar"></div>
            <div className="tweet-content">
                <div className="tweet-header">
                    <span className="name">User</span>
                    <span className="handle">@user</span>
                </div>
                <p>{content}</p>
            </div>
        </div>
    );
};

export default Tweet;
