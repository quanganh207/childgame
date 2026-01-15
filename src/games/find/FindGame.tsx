import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameShell } from "../../components/GameShell";
import { useGameSettings } from "../../store/useGameSettings";
import { launchConfetti } from "../../lib/confetti";
import { saveGameResult } from "../../lib/gameHistory";

const STYLES = [
  { font: "Arial", color: "#ff6b9d", weight: "700" },
  { font: "Georgia", color: "#4facfe", weight: "800" },
  { font: "'Courier New'", color: "#56ab2f", weight: "700" },
  { font: "'Comic Sans MS'", color: "#ffa726", weight: "800" },
  { font: "'Times New Roman'", color: "#9b59b6", weight: "700" },
  { font: "'Verdana'", color: "#e74c3c", weight: "700" },
  { font: "'Trebuchet MS'", color: "#3498db", weight: "800" }
];

const TIMER_SECONDS = 12;

function makeLevel(levelNum: number) {
  const target = Math.floor(Math.random() * 10);
  const gridSize = Math.min(9 + Math.floor(levelNum / 3) * 3, 16);
  const positions = Array.from({ length: gridSize }, (_, i) => i);
  const targetPos = positions[Math.floor(Math.random() * positions.length)];
  return { target, targetPos, gridSize, levelNum };
}

export function FindGame() {
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

  const grid = useMemo(() => {
    const numbers = Array.from({ length: level.gridSize }, () => {
      let num;
      do {
        num = Math.floor(Math.random() * 10);
      } while (num === level.target && Math.random() > 0.3); // Add some duplicates
      return num;
    });
    numbers[level.targetPos] = level.target;
    
    return numbers.map((num, idx) => ({
      value: num,
      style: STYLES[Math.floor(Math.random() * STYLES.length)],
      isTarget: idx === level.targetPos,
      rotation: (Math.random() - 0.5) * 10
    }));
  }, [level]);

  const handleTimeout = () => {
    setLives((prev) => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setIsGameOver(true);
        setFeedback("Đã hết thời gian! Game over.");
        saveGameResult({
          gameName: 'Tìm Số',
          level: levelNum + 1,
          score: stars,
          stars: Math.min(3, Math.floor(stars / 5))
        });
      } else {
        setFeedback(`Hết giờ! Còn ${newLives} ❤️`);
        setCombo(0);
        setTimeout(() => {
          setFeedback(null);
          setLevelNum((prev) => prev + 1);
          setLevel(makeLevel(levelNum + 1));
          setTimeLeft(TIMER_SECONDS);
        }, 1500);
      }
      return newLives;
    });
  };

  const handleClick = (isTarget: boolean) => {
    if (isGameOver) return;

    if (isTarget) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      const earnedStars = 1 + (newCombo >= 3 ? 1 : 0) + (timeLeft > 8 ? 1 : 0);
      setStars((prev) => prev + earnedStars);
      
      const message = newCombo >= 3 
        ? `COMBO x${newCombo}! +${earnedStars}⭐` 
        : "Chính xác! 🎯";
      
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
          saveGameResult({
            gameName: 'Tìm Số',
            level: levelNum + 1,
            score: stars,
            stars: Math.min(3, Math.floor(stars / 5))
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

  const gridCols = level.gridSize === 9 ? 3 : level.gridSize === 12 ? 4 : 4;

  return (
    <GameShell title="Tìm số" stars={stars} onBack={() => navigate("/play")}>      
      <div className="find-game">
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
            <span className={`stat-value timer ${timeLeft <= 4 ? 'warning' : ''}`}>{timeLeft}s</span>
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
              Tìm và nhấp vào số: <strong className="target-number">{level.target}</strong>
            </p>
            {hintsEnabled && combo === 0 && levelNum < 2 && (
              <p className="hint">💡 Gợi ý: Chú ý màu sắc và kiểu chữ khác nhau!</p>
            )}
            <div className="find-grid" style={{
              gridTemplateColumns: `repeat(${gridCols}, 1fr)`
            }}>
              {grid.map((item, idx) => (
                <button
                  key={idx}
                  className="find-item"
                  style={{
                    fontFamily: item.style.font,
                    color: item.style.color,
                    fontWeight: item.style.weight,
                    transform: `rotate(${item.rotation}deg)`,
                    animationDelay: `${idx * 0.05}s`
                  }}
                  onClick={() => handleClick(item.isTarget)}
                >
                  {item.value}
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
