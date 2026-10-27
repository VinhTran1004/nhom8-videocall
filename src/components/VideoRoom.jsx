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
  AlertCircle
} from 'lucide-react';

export default function VideoRoom({ user, roomUrl, onLeaveCall }) {
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
    if (!containerRef.current) return;

    let callFrame = null;

    try {
      callFrame = DailyIframe.createFrame(containerRef.current, {
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: 'none',
          backgroundColor: '#0a0e17'
        },
        showLeaveButton: false, // Quản lý nút rời phòng riêng
        showFullscreenButton: true,
      });

      callFrameRef.current = callFrame;

      // Đăng ký các sự kiện theo dõi danh sách người gọi
      callFrame.on('joining-meeting', () => {
        setConnectionStatus('Đang xác thực và vào cuộc họp...');
      });

      callFrame.on('joined-meeting', (event) => {
        setConnectionStatus('Đã kết nối thành công!');
        updateParticipantsList(callFrame);
      });

      callFrame.on('participant-joined', (event) => {
        updateParticipantsList(callFrame);
      });

      callFrame.on('participant-updated', (event) => {
        updateParticipantsList(callFrame);
      });

      callFrame.on('participant-left', (event) => {
        updateParticipantsList(callFrame);
      });

      callFrame.on('left-meeting', () => {
        onLeaveCall();
      });

      callFrame.on('error', (e) => {
        console.error('Daily error event:', e);
        setJoinError(e.errorMsg || 'Không thể kết nối đến phòng Daily này. Hãy kiểm tra lại Room URL!');
      });

      // Bắt đầu join phòng với Tên đã nhận từ đăng nhập mạng xã hội
      callFrame.join({
        url: roomUrl,
        userName: user.displayName || 'Sinh viên Nhóm 8',
        userData: {
          avatar: user.photoURL,
          email: user.email,
          provider: user.provider
        }
      }).catch((err) => {
        console.error('Join room failed:', err);
        setJoinError('Lỗi kết nối phòng Daily. Vui lòng kiểm tra URL phòng trong phần Cài Đặt hoặc tạo phòng mới tại dashboard.daily.co');
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
  }, [roomUrl, user]);

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
      } catch (e) {
        console.warn(e);
      }
    }
    onLeaveCall();
  };

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

      {joinError && (
        <div style={{ 
          padding: '12px 20px', 
          background: 'var(--danger-bg)', 
          borderBottom: '1px solid var(--danger)', 
          color: '#fca5a5', 
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{joinError}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleLeave}>Quay Lại Sảnh</button>
        </div>
      )}

      {/* Vùng gọi Video và Danh sách người gọi */}
      <div className="video-layout">
        {/* Khung iframe Daily.co */}
        <div className="video-frame-wrap" ref={containerRef} />

        {/* DANH SÁCH NGƯỜI GỌI THEO TÊN ĐÃ NHẬN KHI ĐĂNG NHẬP (Theo đúng yêu cầu đề bài) */}
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
              Đồng bộ tên từ tài khoản Google/Mạng xã hội đã đăng nhập
            </div>

            <div className="participants-list">
              {participants.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-sub)', fontSize: '0.85rem' }}>
                  Đang đồng bộ người tham gia...
                </div>
              ) : (
                participants.map((p) => (
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
                ))
              )}
            </div>

            <div style={{ padding: '12px 14px', borderTop: '1px solid var(--card-border)', fontSize: '0.75rem', color: 'var(--text-sub)', textAlign: 'center' }}>
              💡 Mở thêm 1 tab ẩn danh hoặc máy khác và đăng nhập để thấy thêm người trong danh sách!
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
