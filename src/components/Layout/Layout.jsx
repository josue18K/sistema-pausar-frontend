import { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Toaster } from 'react-hot-toast';
import { useTheme } from '../../contexts/ThemeContext';
import { Menu, X } from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import './Layout.css';

export default function Layout({ children }) {
  const { isDark } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div data-bs-theme={isDark ? 'dark' : 'light'} style={{ minHeight: '100vh' }}>
      <Toaster position="top-right" />
      
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div style={{ display: 'flex' }}>
        <div className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} onClick={closeSidebar} />
        
        <div className={`sidebar ${sidebarOpen ? 'show' : ''}`}>
          <Sidebar onClose={closeSidebar} />
        </div>
        
        <div className="main-content" style={{ flex: 1, width: '100%', minHeight: 'calc(100vh - 70px)' }}>
          <div style={{ padding: '24px 16px' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
