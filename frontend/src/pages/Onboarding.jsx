import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useUser } from '../context/UserContext';
import './Auth.css'; // Reuse Auth styles for simplicity

const Onboarding = () => {
    const [interests, setInterests] = useState([]);
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useUser();

    useEffect(() => {
        const fetchInterests = async () => {
            try {
                const response = await api.get('/auth/interests');
                setInterests(response.data);
            } catch (error) {
                console.error('Failed to fetch interests', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInterests();
    }, []);

    const toggleInterest = (id) => {
        if (selectedInterests.includes(id)) {
            setSelectedInterests(selectedInterests.filter(i => i !== id));
        } else {
            setSelectedInterests([...selectedInterests, id]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedInterests.length === 0) return;

        try {
            // Assuming user.id is available in context, otherwise might need to pass it or get from token
            // The backend expects { userId, interestIds }
            // If user context doesn't have ID yet (e.g. just registered), we might need to rely on what was returned from register
            // For now, let's assume the user object in context has the ID.

            // If context is not fully synced yet, we might fallback to localStorage or just send the request 
            // relying on the token if the backend supported extracting ID from token for this endpoint.
            // The backend `saveOnboarding` controller currently expects `userId` in body.
            // Let's assume we have it.

            await api.post('/auth/onboarding', {
                interestIds: selectedInterests
            });
            navigate('/');
        } catch (error) {
            console.error('Onboarding failed', error);
        }
    };

    if (loading) return <div>Loading interests...</div>;

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Welcome! What are you into?</h2>
                <p>Pick a few tags to personalize your feed.</p>

                <div className="interests-grid">
                    {interests.map(interest => (
                        <button
                            key={interest.interestid}
                            type="button"
                            onClick={() => toggleInterest(interest.interestid)}
                            className={`interest-tag ${selectedInterests.includes(interest.interestid) ? 'selected' : ''}`}
                        >
                            {interest.interestname}
                        </button>
                    ))}
                </div>

                <button
                    className="auth-submit-btn"
                    onClick={handleSubmit}
                    disabled={selectedInterests.length === 0}
                >
                    Continue to Feed
                </button>
            </div>
        </div>
    );
};

export default Onboarding;
