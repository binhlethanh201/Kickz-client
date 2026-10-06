import { useState, useEffect } from "react";
import { Edit2, X, Check } from "lucide-react";
import { authService } from "../../services/authService";

const ProfileInfo = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    gender: "",
    address: { street: "", district: "", city: "", country: "" },
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        gender: user.gender || "",
        address: {
          street: user.address?.street || "",
          district: user.address?.district || "",
          city: user.address?.city || "",
          country: user.address?.country || "",
        },
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const data = await authService.updateProfile(profileForm);
      onUpdateUser(data.user);
      setIsEditing(false);
      alert("Cập nhật thông tin thành công!");
    } catch (error) {
      alert(error.response?.data?.message || "Cập nhật thất bại.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setProfileForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
      gender: user.gender || "",
      address: {
        street: user.address?.street || "",
        district: user.address?.district || "",
        city: user.address?.city || "",
        country: user.address?.country || "",
      },
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-medium uppercase tracking-widest text-slate-900">
          Thông tin cá nhân
        </h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <Edit2 size={16} /> Chỉnh sửa
          </button>
        )}
      </div>

      <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-500">
            Họ
          </label>
          {isEditing ? (
            <input
              type="text"
              value={profileForm.lastName}
              onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
              className="w-full rounded-none border-b border-slate-300 bg-transparent py-1 transition-colors focus:border-slate-900 focus:outline-none"
            />
          ) : (
            <p className="text-base font-medium text-slate-900">{user.lastName}</p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-500">
            Tên
          </label>
          {isEditing ? (
            <input
              type="text"
              value={profileForm.firstName}
              onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
              className="w-full rounded-none border-b border-slate-300 bg-transparent py-1 transition-colors focus:border-slate-900 focus:outline-none"
            />
          ) : (
            <p className="text-base font-medium text-slate-900">{user.firstName}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-500">
            Email (Không thể thay đổi)
          </label>
          <p className="text-base text-slate-500">{user.email}</p>
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-500">
            Số điện thoại
          </label>
          {isEditing ? (
            <input
              type="text"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              className="w-full rounded-none border-b border-slate-300 bg-transparent py-1 transition-colors focus:border-slate-900 focus:outline-none"
              placeholder="Thêm số điện thoại"
            />
          ) : (
            <p className="text-base font-medium text-slate-900">{user.phone || "Chưa cập nhật"}</p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-500">
            Giới tính
          </label>
          {isEditing ? (
            <select
              value={profileForm.gender}
              onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
              className="w-full cursor-pointer rounded-none border-b border-slate-300 bg-transparent py-1 transition-colors focus:border-slate-900 focus:outline-none"
            >
              <option value="">Chọn giới tính</option>
              <option value="M">Nam</option>
              <option value="F">Nữ</option>
              <option value="O">Khác</option>
            </select>
          ) : (
            <p className="text-base font-medium capitalize text-slate-900">
              {user.gender === "M"
                ? "Nam"
                : user.gender === "F"
                  ? "Nữ"
                  : user.gender === "O"
                    ? "Khác"
                    : "Chưa cập nhật"}
            </p>
          )}
        </div>

        <div className="mt-2 border-t border-slate-200 pt-6 md:col-span-2">
          <label className="mb-4 block text-xs font-bold uppercase tracking-widest text-slate-900">
            Địa chỉ giao hàng
          </label>
          {isEditing ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Số nhà, Tên đường
                </label>
                <input
                  type="text"
                  value={profileForm.address.street}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      address: { ...profileForm.address, street: e.target.value },
                    })
                  }
                  className="w-full rounded-none border-b border-slate-300 bg-transparent py-1 transition-colors focus:border-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Quận / Huyện
                </label>
                <input
                  type="text"
                  value={profileForm.address.district}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      address: { ...profileForm.address, district: e.target.value },
                    })
                  }
                  className="w-full rounded-none border-b border-slate-300 bg-transparent py-1 transition-colors focus:border-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Tỉnh / Thành phố
                </label>
                <input
                  type="text"
                  value={profileForm.address.city}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      address: { ...profileForm.address, city: e.target.value },
                    })
                  }
                  className="w-full rounded-none border-b border-slate-300 bg-transparent py-1 transition-colors focus:border-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Quốc gia
                </label>
                <input
                  type="text"
                  value={profileForm.address.country}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      address: { ...profileForm.address, country: e.target.value },
                    })
                  }
                  className="w-full rounded-none border-b border-slate-300 bg-transparent py-1 transition-colors focus:border-slate-900 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <p className="text-base font-medium text-slate-900">
              {user.address
                ? [
                    user.address.street,
                    user.address.district,
                    user.address.city,
                    user.address.country,
                  ]
                    .filter(Boolean)
                    .join(", ")
                : "Chưa cập nhật"}
            </p>
          )}
        </div>

        {isEditing && (
          <div className="mt-4 flex gap-4 md:col-span-2">
            <button
              type="submit"
              disabled={isUpdating}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-slate-800 disabled:opacity-50"
            >
              {isUpdating ? (
                "Đang lưu..."
              ) : (
                <>
                  <Check size={18} /> Lưu thay đổi
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={isUpdating}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-transparent py-3 text-sm font-bold uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-100 disabled:opacity-50"
            >
              <X size={18} /> Hủy
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileInfo;
