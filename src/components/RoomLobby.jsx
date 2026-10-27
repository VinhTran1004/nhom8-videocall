import React, { useState } from 'react';
import { 
  Video, 
  LogIn, 
  Share2, 
  Check, 
  Copy, 
  Sparkles, 
  Mic, 
  Camera, 
  Users, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';

export default function RoomLobby({ 
  user, 
  onOpenLogin, 
  roomUrl, 
  setRoomUrl, 
  onJoinCall 
}) {
  const [copied, setCopied] = useState(false);

  // Tạo link chia sẻ để người thứ 2 mở ra là có sẵn phòng
  const handleCopyInviteLink = () => {
    const currentOrigin = window.location.origin + window.location.pathname;
    const inviteUrl = `${currentOrigin}?room=${encodeURIComponent(roomUrl)}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="lobby-grid">
      {/* Cột chính: Tham gia phòng hoặc Yêu cầu đăng nhập */}
      <div className="glass-card lobby-card">
        {!user ? (
          /* TRƯỜNG HỢP CHƯA ĐĂNG NHẬP (Bắt buộc theo yêu cầu đề bài) */
          <div className="auth-prompt-card">
            <div className="auth-lock-icon">
              <LogIn size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>
                Yêu Cầu Đăng Nhập Trước Khi Gọi Video
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px', maxWidth: '440px' }}>
                Theo yêu cầu đề bài, bạn cần xác thực tài khoản qua mạng xã hội (Google / GitHub) để hệ thống nhận diện và hiển thị tên trong danh sách người gọi.
              </p>
            </div>

            <div className="auth-btn-row">
              <button className="btn btn-primary btn-lg" onClick={onOpenLogin}>
                <LogIn size={18} />
                <span>Đăng Nhập Ngay</span>
              </button>
            </div>
          </div>
        ) : (
          /* TRƯỜNG HỢP ĐÃ ĐĂNG NHẬP: SẴN SÀNG JOIN ROOM */
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div className="lobby-title">
                <Video size={24} color="var(--primary)" />
                <span>Sẵn Sàng Tham Gia Cuộc Gọi</span>
              </div>
              <div className="badge badge-success">
                <ShieldCheck size={14} />
                <span>Đã xác thực: {user.displayName}</span>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">URL Phòng Gọi Video (Daily.co):</label>
              <input 
                type="text" 
                className="custom-input" 
                value={roomUrl} 
                onChange={(e) => setRoomUrl(e.target.value)} 
                placeholder="https://your-domain.daily.co/your-room"
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>
                * Mặc định sử dụng phòng nhóm 8. Bạn có thể thay đổi hoặc nhập URL phòng riêng.
              </span>
            </div>

            {/* Presets phòng mẫu */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Phòng mẫu:</span>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => setRoomUrl('https://nhom8.daily.co/classroom')}
              >
                🏫 Phòng Học Nhóm 8
              </button>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => setRoomUrl('https://nhom8.daily.co/demo-meeting')}
              >
                💼 Phòng Demo
              </button>
            </div>

            {/* Nút Join & Nút Mời */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '10px' }}>
              <button 
                className="btn btn-primary btn-lg" 
                onClick={onJoinCall}
                style={{ flex: 1, minWidth: '200px' }}
              >
                <Video size={20} />
                <span>Tham Gia Cuộc Gọi Ngay</span>
              </button>

              <button 
                className="btn btn-secondary btn-lg" 
                onClick={handleCopyInviteLink}
                title="Sao chép link kèm mã phòng này để gửi cho bạn bè/giảng viên"
              >
                {copied ? <Check size={18} color="var(--success)" /> : <Share2 size={18} />}
                <span>{copied ? 'Đã sao chép link!' : 'Chia sẻ link phòng'}</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Cột phụ: Xem trước & Hướng dẫn test 2 máy */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
          <Sparkles size={18} color="var(--secondary)" />
          <span>Kiểm Thử Kết Nối 2 Người (Máy / Tab)</span>
        </h4>

        <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ 
              width: '24px', 
              height: '24px', 
              borderRadius: '50%', 
              background: 'rgba(99, 102, 241, 0.2)', 
              color: 'var(--primary)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontWeight: '700', 
              fontSize: '0.8rem',
              flexShrink: 0 
            }}>1</span>
            <span>Mở trang web này trên <strong>Tab 1</strong> (hoặc Máy 1) & Đăng nhập tài khoản 1 (ví dụ: Google / Trần Quang Vinh).</span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ 
              width: '24px', 
              height: '24px', 
              borderRadius: '50%', 
              background: 'rgba(6, 182, 212, 0.2)', 
              color: 'var(--secondary)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontWeight: '700', 
              fontSize: '0.8rem',
              flexShrink: 0 
            }}>2</span>
            <span>Mở cửa sổ <strong>Ẩn danh (Incognito)</strong> hoặc Máy 2 & Đăng nhập tài khoản 2 (ví dụ: Huỳnh Minh Trí hoặc Giảng viên).</span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ 
              width: '24px', 
              height: '24px', 
              borderRadius: '50%', 
              background: 'rgba(16, 185, 129, 0.2)', 
              color: 'var(--success)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontWeight: '700', 
              fontSize: '0.8rem',
              flexShrink: 0 
            }}>3</span>
            <span>Cả hai cùng bấm <strong>Tham Gia Cuộc Gọi</strong> vào cùng một phòng. Cả hai sẽ thấy camera, nghe mic và thấy tên nhau trong danh sách người gọi!</span>
          </div>
        </div>

        <div style={{ padding: '12px 14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--text-sub)' }}>Trạng thái API:</span>
            <span style={{ color: 'var(--success)', fontWeight: '600' }}>● Daily.co Sẵn Sàng</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', marginTop: '6px' }}>
            <span style={{ color: 'var(--text-sub)' }}>Xác thực:</span>
            <span style={{ color: 'var(--secondary)', fontWeight: '600' }}>● Firebase Social Auth</span>
          </div>
        </div>
      </div>
    </div>
  );
}
