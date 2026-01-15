import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameShell } from "../../components/GameShell";
import { useGameSettings } from "../../store/useGameSettings";
import { launchConfetti } from "../../lib/confetti";

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

export function WritingGame() {
  const navigate = useNavigate();
  const { soundOn } = useGameSettings();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentNumber, setCurrentNumber] = useState(NUMBERS[0]);
  const [stars, setStars] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Draw number template
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "bold 200px 'Fredoka One'";
    ctx.fillStyle = "rgba(79, 172, 254, 0.15)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(currentNumber.toString(), canvas.width / 2, canvas.height / 2);
  }, [currentNumber]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = "#ff6b9d";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "bold 200px 'Fredoka One'";
    ctx.fillStyle = "rgba(79, 172, 254, 0.15)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(currentNumber.toString(), canvas.width / 2, canvas.height / 2);
  };

  const handleNext = () => {
    setStars((prev) => prev + 1);
    if (soundOn) {
      launchConfetti();
    }
    const nextIndex = (NUMBERS.indexOf(currentNumber) + 1) % NUMBERS.length;
    setCurrentNumber(NUMBERS[nextIndex]);
    handleClear();
  };

  return (
    <GameShell title="Tập viết số" stars={stars} onBack={() => navigate("/play")}>
      <div className="writing-game">
        <p className="muted instruction">Viết số <strong className="target-number">{currentNumber}</strong> theo nét mờ</p>
        <div className="canvas-container">
          <canvas
            ref={canvasRef}
            className="writing-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
        <div className="button-row">
          <button className="btn ghost" onClick={handleClear}>
            Xóa ✏️
          </button>
          <button className="btn primary" onClick={handleNext}>
            Số tiếp theo ➡️
          </button>
        </div>
      </div>
    </GameShell>
  );
}
