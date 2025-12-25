const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getPosts = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/posts`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch posts');
  return response.json();
};

export const getUserPosts = async (userId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/posts/user/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch user posts');
  return response.json();
};

export const createPost = async (text, image) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ content: text, media_url: image })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create post');
  }

  return response.json();
};
