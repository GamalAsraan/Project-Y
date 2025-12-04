import { useState, useEffect } from 'react'

function App() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    fetch('http://localhost:3000/')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => setMessage('Error connecting to backend'))
  }, [])

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
      <h1>Project-Y</h1>
      <p>Frontend is running!</p>
      <p>Backend says: <strong>{message}</strong></p>
    </div>
  )
}

export default App
