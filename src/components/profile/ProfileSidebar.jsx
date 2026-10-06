import { Link } from "react-router-dom";
import { User, Lock, LogOut, Package } from "lucide-react";
import { authService } from "../../services/authService";

const ProfileSidebar = ({ activeTab, setActiveTab }) => {
  const handleLogout = () => {
    authService.logout();
  };

  return (
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
        <Link
          to="/order"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-white/60 hover:text-slate-900"
        >
          <Package size={18} /> Đơn hàng
        </Link>
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
  );
};

export default ProfileSidebar;
