import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authService.login(email, password);

      if (data.token) {
        localStorage.setItem("token", data.token);
        if (data.user?.role) {
          localStorage.setItem("role", data.user.role);
        }

        if (data.user?.role === "admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-20 max-w-md rounded-2xl border border-white/50 bg-white/40 px-8 py-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
      <div className="mb-12 text-center">
        <h1 className="mb-2 text-3xl font-light uppercase tracking-widest">Đăng nhập</h1>
        <p className="text-sm font-light text-gray-500">
          Vui lòng nhập thông tin tài khoản của bạn
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-8">
        {error && (
          <div className="bg-red-50 p-4 text-center text-sm font-medium text-red-600">{error}</div>
        )}

        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-900">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-none border-b border-gray-300 bg-transparent py-2 transition-colors focus:border-black focus:outline-none"
              placeholder="Ví dụ: name@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-900">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-none border-b border-gray-300 bg-transparent py-2 transition-colors focus:border-black focus:outline-none"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black py-4 text-sm font-medium uppercase tracking-widest text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-500">
        Bạn chưa có tài khoản?{" "}
        <Link to="/register" className="font-medium text-black underline hover:text-gray-600">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
};

export default Login;
