import React from 'react';

const RightSection = () => {
    return (
        <div className="right-section">
            <div className="search-bar">
                <input type="text" placeholder="Search" />
            </div>
            <div className="trends">
                <h3>Trends for you</h3>
                <div className="trend-item">
                    <span>Trending in Tech</span>
                    <p>#ProjectY</p>
                    <span>100k Tweets</span>
                </div>
            </div>
        </div>
    );
};

export default RightSection;
