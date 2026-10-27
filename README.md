# Ứng Dụng Gọi Video Trực Tuyến - Nhóm 8 (BT_XDPMW)

> **Môn học:** Xây Dựng Phần Mềm Web  
> **Tên nhóm:** **Nhóm 8**  
> **Danh sách thành viên:**
> 1. **Trần Quang Vinh** (Phụ trách: Kiến trúc Frontend & Tích hợp Daily.co WebRTC Video API)
> 2. **Huỳnh Minh Trí** (Phụ trách: Firebase Social Authentication, UI/UX Glassmorphism & Cloud Deployment)

---

## 🌟 Tính Năng Nổi Bật Đáp Ứng Yêu Cầu Đề Bài

1. **Hiển thị thông tin nhóm rõ ràng trên Trang Chủ:**
   - Banner Nhóm 8 hiển thị trang trọng: Tên nhóm, danh sách thành viên (*Trần Quang Vinh*, *Huỳnh Minh Trí*), vai trò và nhiệm vụ.
2. **Đăng nhập trước khi join phòng Video (Social Login):**
   - Hỗ trợ đăng nhập qua mạng xã hội: **Google** và **GitHub** thông qua **Firebase Authentication**.
   - Tích hợp sẵn chế độ **Fast Test Profiles** (Giảng viên, Trần Quang Vinh, Huỳnh Minh Trí, Khách) giúp việc chấm điểm và kiểm thử giữa 2 máy / 2 tab ẩn danh diễn ra tức thì, không bị cản trở bởi cấu hình Authorized Domains của Firebase khi host trên môi trường mới.
3. **Hiển thị danh sách người gọi theo tên đã nhận khi đăng nhập:**
   - Khi tham gia phòng, tên nhận được từ tài khoản mạng xã hội (`displayName`) sẽ tự động được gửi vào phiên gọi Daily.co.
   - Ứng dụng tích hợp thanh **"Danh Sách Người Gọi" (Realtime Participant Panel)** bên cạnh màn hình video:
     - Tên hiển thị từ Google/GitHub của từng người tham gia.
     - Avatar đại diện.
     - Trạng thái Microphone: Đang bật / Đang tắt (Mute).
     - Trạng thái Camera: Đang bật / Đang tắt.
     - Huy hiệu nhận diện "(Bạn)" hoặc "Thành viên".
     - Bộ đếm thời gian cuộc gọi (Call Duration Timer).
4. **Hệ thống Video Call WebRTC chất lượng cao (Daily.co API):**
   - Độ trễ siêu thấp, hỗ trợ chia sẻ màn hình (Screen Share), bật/tắt camera/mic, chat, chế độ lưới (Grid view) / người nói (Speaker view).

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend:** React 19, Vite, Vanilla CSS Design System (Glassmorphism, Dark/Light Mode, Plus Jakarta Sans font).
- **Video API:** Daily.co WebRTC Video SDK (`@daily-co/daily-js`).
- **Xác thực:** Firebase Authentication (Google & GitHub Provider).
- **Icons:** `lucide-react`.
- **Deploy:** GitHub Pages (`gh-pages`) & Render Ready.

---

## 🚀 Hướng Dẫn Chạy Cục Bộ (Localhost)

```bash
# 1. Cài đặt các thư viện
npm install

# 2. Khởi chạy server phát triển
npm run dev
```

Mở trình duyệt tại: `http://localhost:5173/`

---

## 👥 Hướng Dẫn Kiểm Thử Gọi Video Giữa 2 Máy (Hoặc 2 Trình Duyệt)

1. **Máy 1 (hoặc Tab thường):**
   - Mở trang web.
   - Bấm **Đăng nhập** &rarr; Chọn Google hoặc chọn Profile nhanh: **Trần Quang Vinh (Nhóm 8)**.
   - Bấm **Tham Gia Cuộc Gọi Ngay**.
2. **Máy 2 (hoặc Tab Ẩn danh - Incognito):**
   - Mở link web (hoặc link chia sẻ kèm `?room=...`).
   - Bấm **Đăng nhập** &rarr; Chọn Google khác hoặc Profile: **Huỳnh Minh Trí (Nhóm 8)** (hoặc *Giảng Viên Chấm Điểm*).
   - Bấm **Tham Gia Cuộc Gọi Ngay** vào cùng phòng.
3. **Kết quả:**
   - Hai máy sẽ thấy video và nghe thấy âm thanh của nhau.
   - Sidebar **"Danh Sách Người Gọi"** lập tức cập nhật đầy đủ tên của cả 2 thành viên kèm trạng thái Mic/Cam thời gian thực!

---

## 🌐 Hướng Dẫn Triển Khai Lên Server (Deploy)

### Cách 1: Deploy lên GitHub Pages (Khuyên Dùng - 1 Lệnh Duy Nhất)

Dự án đã được cấu hình sẵn `base: './'` trong `vite.config.js` và script `deploy` trong `package.json`.

1. Khởi tạo Git và đẩy lên GitHub:
   ```bash
   git init
   git add .
   git commit -m "Deploy Nhom 8 Video Call App"
   git branch -M main
   git remote add origin https://github.com/<tai-khoan-github>/<ten-repo>.git
   git push -u origin main
   ```
2. Chạy lệnh deploy tự động:
   ```bash
   npm run deploy
   ```
3. Truy cập vào GitHub: **Settings &rarr; Pages &rarr; Source:** chọn branch `gh-pages` &rarr; Nhận ngay link web công khai để nộp vào nhóm!

---

### Cách 2: Deploy lên Render (Static Site)

1. Đẩy mã nguồn lên GitHub.
2. Truy cập [render.com](https://render.com) và đăng nhập.
3. Bấm **New +** &rarr; Chọn **Static Site**.
4. Kết nối đến Repository GitHub vừa tạo.
5. Cấu hình:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
6. Bấm **Create Static Site** &rarr; Render sẽ tự động build và cấp link có dạng: `https://ten-du-an.onrender.com`.

---

## ⚙️ Cấu Hình Tùy Chỉnh (Daily.co & Firebase)

Bạn có thể bấm vào biểu tượng **Cài Đặt (Bánh răng)** trên thanh Navbar của ứng dụng để:
- **Đổi Daily Room URL:** Dán link phòng miễn phí tạo từ [dashboard.daily.co](https://dashboard.daily.co).
- **Tạo phòng tự động:** Nhập Daily API Key và bấm "Tạo mới".
- **Cấu hình Firebase riêng:** Dán cấu hình Firebase của nhóm bạn nếu muốn sử dụng Project Firebase riêng.

---

*Đồ án hoàn thành bởi Nhóm 8: Trần Quang Vinh & Huỳnh Minh Trí.*
