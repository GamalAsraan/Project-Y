import './Notifications.css';

const Notifications = () => {
  // Mock data - replace with actual API call
  const notifications = [
    {
      id: 1,
      type: 'like',
      message: 'janedoe liked your post',
      timestamp: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: 2,
      type: 'comment',
      message: 'bobsmith commented on your post',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 3,
      type: 'follow',
      message: 'alicejones started following you',
      timestamp: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 4,
      type: 'share',
      message: 'charliebrown shared your post',
      timestamp: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 5,
      type: 'like',
      message: 'dianawhite and 5 others liked your post',
      timestamp: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h1>Notifications</h1>
      </div>
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="notifications-empty">No notifications yet</div>
        ) : (
          notifications.map(notification => (
            <div key={notification.id} className="notification-item">
              <div className="notification-content">
                <p className="notification-message">{notification.message}</p>
                <span className="notification-timestamp">
                  {formatTimestamp(notification.timestamp)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;

