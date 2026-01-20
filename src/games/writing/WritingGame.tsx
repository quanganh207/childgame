import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameShell } from "../../components/GameShell";
import { useGameSettings } from "../../store/useGameSettings";
import { launchConfetti } from "../../lib/confetti";
import { Hands, Results } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";

// Câu hỏi đếm từ 0-10
const QUESTIONS = [
  { question: "0 + 0 = ?", answer: 0 },
  { question: "1 + 0 = ?", answer: 1 },
  { question: "1 + 1 = ?", answer: 2 },
  { question: "2 + 1 = ?", answer: 3 },
  { question: "2 + 2 = ?", answer: 4 },
  { question: "3 + 2 = ?", answer: 5 },
  { question: "3 + 3 = ?", answer: 6 },
  { question: "4 + 3 = ?", answer: 7 },
  { question: "4 + 4 = ?", answer: 8 },
  { question: "5 + 4 = ?", answer: 9 },
  { question: "5 + 5 = ?", answer: 10 },
];

export function WritingGame() {
  const navigate = useNavigate();
  const { soundOn } = useGameSettings();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stars, setStars] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [detectedFingers, setDetectedFingers] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [cameraError, setCameraError] = useState("");

  const currentQuestion = QUESTIONS[currentQuestionIndex];

  // Hàm tính góc (độ) tại điểm B với 3D coords
  const angleAt = (a: any, b: any, c: any): number => {
    const ab = { x: a.x - b.x, y: a.y - b.y, z: (a.z ?? 0) - (b.z ?? 0) };
    const cb = { x: c.x - b.x, y: c.y - b.y, z: (c.z ?? 0) - (b.z ?? 0) };
    const dot = ab.x * cb.x + ab.y * cb.y + ab.z * cb.z;
    const magAB = Math.sqrt(ab.x * ab.x + ab.y * ab.y + ab.z * ab.z);
    const magCB = Math.sqrt(cb.x * cb.x + cb.y * cb.y + cb.z * cb.z);
    if (magAB === 0 || magCB === 0) return 0;
    const cos = dot / (magAB * magCB);
    const clamped = Math.min(1, Math.max(-1, cos));
    return Math.acos(clamped) * (180 / Math.PI);
  };

  const dist = (p: any, q: any): number => {
    return Math.sqrt(
      Math.pow(p.x - q.x, 2) +
      Math.pow(p.y - q.y, 2) +
      Math.pow((p.z ?? 0) - (q.z ?? 0), 2)
    );
  };

  // Hàm đếm ngón tay - dùng góc đốt ngón, ổn định hơn khi xoay tay
  const countFingers = (results: Results): number => {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      return 0;
    }

    let totalFingers = 0;

    for (const landmarks of results.multiHandLandmarks) {
      let openFingers = 0;
      const wrist = landmarks[0];

      // Ngón cái: xét góc tại IP (3) và khoảng cách đến cổ tay
      const thumbTip = landmarks[4];
      const thumbIP = landmarks[3];
      const thumbMCP = landmarks[2];

      const thumbAngle = angleAt(thumbMCP, thumbIP, thumbTip); // thẳng ≈ 180°
      const thumbTipDist = dist(thumbTip, wrist);
      const thumbMCPDist = dist(thumbMCP, wrist);

      if (thumbAngle > 150 && thumbTipDist > thumbMCPDist * 1.1) {
        openFingers++;
      }

      // Các ngón còn lại: dùng góc tại PIP và DIP + khoảng cách tới cổ tay
      const fingerConfigs = [
        { mcp: 5, pip: 6, dip: 7, tip: 8 },   // Index
        { mcp: 9, pip: 10, dip: 11, tip: 12 }, // Middle
        { mcp: 13, pip: 14, dip: 15, tip: 16 },// Ring
        { mcp: 17, pip: 18, dip: 19, tip: 20 } // Pinky
      ];

      for (const finger of fingerConfigs) {
        const mcp = landmarks[finger.mcp];
        const pip = landmarks[finger.pip];
        const dip = landmarks[finger.dip];
        const tip = landmarks[finger.tip];

        const anglePIP = angleAt(mcp, pip, dip);
        const angleDIP = angleAt(pip, dip, tip);

        const tipDist = dist(tip, wrist);
        const pipDist = dist(pip, wrist);

        // Coi ngón duỗi khi cả hai khớp thẳng và tip xa hơn pip so với cổ tay
        if (anglePIP > 165 && angleDIP > 160 && tipDist > pipDist * 1.12) {
          openFingers++;
        }
      }

      totalFingers += openFingers;
    }

    return totalFingers;
  };

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results: Results) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
          drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 3,
          });
          drawLandmarks(ctx, landmarks, { color: "#FF0000", lineWidth: 1 });
        }
      }
      ctx.restore();

      const fingers = countFingers(results);
      setDetectedFingers(fingers);

      // Kiểm tra đáp án - chỉ hiển thị feedback khi có phát hiện
      if (fingers > 0) {
        if (fingers === currentQuestion.answer) {
          setFeedback("🎉 Chính xác!");
          setTimeout(() => {
            handleNext();
          }, 2000); // Tăng thời gian để bé có thể thấy feedback
        } else {
          // Không hiển thị feedback "sai" ngay lập tức, chỉ hiển thị số đang đếm
          setFeedback("");
        }
      } else {
        setFeedback("");
      }
    });

    const camera = new Camera(video, {
      onFrame: async () => {
        await hands.send({ image: video });
      },
      width: 640,
      height: 480,
    });

    camera.start().catch((err) => {
      console.error("Camera error:", err);
      setCameraError("Không thể truy cập camera. Vui lòng cho phép quyền truy cập camera.");
    });

    return () => {
      camera.stop();
      hands.close();
    };
  }, [currentQuestion, currentQuestionIndex]);

  const handleNext = () => {
    setStars((prev) => prev + 1);
    if (soundOn) {
      launchConfetti();
    }
    setFeedback("");
    setDetectedFingers(0);
    const nextIndex = (currentQuestionIndex + 1) % QUESTIONS.length;
    setCurrentQuestionIndex(nextIndex);
  };

  const handleSkip = () => {
    setFeedback("");
    setDetectedFingers(0);
    const nextIndex = (currentQuestionIndex + 1) % QUESTIONS.length;
    setCurrentQuestionIndex(nextIndex);
  };

  return (
    <GameShell title="Đếm Ngón Tay" stars={stars} onBack={() => navigate("/play")}>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr",
        gap: "2rem",
        padding: "1rem",
        alignItems: "start",
        minHeight: "70vh"
      }}>
        {/* Cột trái: Camera */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "1rem"
        }}>
          <h3 style={{ 
            fontSize: "1.5rem", 
            color: "#667eea",
            margin: "0 0 0.5rem 0",
            textAlign: "center"
          }}>
            📹 Camera
          </h3>
          
          {cameraError ? (
            <div style={{ 
              color: "red", 
              padding: "2rem", 
              textAlign: "center",
              background: "#ffe6e6",
              borderRadius: "12px",
              fontSize: "1.1rem"
            }}>
              {cameraError}
            </div>
          ) : (
            <div style={{ 
              position: "relative",
              width: "100%"
            }}>
              <video
                ref={videoRef}
                style={{ display: "none" }}
                playsInline
              />
              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                style={{
                  width: "100%",
                  height: "auto",
                  border: "4px solid #4facfe",
                  borderRadius: "16px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  background: "#000"
                }}
              />
              
              {/* Số ngón tay đang đếm */}
              <div style={{
                position: "absolute",
                bottom: "15px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(0, 0, 0, 0.85)",
                padding: "0.75rem 1.5rem",
                borderRadius: "50px",
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "white",
                minWidth: "150px",
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
              }}>
                <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>
                  Đang đếm
                </div>
                <div style={{ fontSize: "2.2rem", marginTop: "0.2rem" }}>
                  {detectedFingers} 🖐️
                </div>
              </div>
            </div>
          )}

          <p style={{ 
            fontSize: "1.1rem", 
            color: "#666",
            textAlign: "center",
            fontWeight: "500",
            margin: "0.5rem 0"
          }}>
            🖐️ Giơ tay lên trước camera
          </p>
        </div>

        {/* Cột phải: Câu hỏi và thông tin */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "2rem",
          justifyContent: "center",
          alignItems: "center"
        }}>
          {/* Câu hỏi */}
          <div style={{ 
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "2rem 3rem",
            borderRadius: "24px",
            boxShadow: "0 12px 32px rgba(102, 126, 234, 0.4)",
            width: "100%",
            textAlign: "center"
          }}>
            <div style={{ 
              fontSize: "1.2rem", 
              color: "rgba(255,255,255,0.9)",
              marginBottom: "0.5rem"
            }}>
              Câu hỏi
            </div>
            <div style={{ 
              fontSize: "4rem", 
              color: "white",
              fontWeight: "bold",
              margin: "0"
            }}>
              {currentQuestion.question}
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div style={{
              background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
              padding: "1.5rem 3rem",
              borderRadius: "50px",
              fontSize: "2.5rem",
              fontWeight: "bold",
              color: "white",
              boxShadow: "0 12px 32px rgba(17, 153, 142, 0.4)",
              animation: "bounce 0.5s ease-in-out",
              textAlign: "center",
              width: "100%"
            }}>
              {feedback}
            </div>
          )}

          {/* Hướng dẫn */}
          <div style={{ 
            background: "#f0f4ff",
            padding: "1.5rem",
            borderRadius: "16px",
            width: "100%"
          }}>
            <h4 style={{ 
              fontSize: "1.3rem", 
              color: "#667eea",
              marginTop: 0,
              marginBottom: "1rem"
            }}>
              📝 Hướng dẫn
            </h4>
            <ul style={{ 
              fontSize: "1.1rem", 
              color: "#555",
              lineHeight: "1.8",
              paddingLeft: "1.5rem"
            }}>
              <li>Giơ tay lên trước camera</li>
              <li>Duỗi ngón tay rõ ràng</li>
              <li>Giữ tay trong khung hình</li>
              <li>Có thể dùng 2 tay để đếm đến 10</li>
            </ul>
          </div>

          {/* Nút bỏ qua */}
          <button 
            className="btn ghost" 
            onClick={handleSkip}
            style={{ 
              fontSize: "1.2rem", 
              padding: "0.75rem 2.5rem",
              marginTop: "1rem"
            }}
          >
            Bỏ qua câu này ⏭️
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @media (max-width: 768px) {
          .writing-game > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </GameShell>
  );
}
