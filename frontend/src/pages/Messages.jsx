import { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import './Messages.css';

const Messages = () => {
  const { currentUser } = useUser();
  const [activeChat, setActiveChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState({});
  const [chats, setChats] = useState([]);
  const messagesEndRef = useRef(null);

  // Initialize chats with mock data
  useEffect(() => {
    // TODO: Replace with actual API call
    const mockChats = [
      {
        id: 1,
        user: {
          id: 2,
          username: 'janedoe',
          avatar: null
        },
        lastMessage: 'Hey, how are you doing?',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        unread: 2
      },
      {
        id: 2,
        user: {
          id: 3,
          username: 'bobsmith',
          avatar: null
        },
        lastMessage: 'Thanks for the help earlier!',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        unread: 0
      },
      {
        id: 3,
        user: {
          id: 4,
          username: 'alicejones',
          avatar: null
        },
        lastMessage: 'See you tomorrow!',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        unread: 1
      }
    ];

    setChats(mockChats);

    // Initialize messages for each chat
    const initialMessages = {
      1: [
        {
          id: 1,
          text: 'Hey, how are you doing?',
          senderId: 2,
          senderUsername: 'janedoe',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ],
      2: [
        {
          id: 1,
          text: 'Thanks for the help earlier!',
          senderId: 3,
          senderUsername: 'bobsmith',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        }
      ],
      3: [
        {
          id: 1,
          text: 'See you tomorrow!',
          senderId: 4,
          senderUsername: 'alicejones',
          timestamp: new Date(Date.now() - 86400000).toISOString()
        }
      ]
    };

    setMessages(initialMessages);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeChat]);

  const formatTime = (timestamp) => {
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

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChat || !currentUser) return;

    const newMessage = {
      id: Date.now(),
      text: messageInput.trim(),
      senderId: currentUser.id,
      senderUsername: currentUser.username,
      timestamp: new Date().toISOString()
    };

    // Add message to the chat
    setMessages(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMessage]
    }));

    // Update chat's last message and timestamp
    setChats(prev => prev.map(chat => 
      chat.id === activeChat.id
        ? {
            ...chat,
            lastMessage: newMessage.text,
            timestamp: newMessage.timestamp,
            unread: 0
          }
        : chat
    ));

    // Clear input
    setMessageInput('');

    // TODO: Send message to backend API
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const activeMessages = activeChat ? (messages[activeChat.id] || []) : [];

  return (
    <div className="messages-container">
      <div className="messages-sidebar">
        <div className="messages-sidebar-header">
          <h2>Messages</h2>
        </div>
        <div className="chat-list">
          {chats.map(chat => (
            <div
              key={chat.id}
              className={`chat-preview ${activeChat?.id === chat.id ? 'active' : ''}`}
              onClick={() => setActiveChat(chat)}
            >
              <div className="chat-avatar">
                {chat.user.avatar ? (
                  <img src={chat.user.avatar} alt={chat.user.username} />
                ) : (
                  <div className="chat-avatar-placeholder">
                    {chat.user.username[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="chat-info">
                <div className="chat-header-row">
                  <span className="chat-username">{chat.user.username}</span>
                  <span className="chat-timestamp">{formatTime(chat.timestamp)}</span>
                </div>
                <div className="chat-message-row">
                  <p className="chat-last-message">{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <span className="chat-unread-badge">{chat.unread}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="messages-main">
        {activeChat ? (
          <div className="chat-window">
            <div className="chat-window-header">
              <div className="chat-window-user">
                <div className="chat-window-avatar">
                  {activeChat.user.avatar ? (
                    <img src={activeChat.user.avatar} alt={activeChat.user.username} />
                  ) : (
                    <div className="chat-window-avatar-placeholder">
                      {activeChat.user.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="chat-window-username">{activeChat.user.username}</span>
              </div>
            </div>
            <div className="chat-messages">
              {activeMessages.length === 0 ? (
                <div className="chat-empty-state">
                  <p>Start a conversation with {activeChat.user.username}</p>
                  <p className="chat-empty-hint">Messages will appear here</p>
                </div>
              ) : (
                <div className="chat-messages-list">
                  {activeMessages.map(message => {
                    const isOwnMessage = message.senderId === currentUser?.id;
                    return (
                      <div
                        key={message.id}
                        className={`chat-message ${isOwnMessage ? 'own-message' : 'other-message'}`}
                      >
                        {!isOwnMessage && (
                          <div className="message-avatar">
                            {activeChat.user.avatar ? (
                              <img src={activeChat.user.avatar} alt={activeChat.user.username} />
                            ) : (
                              <div className="message-avatar-placeholder">
                                {activeChat.user.username[0].toUpperCase()}
                              </div>
                            )}
                          </div>
                        )}
                        <div className="message-content">
                          {!isOwnMessage && (
                            <span className="message-sender">{message.senderUsername}</span>
                          )}
                          <div className="message-bubble">
                            <p className="message-text">{message.text}</p>
                            <span className="message-time">{formatMessageTime(message.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Type a message..."
                className="chat-input"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!currentUser}
              />
              <button 
                type="submit"
                className="chat-send-btn"
                disabled={!messageInput.trim() || !currentUser}
              >
                Send
              </button>
            </form>
          </div>
        ) : (
          <div className="messages-empty">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;

