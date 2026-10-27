import React, { useEffect, useRef, useState } from 'react';
import DailyIframe from '@daily-co/daily-js';
import { 
  Users, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Share2, 
  Check, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  ShieldCheck,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export default function VideoRoom({ user, roomUrl, onLeaveCall }) {
  const containerRef = useRef(null);
  const callFrameRef = useRef(null);
  
  const [participants, setParticipants] = useState([]);
  const [callDuration, setCallDuration] = useState(0);
  const [copied, setCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('Đang kết nối vào phòng...');
  const [useDirectIframe, setUseDirectIframe] = useState(false);
  const [joinError, setJoinError] = useState(null);

  // Bộ đếm thời gian cuộc gọi
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cập nhật danh sách người tham gia từ Daily Call Frame
  const updateParticipantsList = (callFrame) => {
    if (!callFrame) return;
    try {
      const dailyParticipants = callFrame.participants();
      const list = [];

      // Người dùng hiện tại (Local)
      if (dailyParticipants.local) {
        list.push({
          id: 'local',
          name: dailyParticipants.local.user_name || user.displayName || 'Bạn',
          avatar: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`,
          isLocal: true,
          audio: dailyParticipants.local.audio,
          video: dailyParticipants.local.video,
          role: 'Bạn'
        });
      }

      // Những người tham gia khác (Remote participants)
      Object.entries(dailyParticipants).forEach(([id, p]) => {
        if (id !== 'local') {
          list.push({
            id: p.session_id || id,
            name: p.user_name || 'Khách tham dự',
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${p.user_name || id}`,
            isLocal: false,
            audio: p.audio,
            video: p.video,
            role: 'Thành viên'
          });
        }
      });

      setParticipants(list);
    } catch (err) {
      console.warn('Lỗi khi lấy danh sách người tham gia:', err);
    }
  };

  // Khởi tạo Daily Iframe
  useEffect(() => {
    if (useDirectIframe) {
      setConnectionStatus('Đang kết nối phòng Daily qua chế độ Trực Tiếp...');
      setParticipants([
        {
          id: 'local',
          name: user.displayName || 'Bạn',
          avatar: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`,
          isLocal: true,
          audio: true,
          video: true,
          role: 'Bạn'
        }
      ]);
      return;
    }

    if (!containerRef.current) return;

    let callFrame = null;

    try {
      // Hủy instance cũ nếu có trước khi tạo mới để tránh xung đột
      const existing = DailyIframe.getCallInstance();
      if (existing) {
        try {
          existing.destroy();
        } catch (e) {
          console.warn(e);
        }
      }

      callFrame = DailyIframe.createFrame(containerRef.current, {
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: 'none',
          backgroundColor: '#0a0e17'
        },
        showLeaveButton: false,
        showFullscreenButton: true,
      });

      callFrameRef.current = callFrame;

      callFrame.on('joining-meeting', () => {
        setConnectionStatus('Đang xác thực và vào cuộc họp...');
      });

      callFrame.on('joined-meeting', () => {
        setConnectionStatus('Đã kết nối thành công!');
        updateParticipantsList(callFrame);
      });

      callFrame.on('participant-joined', () => {
        updateParticipantsList(callFrame);
      });

      callFrame.on('participant-updated', () => {
        updateParticipantsList(callFrame);
      });

      callFrame.on('participant-left', () => {
        updateParticipantsList(callFrame);
      });

      callFrame.on('left-meeting', () => {
        onLeaveCall();
      });

      callFrame.on('error', (e) => {
        console.error('Daily error event:', e);
        // Tự động chuyển sang chế độ direct iframe nếu SDK gặp lỗi bảo mật COOP
        setUseDirectIframe(true);
      });

      // Join phòng chỉ truyền url và userName chuẩn của Daily
      callFrame.join({
        url: roomUrl,
        userName: user.displayName || 'Sinh viên Nhóm 8'
      }).catch((err) => {
        console.error('Join room failed, switching to direct iframe mode:', err);
        setUseDirectIframe(true);
      });

    } catch (err) {
      console.error('Create callFrame failed:', err);
      setUseDirectIframe(true);
    }

    return () => {
      if (callFrame) {
        try {
          callFrame.leave();
          callFrame.destroy();
        } catch (e) {
          console.warn('Destroy frame warning:', e);
        }
      }
    };
  }, [roomUrl, user, useDirectIframe]);

  const handleCopyLink = () => {
    const currentOrigin = window.location.origin + window.location.pathname;
    const inviteUrl = `${currentOrigin}?room=${encodeURIComponent(roomUrl)}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    if (callFrameRef.current) {
      try {
        callFrameRef.current.leave();
        callFrameRef.current.destroy();
      } catch (e) {
        console.warn(e);
      }
    }
    onLeaveCall();
  };

  // Link trực tiếp nhúng Daily Prebuilt
  const directEmbedUrl = `${roomUrl}?userName=${encodeURIComponent(user.displayName || 'Nhóm 8')}`;

  return (
    <div className="glass-card video-room-container">
      {/* Topbar điều khiển & Thông tin phòng */}
      <div className="video-room-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#ffffff' }}>
              Phòng Gọi Video Nhóm 8
            </h3>
          </div>

          <div className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={12} />
            <span>{formatDuration(callDuration)}</span>
          </div>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
            {connectionStatus}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={handleCopyLink}
            title="Sao chép link mời người khác vào phòng này"
          >
            {copied ? <Check size={14} color="var(--success)" /> : <Share2 size={14} />}
            <span>{copied ? 'Đã sao chép' : 'Mời bạn'}</span>
          </button>

          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Bật/Tắt danh sách người gọi"
          >
            <Users size={14} />
            <span>DS Người Gọi ({participants.length})</span>
            {sidebarOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          <button 
            className="btn btn-danger btn-sm" 
            onClick={handleLeave}
            title="Rời khỏi cuộc gọi"
          >
            <PhoneOff size={14} />
            <span>Rời Phòng</span>
          </button>
        </div>
      </div>

      {/* Vùng gọi Video và Danh sách người gọi */}
      <div className="video-layout">
        {useDirectIframe ? (
          <div className="video-frame-wrap" style={{ position: 'relative' }}>
            <iframe
              src={directEmbedUrl}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              style={{ width: '100%', height: '100%', border: 'none', background: '#0a0e17' }}
              title="Daily.co Video Room"
            />
          </div>
        ) : (
          <div className="video-frame-wrap" ref={containerRef} />
        )}

        {/* DANH SÁCH NGƯỜI GỌI THEO TÊN ĐÃ NHẬN KHI ĐĂNG NHẬP */}
        {sidebarOpen && (
          <aside className="participants-sidebar">
            <div className="participants-header">
              <h3>
                <Users size={18} color="var(--secondary)" />
                <span>Danh Sách Người Gọi</span>
              </h3>
              <span className="badge badge-cyan">
                {participants.length} Online
              </span>
            </div>

            <div style={{ padding: '8px 14px', background: 'rgba(99, 102, 241, 0.08)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Đồng bộ tên: <strong>{user.displayName}</strong>
            </div>

            <div className="participants-list">
              {participants.map((p) => (
                <div key={p.id} className="participant-item">
                  <div className="participant-user">
                    <div className="participant-avatar-wrap">
                      <img 
                        src={p.avatar} 
                        alt={p.name} 
                        className="participant-avatar"
                        onError={(e) => {
                          e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${p.name}`;
                        }}
                      />
                      <span className="participant-online-dot" />
                    </div>
                    
                    <div className="participant-name-wrap">
                      <span className="participant-name">
                        {p.name}
                        {p.isLocal && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--secondary)', fontWeight: '600' }}>
                            (Bạn)
                          </span>
                        )}
                      </span>
                      <span className="participant-role">
                        {p.isLocal ? 'Tài khoản hiện tại' : 'Đang kết nối'}
                      </span>
                    </div>
                  </div>

                  <div className="participant-controls-status">
                    <div 
                      className={`status-icon ${p.audio ? 'on' : 'off'}`}
                      title={p.audio ? 'Micro đang bật' : 'Micro đang tắt'}
                    >
                      {p.audio ? <Mic size={14} /> : <MicOff size={14} />}
                    </div>
                    <div 
                      className={`status-icon ${p.video ? 'on' : 'off'}`}
                      title={p.video ? 'Camera đang bật' : 'Camera đang tắt'}
                    >
                      {p.video ? <Video size={14} /> : <VideoOff size={14} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '12px 14px', borderTop: '1px solid var(--card-border)', fontSize: '0.75rem', color: 'var(--text-sub)', textAlign: 'center' }}>
              💡 Mở tab ẩn danh hoặc máy 2 vào link này để kết nối cùng lúc!
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
