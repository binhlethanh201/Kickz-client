import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, LogOut } from "lucide-react";
import { authService } from "../services/authService";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info"); // 'info' hoặc 'password'

  // State cho form đổi mật khẩu
  const [passForm, setPassForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passStatus, setPassStatus] = useState({ type: "", message: "" });
  const [isChangingPass, setIsChangingPass] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getMe();
        setUser(data.user);
      } catch (error) {
        console.error("Lỗi lấy thông tin:", error);
        // Nếu lỗi (token hết hạn/chưa đăng nhập), đá về trang login
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassStatus({ type: "", message: "" });

    if (passForm.newPassword !== passForm.confirmPassword) {
      return setPassStatus({ type: "error", message: "Mật khẩu xác nhận không khớp!" });
    }
    if (passForm.newPassword.length < 6) {
      return setPassStatus({ type: "error", message: "Mật khẩu mới phải có ít nhất 6 ký tự." });
    }

    setIsChangingPass(true);
    try {
      await authService.changePassword(passForm.oldPassword, passForm.newPassword);
      setPassStatus({ type: "success", message: "Đổi mật khẩu thành công!" });
      setPassForm({ oldPassword: "", newPassword: "", confirmPassword: "" }); // Reset form
    } catch (error) {
      setPassStatus({
        type: "error",
        message: error.response?.data?.message || "Đổi mật khẩu thất bại.",
      });
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="animate-pulse text-sm uppercase tracking-widest text-slate-400">
          Đang tải dữ liệu...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-[75vh] max-w-5xl px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-light uppercase tracking-widest text-slate-900">
          Tài khoản của tôi
        </h1>
        <p className="mt-2 text-sm text-slate-500">Quản lý thông tin và bảo mật</p>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Cột trái: Menu (Glassmorphism) */}
        <div className="w-full md:w-1/4">
          <div className="flex flex-col gap-2 overflow-hidden rounded-2xl border border-white/60 bg-white/50 p-4 shadow-sm backdrop-blur-xl">
            <button
              onClick={() => setActiveTab("info")}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "info"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
              }`}
            >
              <User size={18} /> Hồ sơ
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "password"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
              }`}
            >
              <Lock size={18} /> Đổi mật khẩu
            </button>
            <div className="my-2 border-t border-white/50"></div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50/50"
            >
              <LogOut size={18} /> Đăng xuất
            </button>
          </div>
        </div>

        {/* Cột phải: Nội dung */}
        <div className="w-full md:w-3/4">
          <div className="rounded-2xl border border-white/60 bg-white/50 p-8 shadow-sm backdrop-blur-xl md:p-10">
            {/* Tab: Thông tin cá nhân */}
            {activeTab === "info" && user && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h2 className="mb-6 text-xl font-medium uppercase tracking-widest text-slate-900">
                  Thông tin cá nhân
                </h2>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Họ và Tên
                    </label>
                    <p className="text-base text-slate-900">
                      {user.lastName} {user.firstName}
                    </p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Email
                    </label>
                    <p className="text-base text-slate-900">{user.email}</p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Số điện thoại
                    </label>
                    <p className="text-base text-slate-900">{user.phone || "Chưa cập nhật"}</p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Giới tính
                    </label>
                    <p className="text-base capitalize text-slate-900">
                      {user.gender || "Chưa cập nhật"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Địa chỉ giao hàng mặc định
                    </label>
                    <p className="text-base text-slate-900">{user.address || "Chưa cập nhật"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Đổi mật khẩu */}
            {activeTab === "password" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h2 className="mb-6 text-xl font-medium uppercase tracking-widest text-slate-900">
                  Đổi mật khẩu
                </h2>

                {passStatus.message && (
                  <div
                    className={`mb-6 rounded-xl p-4 text-sm font-medium ${passStatus.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
                  >
                    {passStatus.message}
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="max-w-md space-y-6">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-900">
                      Mật khẩu hiện tại
                    </label>
                    <input
                      type="password"
                      required
                      value={passForm.oldPassword}
                      onChange={(e) => setPassForm({ ...passForm, oldPassword: e.target.value })}
                      className="w-full rounded-none border-b border-slate-300 bg-transparent py-2 transition-colors focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-900">
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      required
                      value={passForm.newPassword}
                      onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                      className="w-full rounded-none border-b border-slate-300 bg-transparent py-2 transition-colors focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-900">
                      Xác nhận mật khẩu mới
                    </label>
                    <input
                      type="password"
                      required
                      value={passForm.confirmPassword}
                      onChange={(e) =>
                        setPassForm({ ...passForm, confirmPassword: e.target.value })
                      }
                      className="w-full rounded-none border-b border-slate-300 bg-transparent py-2 transition-colors focus:border-slate-900 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isChangingPass}
                    className="mt-4 w-full rounded-xl bg-slate-900 py-4 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-slate-800 hover:shadow-lg disabled:opacity-50"
                  >
                    {isChangingPass ? "Đang xử lý..." : "Lưu thay đổi"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
