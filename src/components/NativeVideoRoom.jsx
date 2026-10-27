import React, { useEffect, useRef, useState } from 'react';
import { Peer } from 'peerjs';
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
  Monitor,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function NativeVideoRoom({ user, roomName = 'nhom8-room-btxdpmw', onLeaveCall }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const currentCallRef = useRef(null);

  const [callDuration, setCallDuration] = useState(0);
  const [copied, setCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('Đang khởi tạo WebRTC Camera...');
  const [remoteParticipant, setRemoteParticipant] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

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

  // Tự động gán stream của người kia vào thẻ video khi remoteStream thay đổi
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch((e) => console.warn('Play remote video:', e));
    }
  }, [remoteStream, remoteParticipant]);

  // Khởi tạo WebRTC Media và PeerJS connection
  useEffect(() => {
    let localStream = null;
    let peer = null;
    let isSubscribed = true;

    const cleanRoom = (roomName || 'nhom8-room-btxdpmw')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');

    const hostPeerId = `nhom8_${cleanRoom}_host`;
    const guestPeerId = `nhom8_${cleanRoom}_guest_${Math.floor(Math.random() * 100000)}`;

    const startWebRTC = async () => {
      try {
        setConnectionStatus('Đang xin quyền mở Camera & Micro...');
        // 1. Mở Camera & Mic của người dùng
        localStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true
        });

        if (!isSubscribed) return;
        localStreamRef.current = localStream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        setConnectionStatus('Đang kết nối vào phòng gọi WebRTC...');

        // 2. Thử đóng vai trò Host trước
        peer = new Peer(hostPeerId, {
          host: '0.peerjs.com',
          port: 443,
          secure: true,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' }
            ]
          }
        });

        peerRef.current = peer;

        peer.on('open', (id) => {
          if (!isSubscribed) return;
          console.log('Peer connected as Host:', id);
          setConnectionStatus('Bạn đang trong phòng. Đang chờ người thứ 2 vào...');
        });

        // Xử lý khi có người khác gọi đến (Host nhận cuộc gọi từ Guest)
        peer.on('call', (incomingCall) => {
          console.log('Incoming call from guest');
          currentCallRef.current = incomingCall;
          incomingCall.answer(localStream);

          incomingCall.on('stream', (incomingStream) => {
            if (!isSubscribed) return;
            console.log('Received remote stream from guest');
            setRemoteStream(incomingStream);
            const callerName = incomingCall.metadata?.name || 'Huỳnh Minh Trí (Nhóm 8)';
            setRemoteParticipant({
              id: incomingCall.peer,
              name: callerName,
              avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${callerName}`,
              audio: true,
              video: true,
              role: 'Thành viên'
            });
            setConnectionStatus('Đã kết nối với người thứ 2 thành công!');
          });

          incomingCall.on('close', () => {
            setRemoteParticipant(null);
            setRemoteStream(null);
            setConnectionStatus('Người tham gia đã rời phòng. Đang chờ người khác...');
          });
        });

        // Nếu ID Host đã có người chiếm (nghĩa là đã có người vào phòng trước đó):
        peer.on('error', async (err) => {
          if (err.type === 'unavailable-id') {
            console.log('Host ID taken, joining as Guest and calling Host...');
            peer.destroy();

            // Khởi tạo Peer với vai trò Guest
            const guestPeer = new Peer(guestPeerId, {
              host: '0.peerjs.com',
              port: 443,
              secure: true,
              config: {
                iceServers: [
                  { urls: 'stun:stun.l.google.com:19302' },
                  { urls: 'stun:global.stun.twilio.com:3478' }
                ]
              }
            });

            peerRef.current = guestPeer;

            guestPeer.on('open', (gId) => {
              if (!isSubscribed) return;
              console.log('Guest peer opened:', gId);
              setConnectionStatus('Đang gọi đến người thứ nhất trong phòng...');

              // Gọi trực tiếp đến Host
              const call = guestPeer.call(hostPeerId, localStream, {
                metadata: {
                  name: user.displayName || 'Trần Quang Vinh (Nhóm 8)',
                  email: user.email,
                  avatar: user.photoURL
                }
              });

              currentCallRef.current = call;

              call.on('stream', (hostStream) => {
                if (!isSubscribed) return;
                console.log('Received host stream');
                setRemoteStream(hostStream);
                setRemoteParticipant({
                  id: hostPeerId,
                  name: 'Trần Quang Vinh (Nhóm 8)',
                  avatar: `https://api.dicebear.com/7.x/initials/svg?seed=Vinh`,
                  audio: true,
                  video: true,
                  role: 'Chủ phòng'
                });
                setConnectionStatus('Đã kết nối với người trong phòng thành công!');
              });

              call.on('close', () => {
                setRemoteParticipant(null);
                setRemoteStream(null);
                setConnectionStatus('Chủ phòng đã rời cuộc gọi.');
              });
            });

            guestPeer.on('error', (gErr) => {
              console.error('Guest peer error:', gErr);
              setErrorMsg('Lỗi kết nối WebRTC signaling. Hãy thử tải lại trang!');
            });

          } else {
            console.error('Peer error:', err);
            setErrorMsg(err.message || 'Lỗi kết nối WebRTC');
          }
        });

      } catch (mediaErr) {
        console.error('Media devices error:', mediaErr);
        setErrorMsg('Không thể mở Camera/Micro. Vui lòng bấm Cho Phép Camera trong trình duyệt!');
      }
    };

    startWebRTC();

    return () => {
      isSubscribed = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (currentCallRef.current) {
        currentCallRef.current.close();
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [roomName, user]);

  // Bật/tắt Micro
  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicMuted(!audioTrack.enabled);
      }
    }
  };

  // Bật/tắt Camera
  const toggleCam = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCamOff(!videoTrack.enabled);
      }
    }
  };

  // Chia sẻ màn hình (Screen Share)
  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        if (currentCallRef.current?.peerConnection) {
          const sender = currentCallRef.current.peerConnection
            .getSenders()
            .find((s) => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        }

        screenTrack.onended = () => {
          stopScreenShare();
        };

        setIsScreenSharing(true);
      } else {
        stopScreenShare();
      }
    } catch (err) {
      console.warn('Screen share canceled or failed:', err);
    }
  };

  const stopScreenShare = () => {
    if (localStreamRef.current && localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
      const originalVideoTrack = localStreamRef.current.getVideoTracks()[0];
      if (currentCallRef.current?.peerConnection && originalVideoTrack) {
        const sender = currentCallRef.current.peerConnection
          .getSenders()
          .find((s) => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(originalVideoTrack);
        }
      }
    }
    setIsScreenSharing(false);
  };

  const handleCopyLink = () => {
    const currentOrigin = window.location.origin + window.location.pathname;
    const inviteUrl = `${currentOrigin}?room=${encodeURIComponent(roomName)}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (currentCallRef.current) {
      currentCallRef.current.close();
    }
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    onLeaveCall();
  };

  // Danh sách người tham gia hiển thị trên sidebar
  const participantList = [
    {
      id: 'local',
      name: user.displayName || 'Bạn',
      avatar: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`,
      isLocal: true,
      audio: !micMuted,
      video: !camOff,
      role: 'Bạn'
    }
  ];

  if (remoteParticipant) {
    participantList.push(remoteParticipant);
  }

  return (
    <div className="glass-card video-room-container">
      {/* Topbar điều khiển & Thông tin phòng */}
      <div className="video-room-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#ffffff' }}>
              Phòng Gọi Video WebRTC - Nhóm 8
            </h3>
          </div>

          <div className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={12} />
            <span>{formatDuration(callDuration)}</span>
          </div>

          <span className="badge badge-cyan" style={{ fontSize: '0.78rem' }}>
            ⚡ Native WebRTC P2P
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
            <span>DS Người Gọi ({participantList.length})</span>
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

      {errorMsg && (
        <div style={{ 
          padding: '10px 20px', 
          background: 'var(--danger-bg)', 
          borderBottom: '1px solid var(--danger)', 
          color: '#fca5a5', 
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Vùng Video Grid & Sidebar */}
      <div className="video-layout">
        {/* KHUNG VIDEO GRID CHÍNH */}
        <div className="video-frame-wrap" style={{ display: 'flex', flexDirection: 'column', padding: '16px', gap: '16px', background: '#090d16', justifyContent: 'center' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: remoteParticipant ? '1fr 1fr' : '1fr',
            gap: '16px',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            maxHeight: 'calc(100% - 70px)'
          }}>
            {/* VIDEO CỦA BẠN (LOCAL) */}
            <div style={{
              position: 'relative',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              background: '#131b2e',
              border: '2px solid rgba(99, 102, 241, 0.4)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              height: '100%',
              minHeight: '260px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <video 
                ref={localVideoRef} 
                autoPlay 
                playsInline 
                muted 
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: isScreenSharing ? 'none' : 'scaleX(-1)' }} 
              />
              
              {camOff && (
                <div style={{ position: 'absolute', inset: 0, background: '#111827', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <img src={user.photoURL} alt={user.displayName} style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--primary)' }} />
                  <span style={{ fontWeight: '600', color: '#fff' }}>Camera đang tắt</span>
                </div>
              )}

              {/* Tên người dùng hiển thị trực tiếp trên góc video (Theo yêu cầu đề bài) */}
              <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(8px)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: '700',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <span>{user.displayName} (Bạn)</span>
                {micMuted && <MicOff size={14} color="var(--danger)" />}
              </div>
            </div>

            {/* VIDEO CỦA THÀNH VIÊN KHÁC (REMOTE) */}
            {remoteParticipant ? (
              <div style={{
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                background: '#131b2e',
                border: '2px solid rgba(6, 182, 212, 0.4)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                height: '100%',
                minHeight: '260px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <video 
                  ref={remoteVideoRef} 
                  autoPlay 
                  playsInline 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />

                {/* Tên của thành viên tham gia hiển thị trên góc video */}
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  background: 'rgba(0, 0, 0, 0.7)',
                  backdropFilter: 'blur(8px)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#22d3ee',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  border: '1px solid rgba(6, 182, 212, 0.3)'
                }}>
                  <span>{remoteParticipant.name}</span>
                </div>
              </div>
            ) : (
              <div style={{
                borderRadius: 'var(--radius-lg)',
                border: '2px dashed rgba(255, 255, 255, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                textAlign: 'center',
                gap: '12px',
                color: 'var(--text-muted)'
              }}>
                <Users size={48} style={{ opacity: 0.4 }} />
                <div>
                  <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: '700' }}>Đang đợi thành viên khác tham gia...</h4>
                  <p style={{ fontSize: '0.85rem', marginTop: '4px', maxWidth: '320px' }}>
                    Mở thêm 1 tab Ẩn danh (hoặc điện thoại), đăng nhập tài khoản thứ 2 và vào cùng phòng này!
                  </p>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={handleCopyLink}>
                  <Share2 size={14} />
                  <span>Sao chép link mời</span>
                </button>
              </div>
            )}
          </div>

          {/* THANH ĐIỀU KHIỂN DƯỚI CÙNG */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            padding: '10px',
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(12px)',
            borderRadius: 'var(--radius-full)',
            width: 'fit-content',
            margin: '0 auto',
            border: '1px solid var(--card-border)'
          }}>
            <button 
              className={`btn ${micMuted ? 'btn-danger' : 'btn-secondary'} btn-sm`}
              onClick={toggleMic}
              style={{ borderRadius: '50%', width: '42px', height: '42px', padding: 0 }}
              title={micMuted ? 'Bật Micro' : 'Tắt Micro'}
            >
              {micMuted ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <button 
              className={`btn ${camOff ? 'btn-danger' : 'btn-secondary'} btn-sm`}
              onClick={toggleCam}
              style={{ borderRadius: '50%', width: '42px', height: '42px', padding: 0 }}
              title={camOff ? 'Bật Camera' : 'Tắt Camera'}
            >
              {camOff ? <VideoOff size={18} /> : <Video size={18} />}
            </button>

            <button 
              className={`btn ${isScreenSharing ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={toggleScreenShare}
              style={{ borderRadius: '50%', width: '42px', height: '42px', padding: 0 }}
              title={isScreenSharing ? 'Dừng chia sẻ màn hình' : 'Chia sẻ màn hình'}
            >
              <Monitor size={18} />
            </button>

            <button 
              className="btn btn-danger btn-sm" 
              onClick={handleLeave}
              style={{ borderRadius: 'var(--radius-full)', padding: '8px 18px' }}
              title="Rời cuộc gọi"
            >
              <PhoneOff size={16} />
              <span>Rời Phòng</span>
            </button>
          </div>
        </div>

        {/* DANH SÁCH NGƯỜI GỌI THEO TÊN ĐÃ NHẬN KHI ĐĂNG NHẬP (Theo đúng yêu cầu đề bài) */}
        {sidebarOpen && (
          <aside className="participants-sidebar">
            <div className="participants-header">
              <h3>
                <Users size={18} color="var(--secondary)" />
                <span>Danh Sách Người Gọi</span>
              </h3>
              <span className="badge badge-cyan">
                {participantList.length} Online
              </span>
            </div>

            <div style={{ padding: '8px 14px', background: 'rgba(99, 102, 241, 0.08)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Đồng bộ tên: <strong>{user.displayName}</strong>
            </div>

            <div className="participants-list">
              {participantList.map((p) => (
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
                        {p.role || (p.isLocal ? 'Tài khoản của bạn' : 'Đang kết nối')}
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
              💡 Mở thêm 1 tab ẩn danh hoặc máy 2 vào link này để kết nối video cùng lúc!
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
