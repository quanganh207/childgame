# STEM Game (Frontend)

Frontend Vite + React + TypeScript. Backend dùng Firebase (Auth + Firestore). Các mini-game sẽ dần bổ sung; hiện có màn mẫu "Counting".

## Cấu hình

1) Sao chép env mẫu và điền khóa Firebase:

```
cp .env.example .env
# cập nhật các giá trị VITE_FIREBASE_*
```

2) Cài đặt phụ thuộc:

```
npm install
```

## Chạy dev

```
npm run dev
```

## Cấu trúc chính

- src/firebase.ts: khởi tạo Firebase (Auth, Firestore).
- src/hooks/useAuth.ts: lắng nghe trạng thái đăng nhập.
- src/store/useGameSettings.ts: trạng thái âm thanh/nhạc/gợi ý.
- src/pages: Landing, Login, Play menu, Parent dashboard, Shop.
- src/games/counting/CountingGame.tsx: game mẫu.

## TODO mở rộng

- Kết nối Firestore để lưu tiến độ, báo cáo, cấu hình phụ huynh.
- Thêm các mini-game khác (Balloons, Writing, Find, Connect, Shapes).
- Tích hợp cửa hàng sao với tồn kho avatar/sticker.