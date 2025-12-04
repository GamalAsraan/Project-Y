import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import Sidebar from './components/Sidebar'
import Feed from './components/Feed'
import RightSection from './components/RightSection'
import Tweet from './components/Tweet'
import SkeletonLoader from './components/SkeletonLoader'

function App() {
  const [loading, setLoading] = useState(true)
  const [tweets, setTweets] = useState([])

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setTweets([
        { id: 1, content: "Just setting up my Project-Y!" },
        { id: 2, content: "This is starting to look like the real deal." },
        { id: 3, content: "Frontend revamp in progress... #coding #react" },
        { id: 4, content: "Hello World from the new feed!" }
      ])
      setLoading(false)
    }, 2000)
  }, [])

  return (
    <Layout>
      <Sidebar />
      <Feed>
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
