import { ReactNode } from "react";
import { Link } from "react-router-dom";

type Props = {
  title: string;
  children: ReactNode;
  onBack?: () => void;
  stars?: number;
};

export function GameShell({ title, children, onBack, stars }: Props) {
  return (
    <div className="game-shell-wrapper">
      <div className="game-shell">
        <header className="game-shell__header">
          <div className="left">
            {onBack ? (
              <button onClick={onBack} className="btn-back ghost">
                ← Quay lại
              </button>
            ) : (
              <Link to="/play" className="btn-back ghost">
                ← Menu trò chơi
              </Link>
            )}
          </div>
          <div className="center">
            <h2>{title}</h2>
          </div>
          <div className="right">{typeof stars === "number" ? `⭐ ${stars}` : null}</div>
        </header>
        <main className="game-shell__body">{children}</main>
      </div>
    </div>
  );
}
