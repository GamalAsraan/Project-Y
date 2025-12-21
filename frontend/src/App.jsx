import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import Sidebar from './components/Sidebar'
import Feed from './components/Feed'
import RightSection from './components/RightSection'
import Tweet from './components/Tweet'
import TweetForm from './components/TweetForm'  // ADD THIS IMPORT
import SkeletonLoader from './components/SkeletonLoader'

function App() {
  const [loading, setLoading] = useState(true)
  const [tweets, setTweets] = useState([])
  const [showTweetForm, setShowTweetForm] = useState(false)  // ADD: Control form visibility

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setTweets([
        { id: 1, content: "Just setting up my Project-Y!" },
        { id: 2, content: "This is starting to look like the real deal." },
        { id: 3, content: "Frontend revamp in progress... #coding #react" },
        { id: 4, content: "Hello World from the new feed!" },
        { id: 5, content: "now this cunt will try to make the tweet thing work" }
      ])
      setLoading(false)
    }, 2000)
  }, [])

  // ADD THIS FUNCTION: Handle new tweet submission
  const handleNewTweet = (content) => {
    const newTweet = {
      id: tweets.length > 0 ? Math.max(...tweets.map(t => t.id)) + 1 : 1,
      content: content,
      timestamp: new Date().toISOString()
    }
    
    setTweets([newTweet, ...tweets])  // Add new tweet at beginning
    setShowTweetForm(false)  // Close the form
  }

  return (
    <Layout>
      {/* Pass the function to show tweet form */}
      <Sidebar onTweetClick={() => setShowTweetForm(true)} />
      
      <Feed>
        {/* ADD: Show tweet form at top of feed when active */}
        {showTweetForm && (
          <div className="tweet-form-container">
            <TweetForm 
              onSubmit={handleNewTweet}
              onClose={() => setShowTweetForm(false)}
            />
          </div>
        )}
        
        {loading ? (
          <>
            <SkeletonLoader />
            <SkeletonLoader />
            <SkeletonLoader />
            <SkeletonLoader />
          </>
        ) : (
          tweets.map(tweet => (
            <Tweet key={tweet.id} content={tweet.content} />
          ))
        )}
      </Feed>
      <RightSection />
    </Layout>
  )
}

export default App