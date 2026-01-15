import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage("Đăng nhập thành công!");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage("Tạo tài khoản thành công!");
      }
      navigate("/play");
    } catch (error) {
      const description = error instanceof Error ? error.message : "Lỗi không xác định";
      setMessage(description);
    }
  };

  return (
    <div className="page narrow">
      <h2>{mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}</h2>
      <p className="muted">Firebase Auth: email/password.</p>
      <form onSubmit={submit} className="stack">
        <label className="stack-sm">
          <span>Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="me@example.com"
          />
        </label>
        <label className="stack-sm">
          <span>Mật khẩu</span>
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
          />
        </label>
        <button className="btn primary" type="submit">
          {mode === "login" ? "Đăng nhập" : "Đăng ký"}
        </button>
        <button
          className="btn ghost"
          type="button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}
        </button>
      </form>
      {message && <p className="muted">{message}</p>}
    </div>
  );
}
