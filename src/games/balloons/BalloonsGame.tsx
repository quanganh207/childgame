import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameShell } from "../../components/GameShell";
import { useGameSettings } from "../../store/useGameSettings";
import { launchConfetti } from "../../lib/confetti";

const COLORS = ["#ff6b9d", "#4facfe", "#ffa726", "#56ab2f", "#9b59b6", "#e74c3c", "#3498db"];
const TIMER_SECONDS = 20;

function makeLevel(levelNum: number) {
  const target = Math.min(1 + Math.floor(levelNum / 2), 9);
  const balloonCount = Math.min(6 + Math.floor(levelNum / 2), 15);
  return { target, balloonCount, levelNum };
}

export function BalloonsGame() {
  const navigate = useNavigate();
  const { soundOn, hintsEnabled } = useGameSettings();
  const [levelNum, setLevelNum] = useState(0);
  const [stars, setStars] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lives, setLives] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);
  const level = useMemo(() => makeLevel(levelNum), [levelNum]);

  const balloons = useMemo(() => {
    const numbers = Array.from({ length: level.balloonCount }, () => 
      Math.floor(Math.random() * 9) + 1
    );
    // Ensure target appears at least once
    const targetIndex = Math.floor(Math.random() * level.balloonCount);
    numbers[targetIndex] = level.target;
    
    return numbers.map((number, i) => ({
      id: i,
      number,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      popped: false
    }));
  }, [level]);

  const [balloonStates, setBalloonStates] = useState(balloons);

  useEffect(() => {
    setBalloonStates(balloons);
  }, [balloons]);

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

  const handleTimeout = () => {
    setLives((prev) => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setIsGameOver(true);
        setFeedback("Đã hết thời gian! Game over.");
      } else {
        setFeedback(`Hết giờ! Còn ${newLives} ❤️`);
        setCombo(0);
        setTimeout(() => {
          setFeedback(null);
          nextLevel();
        }, 1500);
      }
      return newLives;
    });
  };

  const nextLevel = () => {
    setLevelNum((prev) => prev + 1);
    setTimeLeft(TIMER_SECONDS);
  };

  const handlePop = (id: number, number: number) => {
    if (isGameOver) return;

    setBalloonStates((prev) =>
      prev.map((b) => (b.id === id ? { ...b, popped: true } : b))
    );

    if (number === level.target) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      const earnedStars = 1 + (newCombo >= 3 ? 1 : 0) + (timeLeft > 15 ? 1 : 0);
      setStars((prev) => prev + earnedStars);
      
      const message = newCombo >= 3 
        ? `COMBO x${newCombo}! +${earnedStars}⭐` 
        : `Đúng rồi! Số ${level.target} 🎈`;
      
      setFeedback(message);
      if (soundOn) {
        launchConfetti();
      }
      
      setTimeout(() => {
        setFeedback(null);
        nextLevel();
      }, 1200);
    } else {
      setCombo(0);
      setLives((prev) => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setIsGameOver(true);
          setFeedback("Hết mạng! Game over.");
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
    setTimeLeft(TIMER_SECONDS);
    setIsGameOver(false);
    setFeedback(null);
  };

  const activeBalloons = balloonStates.filter(b => !b.popped);
  const progress = ((level.balloonCount - activeBalloons.length) / level.balloonCount) * 100;

  return (
    <GameShell title="Bóng bay số" stars={stars} onBack={() => navigate("/play")}>
      <div className="balloons-game">
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
              Tìm và bấm bóng bay có số: <strong className="target-number">{level.target}</strong>
            </p>
            {hintsEnabled && combo === 0 && levelNum < 2 && (
              <p className="hint">💡 Gợi ý: Nhìn kỹ số trên từng quả bóng!</p>
            )}
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="balloon-container">
              {balloonStates.map((balloon) =>
                balloon.popped ? null : (
                  <button
                    key={balloon.id}
                    className="balloon"
                    style={{ 
                      backgroundColor: balloon.color,
                      animationDelay: `${balloon.id * 0.1}s`
                    }}
                    onClick={() => handlePop(balloon.id, balloon.number)}
                  >
                    <span className="balloon-number">{balloon.number}</span>
                  </button>
                )
              )}
            </div>
            {feedback && <p className="feedback">{feedback}</p>}
          </>
        )}
      </div>
    </GameShell>
  );
}
