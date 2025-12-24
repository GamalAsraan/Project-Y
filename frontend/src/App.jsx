import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { PostsProvider } from './context/PostsContext';
import MainLayout from './components/MainLayout';
import Feed from './pages/Feed';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import Search from './pages/Search';

function App() {
  return (
    <UserProvider>
      <PostsProvider>
        <Router>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Feed />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/search" element={<Search />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainLayout>
        </Router>
      </PostsProvider>
    </UserProvider>
  );
}

export default App;
