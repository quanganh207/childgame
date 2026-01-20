import { Link, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

type Props = {
  userEmail?: string | null;
};

export function NavBar({ userEmail }: Props) {
  const { pathname } = useLocation();
  const linkClass = (path: string) =>
    pathname === path ? "nav-link active" : "nav-link";

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        stemgme
      </Link>
      <div className="nav-items">
        <Link to="/play" className={linkClass("/play")}>
          Trò chơi
        </Link>
        <Link to="/shop" className={linkClass("/shop")}>
          Cửa hàng
        </Link>
        <Link to="/parent" className={linkClass("/parent")}>
          Phụ huynh
        </Link>
        {userEmail ? (
          <button className="btn ghost" onClick={() => signOut(auth)}>
            Thoát ({userEmail})
          </button>
        ) : (
          <Link to="/login" className="btn ghost">
            Đăng nhập
          </Link>
        )}
      </div>
    </nav>
  );
}
