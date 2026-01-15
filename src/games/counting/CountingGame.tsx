import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameShell } from "../../components/GameShell";
import { useGameSettings } from "../../store/useGameSettings";
import { launchConfetti } from "../../lib/confetti";
import { saveGameResult } from "../../lib/gameHistory";

const MIN = 2;
const MAX = 12;
const TIMER_SECONDS = 15;

function makeLevel(levelNum: number) {
  const min = Math.min(MIN + Math.floor(levelNum / 3), MAX - 3);
  const max = Math.min(min + 5, MAX);
  const target = Math.floor(Math.random() * (max - min + 1)) + min;
  return { target, levelNum };
}

export function CountingGame() {
  const navigate = useNavigate();
  const { soundOn, hintsEnabled } = useGameSettings();
  const [levelNum, setLevelNum] = useState(0);
  const [level, setLevel] = useState(() => makeLevel(0));
  const [stars, setStars] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lives, setLives] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    if (isGameOver || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return TIMER_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isGameOver]);

  const buttons = useMemo(() => {
    const options = new Set<number>([level.target]);
    const range = Math.max(2, Math.floor(level.target * 0.4));
    while (options.size < 4) {
      const offset = Math.floor(Math.random() * range * 2) - range;
      const value = level.target + offset;
      if (value >= MIN && value <= MAX) {
        options.add(value);
      }
    }
    return Array.from(options).sort(() => Math.random() - 0.5);
  }, [level]);

  const handleTimeout = () => {
    setLives((prev) => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setIsGameOver(true);
        setFeedback("Đã hết thời gian! Game over.");
        // Lưu kết quả game
        saveGameResult({
          gameName: "Đếm số", 
          level: levelNum + 1,
          score: stars,
          stars: Math.min(Math.floor(stars / 10), 3)
        });
      } else {
        setFeedback(`Hết giờ! Còn ${newLives} ❤️`);
        setCombo(0);
        setTimeout(() => {
          setFeedback(null);
          setTimeLeft(TIMER_SECONDS);
        }, 1500);
      }
      return newLives;
    });
  };

  const handlePick = (value: number) => {
    if (isGameOver) return;

    if (value === level.target) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      const earnedStars = 1 + (newCombo >= 3 ? 1 : 0) + (timeLeft > 10 ? 1 : 0);
      setStars((prev) => prev + earnedStars);
      
      const messages = [
        "Chính xác! 🎉",
        "Tuyệt vời! ⭐",
        "Giỏi lắm! 🎆",
        "Hoàn hảo! 🎓"
      ];
      const message = newCombo >= 3 
        ? `COMBO x${newCombo}! +${earnedStars}⭐` 
        : messages[Math.min(newCombo, messages.length - 1)];
      
      setFeedback(message);
      if (soundOn) {
        launchConfetti();
      }
      
      setTimeout(() => {
        setFeedback(null);
        setLevelNum((prev) => prev + 1);
        setLevel(makeLevel(levelNum + 1));
        setTimeLeft(TIMER_SECONDS);
      }, 1200);
    } else {
      setCombo(0);
      setLives((prev) => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setIsGameOver(true);
          setFeedback("Hết mạng! Game over.");
          // Lưu kết quả game
          saveGameResult({
            gameName: "Đếm số", 
            level: levelNum + 1,
            score: stars,
            stars: Math.min(Math.floor(stars / 10), 3)
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
    setLevel(makeLevel(0));
    setStars(0);
    setCombo(0);
    setLives(3);
    setTimeLeft(TIMER_SECONDS);
    setIsGameOver(false);
    setFeedback(null);
  };

  return (
    <GameShell title="Đếm số" stars={stars} onBack={() => navigate("/play")}>      
      <div className="counting">
        <div className="game-stats">
          <div className="stat-item">
            <span className="stat-label">Level</span>
            <span className="stat-value">{levelNum + 1}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Combo</span>
            <span className="stat-value combo">{combo > 0 ? `x${combo}` : '-'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Mạng</span>
            <span className="stat-value lives">{'❤️'.repeat(lives)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Thời gian</span>
            <span className={`stat-value timer ${timeLeft <= 5 ? 'warning' : ''}`}>{timeLeft}s</span>
          </div>
        </div>

        {isGameOver ? (
          <div className="game-over">
            <h2>🎮 Game Over!</h2>
            <p className="final-score">Điểm của bạn: <strong>{stars} ⭐</strong></p>
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
            <p className="instruction">
              Đếm số khối và chọn đáp án đúng!
            </p>
            <div className="object-grid">
              {Array.from({ length: level.target }).map((_, idx) => (
                <div key={idx} className="object" style={{
                  animationDelay: `${idx * 0.05}s`
                }} />
              ))}
            </div>
            {hintsEnabled && combo === 0 && levelNum < 3 && (
              <p className="hint">💡 Gợi ý: Đếm cẩn thận từng khối!</p>
            )}
            <div className="button-row">
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
            {feedback && <p className="feedback">{feedback}</p>}
          </>
        )}
      </div>
    </GameShell>
  );
}
