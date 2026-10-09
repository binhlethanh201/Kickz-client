import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  User as UserIcon,
  RefreshCw,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { Button, SearchInput, Modal, toast, Pagination } from "../../components/shared/AdminUI";

const ROLE_COLORS = {
  owner: "bg-black text-white",
  admin: "bg-red-100 text-red-700 border border-red-200",
  staff: "bg-blue-100 text-blue-700 border border-blue-200",
  user: "bg-slate-100 text-slate-700 border border-slate-200",
};

const AdminUsers = () => {
  const { page } = useParams();
  const navigate = useNavigate();
  const currentPage = page ? parseInt(page, 10) : 1;
  const itemsPerPage = 5;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active");

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

  useEffect(() => {
    if (searchTerm) navigate(`/admin/users`);
  }, [searchTerm, navigate]);

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
        toast.success("Cập nhật người dùng thành công!");
      } else {
        if (!formData.password) {
          toast.error("Vui lòng nhập mật khẩu cho người dùng mới!");
          setIsSubmitting(false);
          return;
        }
        await adminService.createUser(formData);
        toast.success("Thêm người dùng mới thành công!");
        navigate(`/admin/users`);
      }

      handleCloseModal();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi lưu người dùng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, role) => {
    if (role === "owner" || role === "admin") {
      return toast.error("Không thể khóa tài khoản Admin hoặc Owner qua giao diện này!");
    }

    if (window.confirm("Bạn có chắc chắn muốn khóa tài khoản này?")) {
      try {
        await adminService.deleteUser(id);
        toast.success("Đã khóa tài khoản thành công!");
        fetchUsers();
      } catch (error) {
        toast.error("Có lỗi xảy ra khi khóa.");
      }
    }
  };

  const handleRestore = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn khôi phục tài khoản này?")) {
      try {
        await adminService.updateUser(id, { isActive: true });
        toast.success("Khôi phục tài khoản thành công!");
        fetchUsers();
      } catch (error) {
        toast.error("Có lỗi xảy ra khi khôi phục.");
      }
    }
  };

  const userTabs = [
    { id: "active", label: "Đang hoạt động" },
    { id: "inactive", label: "Đã vô hiệu hóa" },
  ];

  const filteredUsers = users.filter((u) => {
    const isUserActive = u.isActive !== false;
    const matchesTab = activeTab === "active" ? isUserActive : !isUserActive;
    const matchesSearch =
      (u.firstName + " " + u.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentData = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageChange = (newPage) => {
    navigate(`/admin/users/page/${newPage}`);
  };

  return (
    <div className="animate-in fade-in min-h-screen bg-slate-50 p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-black uppercase tracking-widest text-slate-900">
          Quản lý Tài khoản
        </h1>
      </div>

      <div className="mb-8 flex gap-8 border-b border-slate-200">
        {userTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchTerm("");
              navigate(`/admin/users`);
            }}
            className={`border-b-2 pb-4 text-sm font-bold uppercase tracking-widest transition-all ${
              activeTab === tab.id
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm theo tên hoặc email..."
        />
        {activeTab === "active" && (
          <Button icon={Plus} onClick={() => handleOpenModal()}>
            Tạo tài khoản
          </Button>
        )}
      </div>

      <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex-1 overflow-x-auto">
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
              ) : currentData.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-8 text-center font-bold uppercase tracking-widest text-slate-400"
                  >
                    Không tìm thấy tài khoản nào
                  </td>
                </tr>
              ) : (
                currentData.map((user) => (
                  <tr
                    key={user._id}
                    className={`transition-colors hover:bg-slate-50 ${activeTab === "inactive" ? "opacity-60" : ""}`}
                  >
                    <td className="flex items-center gap-4 p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                        <UserIcon size={24} />
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
                      {activeTab === "active" ? (
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
                            title="Khóa tài khoản"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleRestore(user._id)}
                            className="rounded-lg bg-emerald-50 p-2 text-emerald-600 transition-colors hover:bg-emerald-500 hover:text-white"
                            title="Khôi phục tài khoản"
                          >
                            <RefreshCw size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editId ? "Cập nhật tài khoản" : "Tạo tài khoản mới"}
      >
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
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang xử lý..." : "Lưu thông tin"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminUsers;
