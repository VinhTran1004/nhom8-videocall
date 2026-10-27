import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import GroupBanner from './components/GroupBanner';
import RoomLobby from './components/RoomLobby';
import VideoRoom from './components/VideoRoom';
import LoginModal from './components/LoginModal';
import ConfigModal from './components/ConfigModal';
import GuideModal from './components/GuideModal';
import { getSavedUser, signOutUser } from './services/firebase';
import { getSavedDailyRoom, saveDailyRoom } from './services/daily';

export default function App() {
  const [user, setUser] = useState(null);
  const [roomUrl, setRoomUrl] = useState(getSavedDailyRoom());
  const [isInCall, setIsInCall] = useState(false);

  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Theme
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('nhom8_theme') || 'dark';
  });

  // Tải thông tin người dùng từ LocalStorage khi khởi động
  useEffect(() => {
    const saved = getSavedUser();
    if (saved) {
      setUser(saved);
    }
  }, []);

  // Cập nhật Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nhom8_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    await signOutUser();
    setUser(null);
  };

  const handleJoinCall = () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    saveDailyRoom(roomUrl);
    setIsInCall(true);
  };

  const handleLeaveCall = () => {
    setIsInCall(false);
  };

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <Navbar 
        user={user}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        onOpenSettings={() => setIsConfigModalOpen(true)}
        isInCall={isInCall}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Banner Nhóm 8 & Danh sách thành viên (Luôn hiển thị ở trang chủ theo yêu cầu đề bài) */}
        {!isInCall && <GroupBanner />}

        {/* Nội dung chính: Sảnh chờ hoặc Phòng gọi Video */}
        {isInCall ? (
          <VideoRoom 
            user={user} 
            roomUrl={roomUrl} 
            onLeaveCall={handleLeaveCall} 
          />
        ) : (
          <RoomLobby 
            user={user}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            roomUrl={roomUrl}
            setRoomUrl={setRoomUrl}
            onJoinCall={handleJoinCall}
          />
        )}
      </main>

      {/* Footer */}
      {!isInCall && (
        <footer className="app-footer">
          <p>© 2026 Bài Tập Xây Dựng Phần Mềm Web (BT_XDPMW) — Nhóm 8</p>
          <p style={{ marginTop: '4px', color: 'var(--text-sub)' }}>
            Thành viên thực hiện: <strong>Trần Quang Vinh</strong> & <strong>Huỳnh Minh Trí</strong> | Nền tảng: Daily.co Video API & Firebase Social Auth
          </p>
        </footer>
      )}

      {/* Modals */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
      />

      <ConfigModal 
        isOpen={isConfigModalOpen} 
        onClose={() => setIsConfigModalOpen(false)} 
        onRoomUpdated={(newUrl) => setRoomUrl(newUrl)}
      />

      <GuideModal 
        isOpen={isGuideModalOpen} 
        onClose={() => setIsGuideModalOpen(false)} 
      />
    </div>
  );
}
