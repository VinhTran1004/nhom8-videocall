import React, { useState } from 'react';
import { 
  getActiveFirebaseConfig, 
  saveCustomFirebaseConfig, 
  resetFirebaseConfig 
} from '../services/firebase';
import { 
  getDailyApiKey, 
  saveDailyApiKey, 
  getSavedDailyRoom, 
  saveDailyRoom,
  createDailyRoomApi 
} from '../services/daily';
import { Settings, X, Save, RotateCcw, Plus, CheckCircle, ExternalLink } from 'lucide-react';

export default function ConfigModal({ isOpen, onClose, onRoomUpdated }) {
  const currentFb = getActiveFirebaseConfig();
  const [apiKey, setApiKey] = useState(currentFb.apiKey || '');
  const [authDomain, setAuthDomain] = useState(currentFb.authDomain || '');
  const [projectId, setProjectId] = useState(currentFb.projectId || '');
  const [appId, setAppId] = useState(currentFb.appId || '');

  const [dailyRoomUrl, setDailyRoomUrl] = useState(getSavedDailyRoom());
  const [dailyApiKey, setDailyApiKeyState] = useState(getDailyApiKey());
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  if (!isOpen) return null;

  const handleSaveAll = (e) => {
    e.preventDefault();
    saveDailyRoom(dailyRoomUrl);
    saveDailyApiKey(dailyApiKey);

    const customFb = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      appId: appId.trim()
    };
    saveCustomFirebaseConfig(customFb);
    if (onRoomUpdated) onRoomUpdated(dailyRoomUrl);
    setStatusMsg({ type: 'success', text: 'Đã lưu cấu hình thành công!' });
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleCreateRoomWithApi = async () => {
    if (!dailyApiKey) {
      setStatusMsg({ type: 'error', text: 'Vui lòng nhập Daily API Key để tự tạo phòng mới!' });
      return;
    }
    setIsCreatingRoom(true);
    setStatusMsg(null);
    try {
      const roomName = 'nhom8-room-' + Math.floor(Math.random() * 10000);
      const url = await createDailyRoomApi(roomName, dailyApiKey);
      setDailyRoomUrl(url);
      saveDailyRoom(url);
      if (onRoomUpdated) onRoomUpdated(url);
      setStatusMsg({ type: 'success', text: `Đã tạo phòng thành công: ${url}` });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Lỗi khi tạo phòng Daily' });
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleReset = () => {
    resetFirebaseConfig();
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Settings size={24} color="var(--primary)" />
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Cấu Hình Hệ Thống</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Tùy chỉnh thông số Daily.co Video API và Firebase Auth cho Nhóm 8
            </p>
          </div>
        </div>

        {statusMsg && (
          <div style={{
            padding: '10px 14px',
            marginBottom: '16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            background: statusMsg.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
            color: statusMsg.type === 'success' ? 'var(--success)' : 'var(--danger)',
            border: `1px solid ${statusMsg.type === 'success' ? 'var(--success)' : 'var(--danger)'}`
          }}>
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleSaveAll} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Cấu hình Daily.co */}
          <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '12px', color: 'var(--secondary)' }}>
              1. Cấu hình Daily.co Video Room
            </h3>

            <div className="input-group" style={{ marginBottom: '12px' }}>
              <label className="input-label">URL Phòng Gọi Daily (Room URL):</label>
              <input 
                type="url" 
                className="custom-input" 
                value={dailyRoomUrl}
                onChange={(e) => setDailyRoomUrl(e.target.value)}
                placeholder="https://your-domain.daily.co/your-room"
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                * Bạn có thể tạo phòng miễn phí tại <a href="https://dashboard.daily.co" target="_blank" rel="noreferrer" style={{ color: 'var(--secondary)' }}>dashboard.daily.co <ExternalLink size={10} style={{ display: 'inline' }} /></a> rồi dán vào đây.
              </span>
            </div>

            <div className="input-group">
              <label className="input-label">Daily REST API Key (Tùy chọn nếu muốn tự tạo phòng bằng 1-click):</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="password" 
                  className="custom-input" 
                  value={dailyApiKey}
                  onChange={(e) => setDailyApiKeyState(e.target.value)}
                  placeholder="Bearer token hoặc API Key từ Daily dashboard..."
                />
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={handleCreateRoomWithApi}
                  disabled={isCreatingRoom}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <Plus size={14} />
                  <span>{isCreatingRoom ? 'Đang tạo...' : 'Tạo mới'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Cấu hình Firebase */}
          <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '12px', color: 'var(--primary)' }}>
              2. Cấu hình Firebase Authentication
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="input-group">
                <label className="input-label">API Key:</label>
                <input 
                  type="text" 
                  className="custom-input" 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..." 
                />
              </div>
              <div className="input-group">
                <label className="input-label">Auth Domain:</label>
                <input 
                  type="text" 
                  className="custom-input" 
                  value={authDomain} 
                  onChange={(e) => setAuthDomain(e.target.value)}
                  placeholder="project-id.firebaseapp.com" 
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm" 
              onClick={handleReset}
              title="Đặt lại về mặc định"
            >
              <RotateCcw size={14} />
              <span>Khôi phục mặc định</span>
            </button>

            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>Lưu cấu hình</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
