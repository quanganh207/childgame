import { Route, Routes } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { PlayMenuPage } from "./pages/PlayMenuPage";
import { ParentDashboard } from "./pages/ParentDashboard";
import { ShopPage } from "./pages/ShopPage";
import { CountingGame } from "./games/counting/CountingGame";
import { BalloonsGame } from "./games/balloons/BalloonsGame";
import { WritingGame } from "./games/writing/Fingercount";
import { FindGame } from "./games/find/FindGame";
import { ConnectGame } from "./games/connect/ConnectGame";
import { ShapesGame } from "./games/shapes/ShapesGame";
import { useAuthListener } from "./hooks/useAuth";

export default function App() {
  const { user } = useAuthListener();

  return (
    <div className="app-shell">
      <NavBar userEmail={user?.email} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/play" element={<PlayMenuPage userEmail={user?.email} />} />
        <Route path="/play/counting" element={<CountingGame />} />
        <Route path="/play/balloons" element={<BalloonsGame />} />
        <Route path="/play/writing" element={<WritingGame />} />
        <Route path="/play/find" element={<FindGame />} />
        <Route path="/play/connect" element={<ConnectGame />} />
        <Route path="/play/shapes" element={<ShapesGame />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/parent" element={<ParentDashboard />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </div>
  );
}
