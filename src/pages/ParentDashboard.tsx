import { useState, useEffect } from "react";
import { ParentalGate } from "../components/ParentalGate";
import { useGameSettings } from "../store/useGameSettings";
import { getGameHistory, clearGameHistory } from "../lib/gameHistory";

type GameHistory = {
  gameName: string;
  level: number;
  score: number;
  stars: number;
  completedAt: string;
};

export function ParentDashboard() {
  const [verified, setVerified] = useState(false);
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const { soundOn, musicOn, hintsEnabled, setSoundOn, setMusicOn, toggleHints } =
    useGameSettings();

  useEffect(() => {
    // Đọc lịch sử từ localStorage
    setGameHistory(getGameHistory());
  }, []);

  const handleClearHistory = () => {
    clearGameHistory();
    setGameHistory([]);
  };

  if (!verified) {
    return (
      <div className="page narrow">
        <ParentalGate onVerified={() => setVerified(true)} pinHint="demo: 1234" />
      </div>
    );
  }

  return (
    <div className="page narrow">
      <div className="parent-dashboard">
        <div className="dashboard-header">
          <h2>🎛️ Bảng điều khiển phụ huynh</h2>
          <p className="muted">Quản lý cài đặt trò chơi và theo dõi tiến độ của bé</p>
        </div>

        <div className="settings-section">
          <h3>⚙️ Cài đặt trò chơi</h3>
          <div className="settings-grid">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">🔊 Âm thanh hiệu ứng</span>
                <p className="setting-desc">Bật/tắt hiệu ứng âm thanh trong trò chơi</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={soundOn}
                  onChange={(e) => setSoundOn(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">🎵 Nhạc nền</span>
                <p className="setting-desc">Phát nhạc nền trong các trò chơi</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={musicOn}
                  onChange={(e) => setMusicOn(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">💡 Gợi ý hỗ trợ</span>
                <p className="setting-desc">Hiển thị gợi ý khi bé gặp khó khăn</p>
              </div>
              <label className="switch">
                <input type="checkbox" checked={hintsEnabled} onChange={toggleHints} />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="history-section">
          <div className="section-header">
            <h3>📊 Lịch sử làm bài</h3>
            {gameHistory.length > 0 && (
              <button onClick={handleClearHistory} className="btn ghost btn-sm">
                🗑️ Xóa lịch sử
              </button>
            )}
          </div>
          
          {gameHistory.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p>Chưa có lịch sử làm bài nào</p>
              <p className="muted">Khi bé hoàn thành trò chơi, kết quả sẽ được lưu lại ở đây</p>
            </div>
          ) : (
            <div className="history-list">
              {gameHistory.slice(0, 10).map((entry, index) => (
                <div key={index} className="history-item">
                  <div className="history-info">
                    <span className="history-game">{entry.gameName}</span>
                    <span className="history-details">
                      Level {entry.level} • {entry.score} điểm • {"⭐".repeat(entry.stars)}
                    </span>
                  </div>
                  <span className="history-time">{entry.completedAt}</span>
                </div>
              ))}
              {gameHistory.length > 10 && (
                <p className="muted text-center">Và {gameHistory.length - 10} bài làm khác...</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
