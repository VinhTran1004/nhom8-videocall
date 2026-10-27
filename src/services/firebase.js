import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

// Cấu hình Firebase chính thức của Nhóm 8
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyB5a8yj8u4q37qzqkW8HLhakf9RFTO5dTo",
  authDomain: "nhom8-videocall.firebaseapp.com",
  projectId: "nhom8-videocall",
  storageBucket: "nhom8-videocall.firebasestorage.app",
  messagingSenderId: "296936201602",
  appId: "1:296936201602:web:cc015026f531987554839b",
  measurementId: "G-00X74R56CP"
};

// Lấy config từ localStorage nếu người dùng đã lưu
export const getActiveFirebaseConfig = () => {
  try {
    const saved = localStorage.getItem('nhom8_custom_firebase_config');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading custom firebase config:', e);
  }
  return DEFAULT_FIREBASE_CONFIG;
};

export const saveCustomFirebaseConfig = (config) => {
  localStorage.setItem('nhom8_custom_firebase_config', JSON.stringify(config));
  window.location.reload();
};

export const resetFirebaseConfig = () => {
  localStorage.removeItem('nhom8_custom_firebase_config');
  window.location.reload();
};

// Khởi tạo Firebase App
let app;
let auth;

try {
  const config = getActiveFirebaseConfig();
  if (!getApps().length) {
    app = initializeApp(config);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
} catch (err) {
  console.warn('Firebase init warning (running in flexible mode):', err);
}

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Kiểm tra xem đã có người dùng đăng nhập lưu trong session/local chưa
export const getSavedUser = () => {
  try {
    const local = localStorage.getItem('nhom8_current_user');
    if (local) return JSON.parse(local);
  } catch (e) {
    console.error(e);
  }
  return null;
};

export const setSavedUser = (user) => {
  if (user) {
    localStorage.setItem('nhom8_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('nhom8_current_user');
  }
};

// Đăng nhập bằng Google thật qua Firebase
export const signInWithGoogle = async () => {
  if (!auth) throw new Error("Firebase Auth chưa được khởi tạo!");
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = {
      uid: result.user.uid,
      displayName: result.user.displayName || "Google User",
      email: result.user.email,
      photoURL: result.user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.user.displayName}`,
      provider: 'google'
    };
    setSavedUser(user);
    return user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

// Đăng nhập bằng GitHub thật qua Firebase
export const signInWithGithub = async () => {
  if (!auth) throw new Error("Firebase Auth chưa được khởi tạo!");
  try {
    const result = await signInWithPopup(auth, githubProvider);
    const user = {
      uid: result.user.uid,
      displayName: result.user.displayName || result.user.reloadUserInfo?.screenName || "GitHub User",
      email: result.user.email,
      photoURL: result.user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.user.displayName}`,
      provider: 'github'
    };
    setSavedUser(user);
    return user;
  } catch (error) {
    console.error('GitHub Sign-In Error:', error);
    throw error;
  }
};

// Đăng nhập Fast Test / Giảng viên (Đảm bảo chạy 100% không lo lỗi domain)
export const signInFastDemo = (profile) => {
  const user = {
    uid: 'demo_' + Math.random().toString(36).substring(2, 9),
    displayName: profile.displayName,
    email: profile.email,
    photoURL: profile.photoURL,
    provider: profile.provider || 'google'
  };
  setSavedUser(user);
  return user;
};

// Đăng xuất
export const signOutUser = async () => {
  try {
    if (auth) {
      await signOut(auth);
    }
  } catch (e) {
    console.warn('Sign out Firebase error:', e);
  }
  setSavedUser(null);
};

export { auth };
