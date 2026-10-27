import React from 'react';
import { Users, Sparkles, CheckCircle2, Shield, Radio, Laptop } from 'lucide-react';

export default function GroupBanner() {
  const members = [
    {
      name: "Trần Quang Vinh",
      role: "Thành viên Nhóm 8",
      task: "Frontend Architecture & Daily.co WebRTC Video Integration",
      initials: "QV"
    },
    {
      name: "Huỳnh Minh Trí",
      role: "Thành viên Nhóm 8",
      task: "Firebase Social Auth, UI/UX & Cloud Deployment",
      initials: "MT"
    }
  ];

  return (
    <div className="glass-card group-banner">
      <div className="banner-glow" />
      
      <div className="banner-header">
        <div className="banner-title-wrap">
          <span className="banner-course">Bài Tập Lớn Trên Lớp - BT_XDPMW</span>
          <h2 className="banner-title">Hệ Thống Video Call API - Nhóm 8</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '4px' }}>
            Ứng dụng gọi video trực tuyến tích hợp Daily.co WebRTC & Đăng nhập mạng xã hội Firebase
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-primary">
            <Radio size={12} className="animate-pulse" />
            Daily.co Video API
          </span>
          <span className="badge badge-cyan">
            <Shield size={12} />
            Firebase Social Auth
          </span>
          <span className="badge badge-success">
            <CheckCircle2 size={12} />
            Nhóm 8 Hoàn Thành
          </span>
        </div>
      </div>

      <div style={{ marginTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Users size={18} color="var(--primary)" />
          <span style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-main)' }}>
            Danh Sách Thành Viên (Nhóm 8):
          </span>
        </div>

        <div className="members-grid">
          {members.map((member, index) => (
            <div key={index} className="member-card">
              <div className="member-avatar">
                {member.initials}
              </div>
              <div className="member-info">
                <h4>{member.name}</h4>
                <p style={{ color: 'var(--secondary)', fontWeight: '600' }}>{member.role}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {member.task}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
