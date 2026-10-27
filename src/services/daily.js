// Quản lý cấu hình phòng Daily.co
const DEFAULT_ROOM_URL = "https://nhom8.daily.co/classroom";

export const getSavedDailyRoom = () => {
  // Kiểm tra query parameter từ URL trước (nếu người dùng bấm vào link mời)
  const urlParams = new URLSearchParams(window.location.search);
  const roomParam = urlParams.get('room');
  if (roomParam) {
    if (roomParam.startsWith('http')) return roomParam;
    return `https://nhom8.daily.co/${roomParam}`;
  }

  const saved = localStorage.getItem('nhom8_daily_room_url');
  return saved || DEFAULT_ROOM_URL;
};

export const saveDailyRoom = (url) => {
  if (url) {
    localStorage.setItem('nhom8_daily_room_url', url.trim());
  }
};

export const getDailyApiKey = () => {
  return localStorage.getItem('nhom8_daily_api_key') || '';
};

export const saveDailyApiKey = (key) => {
  if (key) {
    localStorage.setItem('nhom8_daily_api_key', key.trim());
  } else {
    localStorage.removeItem('nhom8_daily_api_key');
  }
};

// Hàm tạo phòng tự động qua Daily REST API (nếu người dùng cung cấp API Key)
export const createDailyRoomApi = async (roomName, apiKey) => {
  if (!apiKey) throw new Error("Chưa cung cấp Daily API Key!");
  
  const formattedName = (roomName || 'nhom8-room-' + Math.floor(Math.random() * 1000))
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-');

  const response = await fetch('https://api.daily.co/v1/rooms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify({
      name: formattedName,
      properties: {
        enable_chat: true,
        enable_screenshare: true,
        start_video_off: false,
        start_audio_off: false,
        exp: Math.round(Date.now() / 1000) + (3600 * 24) // Hết hạn sau 24h
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.info || data.error || 'Lỗi khi tạo phòng Daily');
  }

  return data.url;
};
