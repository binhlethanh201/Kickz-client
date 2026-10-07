import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, X, ShieldAlert, ShieldCheck, User } from "lucide-react";
import { adminService } from "../../services/adminService";

const ROLE_COLORS = {
  owner: "bg-black text-white",
  admin: "bg-red-100 text-red-700 border border-red-200",
  staff: "bg-blue-100 text-blue-700 border border-blue-200",
  user: "bg-slate-100 text-slate-700 border border-slate-200",
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFormState = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "user",
    phone: "",
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Lỗi lấy danh sách người dùng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditId(user._id);
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: "",
        role: user.role || "user",
        phone: user.phone || "",
      });
    } else {
      setEditId(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormState);
    setEditId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editId) {
        const updateData = { ...formData };
        delete updateData.password;
        await adminService.updateUser(editId, updateData);
        alert("Cập nhật người dùng thành công!");
      } else {
        if (!formData.password) {
          alert("Vui lòng nhập mật khẩu cho người dùng mới!");
          setIsSubmitting(false);
          return;
        }
        await adminService.createUser(formData);
        alert("Thêm người dùng mới thành công!");
      }

      handleCloseModal();
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Có lỗi xảy ra khi lưu người dùng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, role) => {
    if (role === "owner" || role === "admin") {
      return alert("Không thể xóa tài khoản Admin hoặc Owner qua giao diện này!");
    }

    if (window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) {
      try {
        await adminService.deleteUser(id);
        fetchUsers();
      } catch (error) {
        alert("Có lỗi xảy ra khi xóa.");
      }
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.firstName + " " + u.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-black uppercase tracking-widest text-slate-900">
          Quản lý Tài khoản
        </h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-slate-800 hover:shadow-lg"
        >
          <Plus size={18} strokeWidth={2.5} />
          Tạo tài khoản mới
        </button>
      </div>

      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-1 items-center gap-3 rounded-xl bg-slate-50 px-4 py-2 text-slate-500">
          <Search size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-500">
              <tr>
                <th className="p-4">Khách hàng</th>
                <th className="p-4">Phân quyền</th>
                <th className="p-4">Số điện thoại</th>
                <th className="p-4">Ngày tham gia</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="animate-pulse p-8 text-center font-bold uppercase tracking-widest text-slate-400"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-8 text-center font-bold uppercase tracking-widest text-slate-400"
                  >
                    Không tìm thấy tài khoản nào
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="transition-colors hover:bg-slate-50">
                    <td className="flex items-center gap-4 p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                        <User size={24} />
                      </div>
                      <div>
                        <span className="block font-bold text-slate-900">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-xs text-slate-500">{user.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${ROLE_COLORS[user.role] || ROLE_COLORS.user}`}
                      >
                        {user.role === "admin" || user.role === "owner" ? (
                          <ShieldAlert size={12} />
                        ) : (
                          <ShieldCheck size={12} />
                        )}
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-600">
                      {user.phone || <span className="italic text-slate-300">Chưa cập nhật</span>}
                    </td>
                    <td className="p-4 font-medium text-slate-600">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="rounded-lg bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-900 hover:text-white"
                          title="Sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id, user.role)}
                          className="rounded-lg bg-red-50 p-2 text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="animate-in zoom-in-95 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl duration-200">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-widest text-slate-900">
                {editId ? "Cập nhật tài khoản" : "Tạo tài khoản mới"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Họ (Last Name) *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-medium outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Tên (First Name) *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-medium outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-medium outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Phân quyền *
                  </label>
                  <select
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full cursor-pointer appearance-none rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-medium uppercase tracking-wider outline-none focus:border-slate-900 focus:bg-white"
                  >
                    <option value="user">User (Khách hàng)</option>
                    <option value="staff">Staff (Nhân viên)</option>
                    <option value="admin">Admin (Quản trị viên)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-medium outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>

                {!editId && (
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                      Mật khẩu khởi tạo *
                    </label>
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-medium outline-none focus:border-slate-900 focus:bg-white"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-xl bg-slate-100 px-6 py-3 text-sm font-bold uppercase tracking-widest text-slate-600 transition-colors hover:bg-slate-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-slate-900 px-8 py-3 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-slate-800 hover:shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Đang xử lý..." : "Lưu thông tin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
