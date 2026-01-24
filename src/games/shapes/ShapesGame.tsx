import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameShell } from "../../components/GameShell";
import { useGameSettings } from "../../store/useGameSettings";
import { launchConfetti } from "../../lib/confetti";
import { saveGameResult } from "../../lib/gameHistory";

const SHAPES = [
  { name: "Hình tròn", emoji: "🔵", id: "circle" },
  { name: "Hình vuông", emoji: "🟦", id: "square" },
  { name: "Hình tam giác", emoji: "🔺", id: "triangle" },
  { name: "Hình ngôi sao", emoji: "⭐", id: "star" },
  { name: "Hình trái tim", emoji: "❤️", id: "heart" },
  { name: "Hình kim cương", emoji: "🔶", id: "diamond" },
  { name: "Hình lục giác", emoji: "⬢", id: "hexagon" }
];

const TIMER_SECONDS = 40;

function makeLevel(levelNum: number) {
  const shapesPool = SHAPES.slice(0, Math.min(5 + Math.floor(levelNum / 3), SHAPES.length));
  const target = shapesPool[Math.floor(Math.random() * shapesPool.length)];
  const gridSize = Math.min(12 + Math.floor(levelNum / 2) * 3, 20);
  const targetCount = Math.min(2 + Math.floor(levelNum / 3), 6);
  
  const grid = Array.from({ length: gridSize }, () => 
    shapesPool[Math.floor(Math.random() * shapesPool.length)]
  );
  
  // Ensure exact targetCount of target shapes
  let currentCount = grid.filter(s => s.id === target.id).length;
  const indices = Array.from({ length: gridSize }, (_, i) => i);
  
  while (currentCount < targetCount) {
    const idx = indices[Math.floor(Math.random() * indices.length)];
    if (grid[idx].id !== target.id) {
      grid[idx] = target;
      currentCount++;
    }
  }
  
  while (currentCount > targetCount) {
    const targetIndices = grid.map((s, i) => s.id === target.id ? i : -1).filter(i => i >= 0);
    const idx = targetIndices[Math.floor(Math.random() * targetIndices.length)];
    grid[idx] = shapesPool.filter(s => s.id !== target.id)[0];
    currentCount--;
  }
  
  return { target, grid, levelNum };
}

export function ShapesGame() {
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
  const [selected, setSelected] = useState<number[]>([]);

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

  const correctCount = useMemo(() => 
    level.grid.filter((s) => s.id === level.target.id).length,
    [level]
  );

  const handleTimeout = () => {
    setLives((prev) => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setIsGameOver(true);
        setFeedback("Đã hết thời gian! Game over.");
        saveGameResult({
          gameName: 'Hình Dạng',
          level: levelNum,
          score: stars,
          stars: Math.min(3, Math.floor(stars / 5))
        });
      } else {
        setFeedback(`Hết giờ! Còn ${newLives} ❤️`);
        setCombo(0);
        setSelected([]);
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

  const handleClick = (idx: number, shape: typeof SHAPES[0]) => {
    if (isGameOver) return;

    if (selected.includes(idx)) {
      setSelected(selected.filter((i) => i !== idx));
    } else if (shape.id === level.target.id) {
      const newSelected = [...selected, idx];
      setSelected(newSelected);
      
      // Auto-check when all correct shapes are selected
      if (newSelected.length === correctCount) {
        setTimeout(() => handleCheck(), 300);
      }
    } else {
      setFeedback("Không đúng hình!");
      setLives((prev) => {
        const newLives = Math.max(0, prev - 0.5);
        if (newLives <= 0) {
          setIsGameOver(true);
          setFeedback("Hết mạng! Game over.");
          saveGameResult({
            gameName: 'Hình Dạng',
            level: levelNum,
            score: stars,
            stars: Math.min(3, Math.floor(stars / 5))
          });
        }
        return newLives;
      });
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const handleCheck = () => {
    if (isGameOver) return;

    if (selected.length === correctCount) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      const earnedStars = 1 + (newCombo >= 3 ? 2 : 0) + (timeLeft > 18 ? 1 : 0);
      setStars((prev) => prev + earnedStars);
      
      const message = newCombo >= 3 
        ? `COMBO x${newCombo}! +${earnedStars}⭐` 
        : "Hoàn hảo! 🎨";
      
      setFeedback(message);
      if (soundOn) {
        launchConfetti();
      }
      
      setTimeout(() => {
        setFeedback(null);
        setLevelNum((prev) => prev + 1);
        setLevel(makeLevel(levelNum + 1));
        setSelected([]);
        setTimeLeft(TIMER_SECONDS);
      }, 1200);
    } else {
      setCombo(0);
      setFeedback(`Cần chọn đúng ${correctCount} hình ${level.target.emoji}!`);
      setTimeout(() => setFeedback(null), 1800);
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
    setSelected([]);
  };

  const progress = (selected.length / correctCount) * 100;

  return (
    <GameShell title="Hình khối" stars={stars} onBack={() => navigate("/play")}>
      <div className="shapes-game">
        <div className="game-stats">
          <div className="stat-item">
            <span className="stat-label">Điểm</span>
            <span className="stat-value">{levelNum}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Combo</span>
            <span className="stat-value combo">{combo > 0 ? `x${combo}` : '-'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Mạng</span>
            <span className="stat-value lives">{'❤️'.repeat(Math.floor(lives))}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Thời gian</span>
            <span className={`stat-value timer ${timeLeft <= 8 ? 'warning' : ''}`}>{timeLeft}s</span>
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
              Chọn tất cả: <strong className="target-number">{level.target.name} {level.target.emoji}</strong>
            </p>
            <p className="progress-text">Đã chọn: {selected.length} / {correctCount}</p>
            {hintsEnabled && combo === 0 && levelNum < 2 && (
              <p className="hint">💡 Gợi ý: Tìm tất cả {correctCount} hình {level.target.emoji}!</p>
            )}
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="shapes-grid">
              {level.grid.map((shape, idx) => (
                <button
                  key={idx}
                  className={`shape-item ${selected.includes(idx) ? "selected" : ""}`}
                  onClick={() => handleClick(idx, shape)}
                  style={{
                    animationDelay: `${idx * 0.05}s`
                  }}
                >
                  <span className="shape-emoji">{shape.emoji}</span>
                </button>
              ))}
            </div>
            <div className="button-row">
              <button className="btn ghost" onClick={() => setSelected([])}>
                Xóa chọn
              </button>
              <button 
                className="btn success" 
                onClick={handleCheck}
                disabled={selected.length === 0}
              >
                Kiểm tra ({selected.length}/{correctCount})
              </button>
            </div>
            {feedback && <p className="feedback">{feedback}</p>}
          </>
        )}
      </div>
    </GameShell>
  );
}
