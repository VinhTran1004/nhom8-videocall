import React, { useState } from 'react';
import { 
  signInWithGoogle, 
  signInWithGithub, 
  signInFastDemo 
} from '../services/firebase';
import { LogIn, X, AlertCircle, Sparkles, UserCheck, Check } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      onLoginSuccess(user);
      onClose();
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/unauthorized-domain') {
        setError('Tên miền này chưa được thêm vào Firebase Authorized Domains. Bạn có thể dùng chế độ "Đăng Nhập Nhanh / Chấm Điểm" bên dưới để test ngay lập tức!');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Cửa sổ đăng nhập đã bị đóng.');
      } else {
        setError(err.message || 'Lỗi khi đăng nhập bằng Google. Hãy thử lại hoặc dùng chế độ Test!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await signInWithGithub();
      onLoginSuccess(user);
      onClose();
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/unauthorized-domain') {
        setError('Tên miền chưa được thêm vào Firebase Authorized Domains. Hãy dùng chế độ "Đăng Nhập Nhanh" bên dưới!');
      } else {
        setError(err.message || 'Lỗi khi đăng nhập bằng GitHub.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFastLogin = (name, email, role, avatarSeed) => {
    const user = signInFastDemo({
      displayName: name,
      email: email,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`,
      provider: 'Social FastAuth'
    });
    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-card modal-card" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose} 
          style={{ 
            position: 'absolute', 
            top: '20px', 
            right: '20px', 
            background: 'none', 
            border: 'none', 
            color: 'var(--text-muted)', 
            cursor: 'pointer' 
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="auth-lock-icon" style={{ margin: '0 auto 16px' }}>
            <LogIn size={28} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)' }}>
            Đăng Nhập Mạng Xã Hội
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '6px' }}>
            Vui lòng đăng nhập trước khi tham gia phòng gọi video (Yêu cầu đề bài)
          </p>
        </div>

        {error && (
          <div style={{ 
            padding: '12px 16px', 
            background: 'var(--danger-bg)', 
            border: '1px solid var(--danger)', 
            borderRadius: 'var(--radius-md)', 
            color: '#fca5a5', 
            fontSize: '0.85rem', 
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Nút đăng nhập Social Chính */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            className="btn btn-google btn-lg" 
            onClick={handleGoogleLogin} 
            disabled={loading}
            style={{ width: '100%', border: '1px solid rgba(0,0,0,0.1)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>{loading ? 'Đang kết nối...' : 'Đăng nhập với Google'}</span>
          </button>

          <button 
            className="btn btn-github btn-lg" 
            onClick={handleGithubLogin} 
            disabled={loading}
            style={{ width: '100%' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            <span>Đăng nhập với GitHub</span>
          </button>
        </div>

        {/* Chế độ Fast Test / Chấm Điểm dành cho Giảng Viên và Kiểm Thử 2 Máy */}
        <div className="demo-fast-login">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '10px' }}>
            <Sparkles size={16} color="var(--secondary)" />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--secondary)' }}>
              Chế Độ Chấm Bài Nhanh (Fast Test Profiles):
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', textAlign: 'center', marginBottom: '12px' }}>
            Chọn ngay 1 danh tính để test gọi video giữa 2 máy/trình duyệt không cần qua xác thực Google:
          </p>

          <div className="fast-login-chips">
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => handleFastLogin('Thầy Cô Chấm Bài (GV)', 'teacher@university.edu.vn', 'Teacher', 'teacher88')}
            >
              👨‍🏫 Giảng Viên Chấm Điểm
            </button>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => handleFastLogin('Trần Quang Vinh (Nhóm 8)', 'vinh.tq@student.edu.vn', 'Student', 'vinh88')}
            >
              👨‍💻 Trần Quang Vinh
            </button>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => handleFastLogin('Huỳnh Minh Trí (Nhóm 8)', 'tri.hm@student.edu.vn', 'Student', 'tri88')}
            >
              👨‍💻 Huỳnh Minh Trí
            </button>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => handleFastLogin('Khách Tham Gia 01', 'guest01@gmail.com', 'Guest', 'guest01')}
            >
              👤 Khách Mời 01
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
