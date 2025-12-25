import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Messages.css';

const Messages = () => {
  const { currentUser } = useUser();
  const [searchParams] = useSearchParams();
  const [activeChat, setActiveChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState({});
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Fetch conversations
  useEffect(() => {
    if (!currentUser) return;

    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        const res = await fetch(`${API_URL}/messages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch conversations');

        const data = await res.json();
        setChats(data);

        // Check for conversationId in URL
        const conversationId = searchParams.get('conversationId');
        if (conversationId) {
          const chat = data.find(c => c.id === parseInt(conversationId));
          if (chat) {
            setActiveChat(chat);
          }
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [currentUser, searchParams]);

  // Fetch messages for active chat
  useEffect(() => {
    if (!activeChat) return;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        const res = await fetch(`${API_URL}/messages/${activeChat.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch messages');

        const data = await res.json();
        setMessages(prev => ({
          ...prev,
          [activeChat.id]: data
        }));
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
    // Poll for new messages every 5 seconds (simple real-time)
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [activeChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeChat]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChat || !currentUser) return;

    const tempId = Date.now();
    const text = messageInput.trim();

    // Optimistic update
    const newMessage = {
      id: tempId,
      text: text,
      senderId: currentUser.id,
      senderUsername: currentUser.username,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMessage]
    }));

    setMessageInput('');

    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId: activeChat.id,
          text: text
        })
      });

      if (!res.ok) throw new Error('Failed to send message');

      const savedMessage = await res.json();

      // Update message with real ID and timestamp
      setMessages(prev => ({
        ...prev,
        [activeChat.id]: prev[activeChat.id].map(m =>
          m.id === tempId ? savedMessage : m
        )
      }));

      // Update chat list preview
      setChats(prev => prev.map(chat =>
        chat.id === activeChat.id
          ? {
            ...chat,
            lastMessage: savedMessage.text,
            timestamp: savedMessage.timestamp,
            unread: 0
          }
          : chat
      ));

    } catch (error) {
      console.error('Error sending message:', error);
      // Revert optimistic update on error (optional, but good UX)
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const activeMessages = activeChat ? (messages[activeChat.id] || []) : [];

  if (loading) {
    return (
      <div className="messages-container">
        <div className="messages-loading">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="messages-container">
      <div className="messages-sidebar">
        <div className="messages-sidebar-header">
          <h2>Messages</h2>
        </div>
        <div className="chat-list">
          {chats.length === 0 ? (
            <div className="chat-list-empty">No conversations yet</div>
          ) : (
            chats.map(chat => (
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
                    <p className="chat-last-message">{chat.lastMessage || 'Start a conversation'}</p>
                    {chat.unread > 0 && (
                      <span className="chat-unread-badge">{chat.unread}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
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

