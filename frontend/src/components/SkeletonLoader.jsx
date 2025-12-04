import React from 'react';

const SkeletonLoader = () => {
    return (
        <div className="tweet skeleton">
            <div className="avatar skeleton-avatar"></div>
            <div className="tweet-content">
                <div className="skeleton-text short"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text"></div>
            </div>
        </div>
    );
};

export default SkeletonLoader;
