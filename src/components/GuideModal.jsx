import React, { useState } from 'react';
import { 
  HelpCircle, 
  X, 
  Terminal, 
  Globe, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Video, 
  Users 
} from 'lucide-react';

export default function GuideModal({ isOpen, onClose }) {
  const [copiedCmd, setCopiedCmd] = useState('');
  const [activeTab, setActiveTab] = useState('deploy');

  if (!isOpen) return null;

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(''), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-card modal-card" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
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
          <HelpCircle size={24} color="var(--secondary)" />
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Hướng Dẫn Sử Dụng & Triển Khai</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Bài tập nhóm BT_XDPMW - Nhóm 8: Trần Quang Vinh & Huỳnh Minh Trí
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--card-border)', paddingBottom: '10px', marginBottom: '18px' }}>
          <button 
            className={`btn btn-sm ${activeTab === 'deploy' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('deploy')}
          >
            🚀 Hướng Dẫn Deploy (GitHub Pages / Render)
          </button>
          <button 
            className={`btn btn-sm ${activeTab === 'daily' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('daily')}
          >
            📹 Cấu Hình Daily.co Video
          </button>
          <button 
            className={`btn btn-sm ${activeTab === 'test' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('test')}
          >
            👥 Kiểm Thử 2 Máy
          </button>
        </div>

        {/* Tab 1: Deploy GitHub Pages / Render */}
        {activeTab === 'deploy' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.88rem' }}>
            <div style={{ padding: '14px', background: 'rgba(99, 102, 241, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <h4 style={{ fontWeight: '700', color: 'var(--secondary)', marginBottom: '6px' }}>
                Cách 1: Deploy lên GitHub Pages (Nhanh nhất - 1 dòng lệnh)
              </h4>
              <p style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>
                Dự án đã được tích hợp sẵn package <code>gh-pages</code> và cấu hình <code>base: './'</code>.
              </p>
              
              <div style={{ background: '#05070d', padding: '10px 14px', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                <code>git init && git add . && git commit -m "Deploy Nhom 8"</code>
                <button 
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '4px 8px' }}
                  onClick={() => copyToClipboard('git init; git add .; git commit -m "Deploy Nhom 8"', 'git1')}
                >
                  {copiedCmd === 'git1' ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                </button>
              </div>

              <div style={{ background: '#05070d', padding: '10px 14px', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', marginTop: '8px' }}>
                <code>npm run deploy</code>
                <button 
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '4px 8px' }}
                  onClick={() => copyToClipboard('npm run deploy', 'gh')}
                >
                  {copiedCmd === 'gh' ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div style={{ padding: '14px', background: 'rgba(6, 182, 212, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
              <h4 style={{ fontWeight: '700', color: 'var(--secondary)', marginBottom: '6px' }}>
                Cách 2: Deploy lên Render (Static Site)
              </h4>
              <ol style={{ paddingLeft: '20px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>Đẩy source code lên kho chứa GitHub của bạn.</li>
                <li>Vào <a href="https://render.com" target="_blank" rel="noreferrer" style={{ color: 'var(--secondary)' }}>render.com</a> &rarr; New <strong>Static Site</strong>.</li>
                <li>Chọn kho chứa GitHub vừa push.</li>
                <li>Cấu hình: Build Command: <code>npm run build</code>, Publish Directory: <code>dist</code>.</li>
                <li>Bấm <strong>Deploy</strong> &rarr; Nhận ngay link công khai nộp bài!</li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 2: Daily.co */}
        {activeTab === 'daily' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            <p>
              Daily.co là nền tảng Video Call API chuẩn WebRTC hàng đầu hiện nay với <strong>10,000 phút gọi miễn phí mỗi tháng</strong>.
            </p>
            <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}>
              <h4 style={{ fontWeight: '700', color: '#fff', marginBottom: '8px' }}>Các bước tạo phòng riêng trên Daily:</h4>
              <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Truy cập <a href="https://dashboard.daily.co/signup" target="_blank" rel="noreferrer" style={{ color: 'var(--secondary)' }}>dashboard.daily.co</a> và đăng ký bằng Google (miễn phí).</li>
                <li>Vào tab <strong>Rooms</strong> &rarr; bấm <strong>Create room</strong>.</li>
                <li>Sao chép link phòng (ví dụ: <code>https://ten-ban.daily.co/phong-hop</code>).</li>
                <li>Mở biểu tượng <strong>Cài Đặt</strong> trên thanh Navbar của trang này &rarr; Dán link vào ô <strong>Room URL</strong> &rarr; Bấm Lưu!</li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 3: Kiểm thử 2 máy */}
        {activeTab === 'test' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            <p>
              Để kiểm tra đầy đủ tính năng: <strong>Xác thực Social Auth &rarr; Tham gia gọi Video &rarr; Hiển thị danh sách tên người gọi</strong>:
            </p>
            <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong>Máy 1:</strong> Mở web, chọn Đăng nhập Google hoặc chọn Profile "Trần Quang Vinh", bấm Tham Gia Cuộc Gọi.</li>
                <li><strong>Máy 2 (hoặc tab Incognito):</strong> Mở link web, chọn Đăng nhập Google hoặc chọn Profile "Huỳnh Minh Trí", bấm Tham Gia Cuộc Gọi.</li>
                <li><strong>Kết quả:</strong> Cả 2 máy lập tức truyền video & audio của nhau, đồng thời thanh <strong>Danh Sách Người Gọi</strong> sẽ tự động cập nhật đúng tên 2 người kèm trạng thái Mic/Cam!</li>
              </ul>
            </div>
          </div>
        )}

        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button className="btn btn-secondary" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}
