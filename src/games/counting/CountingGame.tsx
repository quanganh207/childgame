import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameShell } from "../../components/GameShell";
import { useGameSettings } from "../../store/useGameSettings";
import { launchConfetti } from "../../lib/confetti";
import { saveGameResult } from "../../lib/gameHistory";

const MIN = 1;
const MAX = 20;

type Level = {
  target: number;
  levelNum: number;
};

function makeLevel(levelNum: number): Level {
  const min = Math.min(MIN + Math.floor(levelNum / 3), MAX - 5);
  const max = Math.min(min + 8, MAX);
  const target = Math.floor(Math.random() * (max - min + 1)) + min;
  return { target, levelNum };
}

export function CountingGame() {
  const navigate = useNavigate();
  const { soundOn, hintsEnabled } = useGameSettings();

  const [levelNum, setLevelNum] = useState(0);
  const level = useMemo(() => makeLevel(levelNum), [levelNum]);
  const [stars, setStars] = useState(0);
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lives, setLives] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);

  const buttons = useMemo(() => {
    const pool = Array.from({ length: MAX - MIN + 1 }, (_, i) => MIN + i).filter(
      (n) => n !== level.target
    );
    pool.sort(() => Math.random() - 0.5);
    const picks = pool.slice(0, 3);
    const options = [level.target, ...picks];
    return options.sort(() => Math.random() - 0.5);
  }, [level]);

  const handlePick = (value: number) => {
    if (isGameOver) return;

    if (value === level.target) {
      const newCombo = combo + 1;
      const earnedStars = 1 + (newCombo >= 3 ? 1 : 0);
      setCombo(newCombo);
      setStars((prev) => prev + earnedStars);

      const messages = ["Chính xác! 🎉", "Tuyệt vời! ⭐", "Giỏi lắm! 🎆", "Hoàn hảo! 🎓"];
      const message =
        newCombo >= 3
          ? `COMBO x${newCombo}! +${earnedStars}⭐`
          : messages[Math.min(newCombo, messages.length - 1)];

      setFeedback(message);
      if (soundOn) {
        launchConfetti();
      }

      setTimeout(() => {
        setFeedback(null);
        setLevelNum((prev) => prev + 1);
      }, 1100);
    } else {
      setCombo(0);
      setLives((prev) => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setIsGameOver(true);
          setFeedback("Hết mạng! Game over.");
          saveGameResult({
            gameName: "Đếm khối",
            level: levelNum,
            score: stars,
            stars: Math.min(Math.floor(stars / 10), 3),
          });
        } else {
          setFeedback(`Sai rồi! Còn ${newLives} ❤️`);
          setTimeout(() => setFeedback(null), 1500);
        }
        return newLives;
      });
    }
  };

  const handleRestart = () => {
    setLevelNum(0);
    setStars(0);
    setCombo(0);
    setLives(3);
    setIsGameOver(false);
    setFeedback(null);
  };

  return (
    <GameShell title="Đếm khối" stars={stars} onBack={() => navigate("/play")}>
      <div className="counting">
        <div className="game-stats">
          <div className="stat-item">
            <span className="stat-label">Level</span>
            <span className="stat-value">{levelNum + 1}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Combo</span>
            <span className="stat-value combo">{combo > 0 ? `x${combo}` : "-"}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Mạng</span>
            <span className="stat-value lives">{"❤️".repeat(lives)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Mục tiêu</span>
            <span className="stat-value target-pill">{level.target}</span>
          </div>
        </div>

        {isGameOver ? (
          <div className="game-over">
            <h2>🎮 Game Over!</h2>
            <p className="final-score">
              Điểm của bạn: <strong>{stars} ⭐</strong>
            </p>
            <p className="muted">Đã hoàn thành {levelNum} level!</p>
            <div className="button-row">
              <button className="btn primary" onClick={handleRestart}>
                Chơi lại 🔄
              </button>
              <button className="btn ghost" onClick={() => navigate("/play")}>
                Trở về menu
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="counting-card">
              <p className="instruction">Đếm số khối và chọn đáp án đúng!</p>
              <div className="object-grid">
                {Array.from({ length: level.target }).map((_, idx) => (
                  <div key={idx} className="object" style={{ animationDelay: `${idx * 40}ms` }} />
                ))}
              </div>
            </div>

            {hintsEnabled && combo === 0 && levelNum < 3 && (
              <p className="hint">💡 Gợi ý: Đếm cẩn thận từng khối!</p>
            )}

            <div className="button-row answer-row">
              {buttons.map((value) => (
                <button
                  key={value}
                  className="btn primary game-btn"
                  onClick={() => handlePick(value)}
                >
                  {value}
                </button>
              ))}
            </div>

            {feedback && <p className="feedback bubble">{feedback}</p>}
          </>
        )}
      </div>
    </GameShell>
  );
}

export default CountingGame;
