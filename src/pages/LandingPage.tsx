import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <div className="page">
      <section className="hero">
        <p className="eyebrow">Học toán vui vẻ</p>
        <h1>Mini game cho trẻ em</h1>
        <p className="muted">
          Đếm số, bóng bay, tập viết, tìm số, nối số, hình khối — tất cả trong một ứng
          dụng. Kết hợp khen thưởng sao và cửa hàng avatar.
        </p>
        <div className="actions">
          <Link to="/play" className="btn primary">
            Bắt đầu chơi
          </Link>
          <Link to="/login" className="btn ghost">
            Đăng nhập
          </Link>
        </div>
      </section>
      <section className="grid">
        <div className="card">
          <h3>Gamification</h3>
          <p className="muted">Nhận sao, mở khóa avatar, confetti khi hoàn thành.</p>
        </div>
        <div className="card">
          <h3>Phụ huynh kiểm soát</h3>
          <p className="muted">Cổng phụ huynh với PIN, cấu hình âm thanh, gợi ý.</p>
        </div>
        <div className="card">
          <h3>Realtime backend</h3>
          <p className="muted">Firebase Auth + Firestore để lưu tiến độ và cấu hình.</p>
        </div>
      </section>
    </div>
  );
}
