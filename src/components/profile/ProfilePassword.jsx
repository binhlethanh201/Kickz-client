import { useState } from "react";
import { authService } from "../../services/authService";

const ProfilePassword = () => {
  const [passForm, setPassForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passStatus, setPassStatus] = useState({ type: "", message: "" });
  const [isChangingPass, setIsChangingPass] = useState(false);

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
      setPassForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setPassStatus({
        type: "error",
        message: error.response?.data?.message || "Đổi mật khẩu thất bại.",
      });
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
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
            onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
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
  );
};

export default ProfilePassword;
