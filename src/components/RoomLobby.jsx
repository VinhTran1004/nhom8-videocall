import React, { useState } from 'react';
import { 
  Video, 
  LogIn, 
  Share2, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Radio
} from 'lucide-react';

export default function RoomLobby({ 
  user, 
  onOpenLogin, 
  roomUrl, 
  setRoomUrl, 
  roomName,
  setRoomName,
  callEngine,
  setCallEngine,
  onJoinCall 
}) {
  const [copied, setCopied] = useState(false);

  // Tạo link chia sẻ để người thứ 2 mở ra là có sẵn phòng
  const handleCopyInviteLink = () => {
    const currentOrigin = window.location.origin + window.location.pathname;
    const inviteUrl = `${currentOrigin}?room=${encodeURIComponent(roomName || 'nhom8-room-btxdpmw')}`;
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

            {/* Ô nhập mã phòng gọi WebRTC P2P */}
            <div className="input-group">
              <label className="input-label">Mã Phòng Gọi (Room ID):</label>
              <input 
                type="text" 
                className="custom-input" 
                value={roomName || 'nhom8-room-btxdpmw'} 
                onChange={(e) => setRoomName && setRoomName(e.target.value)} 
                placeholder="nhom8-room-btxdpmw"
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={14} />
                Chỉ cần 2 máy vào cùng mã phòng này là sẽ tự động kết nối thấy nhau ngay lập tức!
              </span>
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
            <span>Mở web trên <strong>Tab 1</strong> & Đăng nhập (ví dụ: Google / Trần Quang Vinh), bấm <strong>Tham gia cuộc gọi</strong>.</span>
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
            <span>Mở tab <strong>Ẩn danh (Ctrl + Shift + N)</strong> hoặc Điện thoại & Đăng nhập (ví dụ: GitHub / Huỳnh Minh Trí).</span>
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
            <span>Cả hai cùng bấm <strong>Tham Gia Cuộc Gọi</strong>. Hai máy lập tức kết nối video, thấy hình và nghe tiếng của nhau!</span>
          </div>
        </div>

        <div style={{ padding: '12px 14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--text-sub)' }}>Công nghệ Video:</span>
            <span style={{ color: 'var(--success)', fontWeight: '600' }}>● WebRTC P2P (Trực tiếp)</span>
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
