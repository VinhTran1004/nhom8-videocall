import React from 'react';
import { Video, LogIn, LogOut, Sun, Moon, HelpCircle, Settings, ShieldCheck } from 'lucide-react';

export default function Navbar({ 
  user, 
  onOpenLogin, 
  onLogout, 
  theme, 
  onToggleTheme, 
  onOpenGuide, 
  onOpenSettings,
  isInCall
}) {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="brand-icon">
          <Video size={22} />
        </div>
        <div className="brand-text">
          <h1>Nhóm 8 - Video Meeting</h1>
          <p>Môn: Xây Dựng Phần Mềm Web (BT_XDPMW)</p>
        </div>
      </div>

      <div className="navbar-actions">
        {/* Nút xem Hướng dẫn */}
        <button 
          className="btn btn-secondary btn-sm" 
          onClick={onOpenGuide}
          title="Hướng dẫn sử dụng và nộp bài"
        >
          <HelpCircle size={16} />
          <span>Hướng dẫn</span>
        </button>

        {/* Nút Cấu hình API / Firebase */}
        <button 
          className="btn btn-secondary btn-sm" 
          onClick={onOpenSettings}
          title="Cấu hình Daily API & Firebase"
        >
          <Settings size={16} />
        </button>

        {/* Nút Đổi Theme */}
        <button 
          className="btn btn-secondary btn-sm" 
          onClick={onToggleTheme}
          title="Chuyển chế độ Sáng / Tối"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Trạng thái Người dùng */}
        {user ? (
          <div className="user-profile-badge">
            <img 
              src={user.photoURL} 
              alt={user.displayName} 
              className="user-profile-avatar"
              onError={(e) => {
                e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`;
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="user-profile-name">{user.displayName}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>
                {user.provider ? `Đã xác thực (${user.provider})` : 'Online'}
              </span>
            </div>
            {!isInCall && (
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={onLogout}
                style={{ padding: '4px 8px', marginLeft: '6px' }}
                title="Đăng xuất"
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={onOpenLogin}>
            <LogIn size={16} />
            <span>Đăng nhập</span>
          </button>
        )}
      </div>
    </header>
  );
}
