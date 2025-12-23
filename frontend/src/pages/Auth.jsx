import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Auth.css';

const Auth = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const { login } = useUser();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // TODO: Replace with actual API call
    // For now, just simulate login
    if (isSignup) {
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match!');
        return;
      }
      // Simulate signup
      const newUser = {
        id: Date.now(),
        username: formData.username,
        email: formData.email,
        avatar: null
      };
      login(newUser);
      navigate('/');
    } else {
      // Simulate login
      const user = {
        id: 1,
        username: formData.username || 'johndoe',
        email: formData.email || 'john@example.com',
        avatar: null
      };
      login(user);
      navigate('/');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{isSignup ? 'Sign Up' : 'Log In'}</h1>
          <p>{isSignup ? 'Create your account' : 'Welcome back!'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
            />
          </div>

          {isSignup && (
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          {isSignup && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
              />
            </div>
          )}

          <button type="submit" className="auth-submit-btn">
            {isSignup ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
            <button
              type="button"
              className="switch-btn"
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;

