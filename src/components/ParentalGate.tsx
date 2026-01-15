import { useState } from "react";

type Props = {
  onVerified: () => void;
  pinHint?: string;
};

export function ParentalGate({ onVerified, pinHint }: Props) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    
    setTimeout(() => {
      if (pin === "1234") {
        setIsLoading(false);
        onVerified();
      } else {
        setError("Mã PIN không đúng! Thử lại (demo: 1234)");
        setPin("");
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="parental-gate-overlay">
      <div className="card parental-gate">
        <div className="gate-header">
          <h3>🔒 Cổng phụ huynh</h3>
        </div>
        <p className="muted gate-description">Nhập mã PIN để mở cài đặt.</p>
        {pinHint && <p className="gate-hint">💡 Gợi ý: {pinHint}</p>}
        <form onSubmit={handleSubmit} className="gate-form">
          <label className="form-group">
            <span className="form-label">Mã PIN 4 số</span>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
              placeholder="• • • •"
              inputMode="numeric"
              maxLength={4}
              className="pin-input"
              disabled={isLoading}
            />
          </label>
          <button 
            type="submit" 
            className="btn primary btn-lg"
            disabled={pin.length !== 4 || isLoading}
          >
            {isLoading ? "Kiểm tra..." : "Mở khóa"}
          </button>
        </form>
        {error && <p className="error gate-error">{error}</p>}
      </div>
    </div>
  );
}
