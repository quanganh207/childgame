import { Link } from "react-router-dom";

type Props = {
  userEmail?: string | null;
};

const GAMES = [
  {
    id: "counting",
    title: "Đếm số",
    description: "Nhấn số đúng theo số lượng vật thể.",
    icon: "🔢",
    color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  {
    id: "balloons",
    title: "Bóng bay",
    description: "Chọn bóng có số được yêu cầu.",
    icon: "🎈",
    color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
  },
  {
    id: "writing",
    title: "Tập viết",
    description: "Vẽ số trên Canvas theo nét.",
    icon: "✏️",
    color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
  },
  {
    id: "find",
    title: "Tìm số",
    description: "Nhận diện mặt số trong lưới.",
    icon: "🔍",
    color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
  },
  {
    id: "connect",
    title: "Nối số",
    description: "Tư duy dãy số logic.",
    icon: "🔗",
    color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
  },
  {
    id: "shapes",
    title: "Hình khối",
    description: "Nhận diện hình học cơ bản.",
    icon: "🔶",
    color: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)"
  }
];

export function PlayMenuPage({ userEmail }: Props) {
  return (
    <div className="page">
      <header className="stack-sm">
        <p className="eyebrow">Chọn trò chơi</p>
        <h2>Học số và hình</h2>
        <p className="muted">
          {userEmail
            ? `Xin chào ${userEmail}`
            : "Bạn có thể chơi ngay hoặc đăng nhập để lưu tiến độ."}
        </p>
      </header>
      <div className="grid">
        {GAMES.map((game) => (
          <article
            key={game.id}
            className="card game-card"
            style={{ background: game.color }}
          >
            <div className="game-icon">{game.icon}</div>
            <h3 style={{ color: "white" }}>{game.title}</h3>
            <p className="muted" style={{ color: "rgba(255,255,255,0.9)" }}>
              {game.description}
            </p>
            <Link to={`/play/${game.id}`} className="btn ghost">
              Chơi ngay
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
