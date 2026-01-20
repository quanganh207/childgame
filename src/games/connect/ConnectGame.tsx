import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameShell } from "../../components/GameShell";
import { useGameSettings } from "../../store/useGameSettings";
import { launchConfetti } from "../../lib/confetti";
import { saveGameResult } from "../../lib/gameHistory";

const TIMER_SECONDS = 15;

function makeLevel(levelNum: number) {
  const maxStart = Math.max(1, 15 - Math.floor(levelNum / 3));
  const start = Math.floor(Math.random() * maxStart) + 1;
  const minLength = 4 + Math.floor(levelNum / 4);
  const length = Math.min(minLength + Math.floor(Math.random() * 2), 8);
  const sequence = Array.from({ length }, (_, i) => start + i);
  const missingIndex = Math.floor(Math.random() * length);
  const answer = sequence[missingIndex];
  sequence[missingIndex] = -1;
  return { sequence, answer, levelNum };
}

export function ConnectGame() {
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

  const options = useMemo(() => {
    const opts = new Set<number>([level.answer]);
    const range = Math.max(3, Math.floor(level.answer * 0.3));
    while (opts.size < 4) {
      const offset = Math.floor(Math.random() * range * 2) - range;
      const value = level.answer + offset;
      if (value > 0 && value < 25) {
        opts.add(value);
      }
    }
    return Array.from(opts).sort(() => Math.random() - 0.5);
  }, [level]);

  const handleTimeout = () => {
    setLives((prev) => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setIsGameOver(true);
        setFeedback("Đã hết thời gian! Game over.");
        saveGameResult({
          gameName: 'Nối Số',
          level: levelNum,
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

  const handlePick = (value: number) => {
    if (isGameOver) return;

    if (value === level.answer) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      const earnedStars = 1 + (newCombo >= 3 ? 1 : 0) + (timeLeft > 10 ? 1 : 0);
      setStars((prev) => prev + earnedStars);
      
      const message = newCombo >= 3 
        ? `COMBO x${newCombo}! +${earnedStars}⭐` 
        : "Đúng rồi! 🔢";
      
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
            gameName: 'Nối Số',
            level: levelNum,
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

  return (
    <GameShell title="Nối số" stars={stars} onBack={() => navigate("/play")}>      
      <div className="connect-game">
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
              Số nào thiếu trong dãy?
            </p>
            {hintsEnabled && combo === 0 && levelNum < 2 && (
              <p className="hint">💡 Gợi ý: Nhìn các số liền kề để tìm quy luật!</p>
            )}
            <div className="sequence">
              {level.sequence.map((num, idx) => (
                <div
                  key={idx}
                  className={num === -1 ? "sequence-item missing" : "sequence-item"}
                  style={{
                    animationDelay: `${idx * 0.1}s`
                  }}
                >
                  {num === -1 ? "?" : num}
                </div>
              ))}
            </div>
            <div className="button-row">
              {options.map((value) => (
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
