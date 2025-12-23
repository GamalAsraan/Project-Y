import TopBar from './TopBar';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <TopBar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;

