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
  Sparkles
} from 'lucide-react';

export default function VideoRoom({ 
  user, 
  roomUrl, 
  roomName = 'nhom8-room-btxdpmw',
  callEngine = 'instant',
  onSwitchEngine,
  onLeaveCall 
}) {
  const containerRef = useRef(null);
  const callFrameRef = useRef(null);
  
  const [participants, setParticipants] = useState([]);
  const [callDuration, setCallDuration] = useState(0);
  const [copied, setCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('Đang kết nối vào phòng...');
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

  // Cập nhật danh sách người tham gia
  const updateParticipantsList = (callFrame) => {
    if (!callFrame) return;
    try {
      const dailyParticipants = callFrame.participants();
      const list = [];

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

  // Khởi tạo phòng gọi
  useEffect(() => {
    // CHẾ ĐỘ 1: WEBRTC INSTANT API (Miễn phí 100%, không cần thẻ Visa/Payment)
    if (callEngine === 'instant') {
      setConnectionStatus('Đã kết nối WebRTC Cloud Video thành công!');
      setJoinError(null);
      setParticipants([
        {
          id: 'local',
          name: user.displayName || 'Sinh viên Nhóm 8',
          avatar: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`,
          isLocal: true,
          audio: true,
          video: true,
          role: 'Bạn'
        }
      ]);
      return;
    }

    // CHẾ ĐỘ 2: DAILY.CO API
    if (!containerRef.current) return;

    let callFrame = null;

    try {
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
        setConnectionStatus('Đang xác thực phòng Daily...');
      });

      callFrame.on('joined-meeting', () => {
        setConnectionStatus('Đã kết nối Daily thành công!');
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
        if (e?.errorMsg?.includes('account-missing-payment-method') || e?.msg?.includes('payment')) {
          setJoinError('Daily.co yêu cầu thẻ thanh toán (Visa) để kích hoạt phòng. Bạn hãy bấm nút bên dưới để chuyển sang WebRTC Cloud API gọi ngay 100% miễn phí!');
        } else {
          setJoinError(e.errorMsg || 'Lỗi kết nối phòng Daily. Bạn có thể bấm nút dưới để chuyển sang WebRTC Cloud API gọi ngay!');
        }
      });

      callFrame.join({
        url: roomUrl,
        userName: user.displayName || 'Sinh viên Nhóm 8'
      }).catch((err) => {
        console.error('Join room failed:', err);
        setJoinError('Daily.co báo lỗi tài khoản (cần thẻ thanh toán). Hãy chuyển sang WebRTC Cloud API để gọi ngay!');
      });

    } catch (err) {
      console.error('Create callFrame failed:', err);
      setJoinError(err.message || 'Lỗi khởi tạo Daily.co frame');
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
  }, [callEngine, roomUrl, user, roomName]);

  const handleCopyLink = () => {
    const currentOrigin = window.location.origin + window.location.pathname;
    const inviteUrl = `${currentOrigin}?room=${encodeURIComponent(callEngine === 'daily' ? roomUrl : roomName)}`;
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

  // URL nhúng WebRTC Cloud API (sử dụng server fairmeeting.net không yêu cầu tài khoản Host/Moderator)
  const cleanRoomCode = (roomName || 'nhom8-room-btxdpmw').replace(/[^a-zA-Z0-9_-]/g, '_');
  const webRtcUrl = `https://fairmeeting.net/${cleanRoomCode}#userInfo.displayName=${encodeURIComponent(JSON.stringify(user.displayName || 'Nhóm 8'))}&config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false`;

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

          <span className="badge badge-cyan" style={{ fontSize: '0.78rem' }}>
            {callEngine === 'instant' ? '⚡ WebRTC Cloud API' : '📹 Daily.co API'}
          </span>

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

      {/* Hiển thị lỗi nếu Daily đòi thẻ Visa và có nút chuyển ngay sang WebRTC */}
      {joinError && (
        <div style={{ 
          padding: '12px 20px', 
          background: 'var(--danger-bg)', 
          borderBottom: '1px solid var(--danger)', 
          color: '#fca5a5', 
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{joinError}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {onSwitchEngine && (
              <button 
                className="btn btn-primary btn-sm" 
                onClick={() => onSwitchEngine('instant')}
              >
                <Sparkles size={14} />
                <span>Chuyển sang WebRTC Cloud để gọi ngay!</span>
              </button>
            )}
            <button className="btn btn-secondary btn-sm" onClick={handleLeave}>Quay Lại Sảnh</button>
          </div>
        </div>
      )}

      {/* Vùng gọi Video và Danh sách người gọi */}
      <div className="video-layout">
        {callEngine === 'instant' ? (
          <div className="video-frame-wrap" style={{ position: 'relative' }}>
            <iframe
              src={webRtcUrl}
              allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
              style={{ width: '100%', height: '100%', border: 'none', background: '#0a0e17' }}
              title="WebRTC Video Meeting"
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
              💡 Mở tab ẩn danh hoặc máy 2 cùng vào mã phòng này để kết nối video cùng lúc!
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
