import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import ProfileInfo from "../components/profile/ProfileInfo";
import ProfilePassword from "../components/profile/ProfilePassword";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getMe();
        setUser(data.user);
      } catch (error) {
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

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
        <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="w-full md:w-3/4">
          <div className="rounded-2xl border border-white/60 bg-white/50 p-8 shadow-sm backdrop-blur-xl md:p-10">
            {activeTab === "info" && <ProfileInfo user={user} onUpdateUser={setUser} />}
            {activeTab === "password" && <ProfilePassword />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
