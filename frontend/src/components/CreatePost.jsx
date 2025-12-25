import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './CreatePost.css';

const CreatePost = ({ onSubmit, onCancel }) => {
  const { currentUser } = useUser();
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showImageInput, setShowImageInput] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      return;
    }

    setUploadedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Clear URL input if file is uploaded
    setImageUrl('');
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imageUrl.trim() && !uploadedImage) {
      alert('Please enter some text or add an image');
      return;
    }

    if (!currentUser) {
      alert('Please log in to create a post');
      return;
    }

    let imageData = null;

    // If image was uploaded, convert to base64
    if (uploadedImage) {
      try {
        imageData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(uploadedImage);
        });
      } catch (error) {
        alert('Error processing image. Please try again.');
        return;
      }
    } else if (imageUrl.trim()) {
      imageData = imageUrl.trim();
    }

    onSubmit({
        text: text.trim(),
        image: imageData,
     });

    setText('');
    setImageUrl('');
    setUploadedImage(null);
    setImagePreview(null);
    setShowImageInput(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onCancel) {
      onCancel();
    }
  };

  const handleCancel = () => {
    setText('');
    setImageUrl('');
    setUploadedImage(null);
    setImagePreview(null);
    setShowImageInput(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onCancel) {
      onCancel();
    }
  };

  if (!currentUser) {
    return (
      <div className="create-post-login-prompt">
        <p>Please <Link to="/auth">log in</Link> to create a post</p>
      </div>
    );
  }

  return (
    <div className="create-post">
      <div className="create-post-header">
        <h2>Create Post</h2>
        {onCancel && (
          <button className="create-post-close" onClick={handleCancel}>
            ×
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="create-post-form">
        <div className="create-post-user">
          <div className="create-post-avatar">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.username} />
            ) : (
              <div className="create-post-avatar-placeholder">
                {currentUser.username?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>
          <span className="create-post-username">{currentUser.username}</span>
        </div>
        
        <textarea
          className="create-post-textarea"
          placeholder="What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
        />

        {showImageInput && (
          <div className="create-post-image-input">
            <div className="create-post-image-options">
              <label className="create-post-file-label">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="create-post-file-input"
                />
                <span className="create-post-file-button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                  </svg>
                  Upload Image
                </span>
              </label>
              <div className="create-post-image-divider">or</div>
              <input
                type="url"
                placeholder="Image URL (optional)"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setUploadedImage(null);
                  setImagePreview(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="create-post-image-url"
              />
            </div>
          </div>
        )}

        {(imagePreview || imageUrl) && (
          <div className="create-post-image-preview">
            <img src={imagePreview || imageUrl} alt="Preview" onError={(e) => {
              e.target.style.display = 'none';
            }} />
            <button
              type="button"
              className="create-post-remove-image"
              onClick={handleRemoveImage}
              title="Remove image"
            >
              ×
            </button>
          </div>
        )}

        <div className="create-post-actions">
          <div className="create-post-options">
            <button
              type="button"
              className="create-post-option-btn"
              onClick={() => setShowImageInput(!showImageInput)}
              title="Add Image"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              Image
            </button>
          </div>
          <div className="create-post-submit-actions">
            {onCancel && (
              <button
                type="button"
                className="create-post-cancel-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="create-post-submit-btn"
              disabled={!text.trim() && !imageUrl.trim() && !uploadedImage}
            >
              Post
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;

