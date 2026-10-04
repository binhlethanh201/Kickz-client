import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.register(firstName, lastName, email, password);

      // Đăng ký thành công thì chuyển hướng người dùng về trang Đăng nhập
      navigate("/login");
    } catch (err) {
      // Bắt lỗi từ backend (ví dụ: Email đã tồn tại)
      setError(err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-20 max-w-md rounded-2xl border border-white/50 bg-white/40 px-8 py-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
      <div className="mb-12 text-center">
        <h1 className="mb-2 text-3xl font-light uppercase tracking-widest">Đăng ký</h1>
        <p className="text-sm font-light text-gray-500">Tạo tài khoản KICKZ mới của bạn</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-8">
        {error && (
          <div className="bg-red-50 p-4 text-center text-sm font-medium text-red-600">{error}</div>
        )}

        <div className="space-y-6">
          {/* Hàng chứa Tên và Họ */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-900">
                Tên
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full rounded-none border-b border-gray-300 bg-transparent py-2 transition-colors focus:border-black focus:outline-none"
                placeholder=""
              />
            </div>
            <div className="w-1/2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-900">
                Họ
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full rounded-none border-b border-gray-300 bg-transparent py-2 transition-colors focus:border-black focus:outline-none"
                placeholder=""
              />
            </div>
          </div>

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
              placeholder="name@example.com"
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
              minLength={6}
              className="w-full rounded-none border-b border-gray-300 bg-transparent py-2 transition-colors focus:border-black focus:outline-none"
              placeholder="Ít nhất 6 ký tự"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black py-4 text-sm font-medium uppercase tracking-widest text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : "Tạo tài khoản"}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-500">
        Bạn đã có tài khoản?{" "}
        <Link to="/login" className="font-medium text-black underline hover:text-gray-600">
          Đăng nhập
        </Link>
      </div>
    </div>
  );
};

export default Register;
