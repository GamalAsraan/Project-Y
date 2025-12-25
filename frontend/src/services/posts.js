import { API_URL } from '../config/api';

export async function getPosts() {
  const res = await fetch(`${API_URL}/posts`);
  return res.json();
}
export async function createPost(text) {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    throw new Error('Failed to create post');
  }

  return res.json();
}
