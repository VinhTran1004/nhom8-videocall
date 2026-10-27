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
  Monitor,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function NativeVideoRoom({ user, roomName = 'nhom8-room-btxdpmw', onLeaveCall }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const activeCallRef = useRef(null);
  const wsRef = useRef(null);

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

  // Tự động gán stream của người kia vào thẻ video khi remoteStream sẵn sàng
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch((e) => console.warn('Play remote video error:', e));
    }
  }, [remoteStream, remoteParticipant]);

  // Khởi tạo WebRTC Media và Signaling qua WebSocket
  useEffect(() => {
    let localStream = null;
    let peer = null;
    let ws = null;
    let announceInterval = null;
    let isSubscribed = true;

    const cleanRoom = (roomName || 'nhom8-room-btxdpmw')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');

    // Tạo ID ngẫu nhiên duy nhất cho mỗi phiên gọi để không bao giờ bị trùng (tránh lỗi ID unavailable)
    const myPeerId = `nhom8_${cleanRoom}_${Math.random().toString(36).substring(2, 9)}`;
    const signalTopic = `nhom8_signal_${cleanRoom}`;

    const setupCallHandlers = (call, peerName) => {
      activeCallRef.current = call;

      call.on('stream', (incomingStream) => {
        if (!isSubscribed) return;
        console.log('Received remote media stream from:', peerName);
        setRemoteStream(incomingStream);
        setRemoteParticipant({
          id: call.peer,
          name: peerName || call.metadata?.name || 'Thành viên Nhóm 8',
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${peerName || 'Member'}`,
          audio: true,
          video: true,
          role: 'Thành viên'
        });
        setConnectionStatus('Đã kết nối với người thứ 2 thành công!');
      });

      call.on('close', () => {
        if (!isSubscribed) return;
        setRemoteParticipant(null);
        setRemoteStream(null);
        setConnectionStatus('Người tham gia đã rời cuộc gọi.');
      });

      call.on('error', (err) => {
        console.warn('Call error:', err);
      });
    };

    const startWebRTC = async () => {
      try {
        setConnectionStatus('Đang xin quyền mở Camera & Micro...');
        // 1. Mở Camera & Mic cục bộ
        localStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true
        });

        if (!isSubscribed) return;
        localStreamRef.current = localStream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        setConnectionStatus('Đang kết nối vào máy chủ WebRTC...');

        // 2. Khởi tạo PeerJS với ID ngẫu nhiên đảm bảo 100% kết nối thành công
        peer = new Peer(myPeerId, {
          host: '0.peerjs.com',
          port: 443,
          secure: true,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' }
            ]
          }
        });

        peerRef.current = peer;

        peer.on('open', (id) => {
          if (!isSubscribed) return;
          console.log('Peer connected with unique ID:', id);
          setConnectionStatus('Đang trong phòng. Đang tìm người thứ 2...');

          // 3. Kết nối kênh WebSocket Signaling tự động phát hiện người vào phòng
          try {
            ws = new WebSocket(`wss://ntfy.sh/${signalTopic}/ws`);
            wsRef.current = ws;

            ws.onopen = () => {
              console.log('Signaling WebSocket connected to:', signalTopic);
              // Phát thông báo mình đã vào phòng
              broadcastPresence('join');
            };

            ws.onmessage = (event) => {
              if (!isSubscribed) return;
              try {
                const message = JSON.parse(event.data);
                if (message.event === 'message' && message.message) {
                  const data = JSON.parse(message.message);
                  
                  // Bỏ qua tin nhắn từ chính mình
                  if (data.peerId === myPeerId) return;

                  if (data.type === 'join' || data.type === 'announce') {
                    console.log('Discovered peer in room:', data.peerId, data.name);
                    
                    // Thỏa thuận: Peer nào có chuỗi ID nhỏ hơn sẽ chủ động thực hiện cuộc gọi
                    if (myPeerId < data.peerId && !activeCallRef.current) {
                      console.log('Initiating call to peer:', data.peerId);
                      const call = peer.call(data.peerId, localStream, {
                        metadata: {
                          name: user.displayName || 'Thành viên Nhóm 8',
                          avatar: user.photoURL
                        }
                      });
                      setupCallHandlers(call, data.name);
                    }
                  } else if (data.type === 'leave') {
                    if (remoteParticipant?.id === data.peerId) {
                      setRemoteParticipant(null);
                      setRemoteStream(null);
                      setConnectionStatus('Thành viên đã rời phòng.');
                    }
                  }
                }
              } catch (e) {
                // Ignore non-json signaling frames
              }
            };
          } catch (wsErr) {
            console.warn('Signaling WebSocket error:', wsErr);
          }

          // Định kỳ thông báo sự hiện diện mỗi 3 giây để người mới vào bắt được ngay
          announceInterval = setInterval(() => {
            broadcastPresence('announce');
          }, 3000);
        });

        // 4. Lắng nghe cuộc gọi đến
        peer.on('call', (incomingCall) => {
          console.log('Received incoming call from peer:', incomingCall.peer);
          incomingCall.answer(localStream);
          const callerName = incomingCall.metadata?.name || 'Thành viên Nhóm 8';
          setupCallHandlers(incomingCall, callerName);
        });

        peer.on('error', (err) => {
          console.error('Peer error:', err);
          setErrorMsg(err.message || 'Lỗi kết nối WebRTC');
        });

      } catch (mediaErr) {
        console.error('Media devices error:', mediaErr);
        setErrorMsg('Không thể mở Camera/Micro. Vui lòng bấm Cho Phép Camera trong trình duyệt!');
      }
    };

    const broadcastPresence = (type) => {
      fetch(`https://ntfy.sh/${signalTopic}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: type,
          peerId: myPeerId,
          name: user.displayName || 'Thành viên Nhóm 8',
          avatar: user.photoURL,
          time: Date.now()
        })
      }).catch((e) => console.warn('Broadcast presence error:', e));
    };

    startWebRTC();

    return () => {
      isSubscribed = false;
      if (announceInterval) clearInterval(announceInterval);
      broadcastPresence('leave');

      if (wsRef.current) {
        try { wsRef.current.close(); } catch (e) {}
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (activeCallRef.current) {
        try { activeCallRef.current.close(); } catch (e) {}
      }
      if (peerRef.current) {
        try { peerRef.current.destroy(); } catch (e) {}
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

        if (activeCallRef.current?.peerConnection) {
          const sender = activeCallRef.current.peerConnection
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
      if (activeCallRef.current?.peerConnection && originalVideoTrack) {
        const sender = activeCallRef.current.peerConnection
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
    if (activeCallRef.current) {
      try { activeCallRef.current.close(); } catch (e) {}
    }
    if (peerRef.current) {
      try { peerRef.current.destroy(); } catch (e) {}
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
            ⚡ WebRTC P2P Realtime
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
                    Mở thêm 1 tab Ẩn danh (hoặc điện thoại), đăng nhập tài khoản thứ 2 và vào cùng mã phòng này!
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
