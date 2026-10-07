import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, X, Tag } from "lucide-react";
import { adminService } from "../../services/adminService";

const AdminVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFormState = {
    code: "",
    description: "",
    discountType: "Percentage",
    discountValue: "",
    minOrderValue: 0,
    expiresAt: "",
    isActive: true,
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllVouchers();
      setVouchers(data);
    } catch (error) {
      console.error("Lỗi lấy danh sách voucher:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleOpenModal = (voucher = null) => {
    if (voucher) {
      setEditId(voucher._id);
      let formDiscountType = "Percentage";
      if (voucher.discountType === "amount") formDiscountType = "Fixed";
      let formattedDate = "";
      if (voucher.endDate) {
        formattedDate = new Date(voucher.endDate).toISOString().split("T")[0];
      }

      setFormData({
        code: voucher.code,
        description: voucher.description || "",
        discountType: formDiscountType,
        discountValue: voucher.discountValue,
        minOrderValue: voucher.minOrderValue || 0,
        expiresAt: formattedDate,
        isActive: voucher.isActive,
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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        discountValue: Number(formData.discountValue),
        minOrderValue: Number(formData.minOrderValue),
      };

      if (editId) {
        await adminService.updateVoucher(editId, payload);
        alert("Cập nhật mã khuyến mãi thành công!");
      } else {
        await adminService.createVoucher(payload);
        alert("Tạo mã khuyến mãi thành công!");
      }

      handleCloseModal();
      fetchVouchers();
    } catch (error) {
      alert(error.response?.data?.message || "Có lỗi xảy ra khi lưu Voucher.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa mã khuyến mãi này?")) {
      try {
        await adminService.deleteVoucher(id);
        fetchVouchers();
      } catch (error) {
        alert("Lỗi khi xóa mã khuyến mãi.");
      }
    }
  };

  const filteredVouchers = vouchers.filter((v) =>
    v.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-black uppercase tracking-widest text-slate-900">
          Quản lý Khuyến mãi
        </h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-slate-800 hover:shadow-lg"
        >
          <Plus size={18} strokeWidth={2.5} />
          Tạo mã mới
        </button>
      </div>

      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-1 items-center gap-3 rounded-xl bg-slate-50 px-4 py-2 text-slate-500">
          <Search size={20} />
          <input
            type="text"
            placeholder="Nhập mã voucher để tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-sm font-medium uppercase outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-500">
              <tr>
                <th className="p-4">Mã Voucher</th>
                <th className="p-4">Giá trị giảm</th>
                <th className="p-4">Đơn tối thiểu</th>
                <th className="p-4">Hạn sử dụng</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="animate-pulse p-8 text-center font-bold uppercase tracking-widest text-slate-400"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredVouchers.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="p-8 text-center font-bold uppercase tracking-widest text-slate-400"
                  >
                    Chưa có mã khuyến mãi nào
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((voucher) => (
                  <tr key={voucher._id} className="transition-colors hover:bg-slate-50">
                    <td className="flex items-center gap-4 p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                        <Tag size={24} />
                      </div>
                      <div>
                        <span className="block font-black uppercase tracking-widest text-slate-900">
                          {voucher.code}
                        </span>
                        <span className="line-clamp-1 max-w-[150px] text-xs text-slate-500">
                          {voucher.description}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-black text-slate-900">
                      {voucher.discountType === "percent"
                        ? `${voucher.discountValue}%`
                        : `${voucher.discountValue.toLocaleString("vi-VN")} đ`}
                    </td>
                    <td className="p-4 font-medium text-slate-600">
                      {voucher.minOrderValue > 0
                        ? `${voucher.minOrderValue.toLocaleString("vi-VN")} đ`
                        : "Không yêu cầu"}
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-slate-600">
                        {new Date(voucher.endDate).toLocaleDateString("vi-VN")}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${voucher.isActive ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"}`}
                      >
                        {voucher.isActive ? "Đang chạy" : "Tạm ngưng"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleOpenModal(voucher)}
                          className="rounded-lg bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-900 hover:text-white"
                          title="Sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(voucher._id)}
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
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black uppercase tracking-widest text-slate-900">
                {editId ? "Cập nhật Voucher" : "Tạo Voucher mới"}
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
                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Mã Code *
                  </label>
                  <input
                    type="text"
                    name="code"
                    required
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: KICKZ100"
                    className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-black uppercase tracking-widest outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Loại giảm giá *
                  </label>
                  <select
                    name="discountType"
                    required
                    value={formData.discountType}
                    onChange={handleInputChange}
                    className="w-full cursor-pointer appearance-none rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-medium outline-none focus:border-slate-900 focus:bg-white"
                  >
                    <option value="Percentage">Phần trăm (%)</option>
                    <option value="Fixed">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Giá trị giảm *
                  </label>
                  <input
                    type="number"
                    name="discountValue"
                    required
                    min="1"
                    value={formData.discountValue}
                    onChange={handleInputChange}
                    placeholder={formData.discountType === "Percentage" ? "10%" : "100.000đ"}
                    className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-medium outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Đơn hàng tối thiểu (VNĐ)
                  </label>
                  <input
                    type="number"
                    name="minOrderValue"
                    min="0"
                    value={formData.minOrderValue}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-medium outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Ngày hết hạn *
                  </label>
                  <input
                    type="date"
                    name="expiresAt"
                    required
                    value={formData.expiresAt}
                    onChange={handleInputChange}
                    className="w-full cursor-pointer rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-medium outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Mô tả chương trình
                  </label>
                  <textarea
                    name="description"
                    rows="2"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="VD: Giảm giá nhân dịp Black Friday..."
                    className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-medium outline-none focus:border-slate-900 focus:bg-white"
                  ></textarea>
                </div>

                <div className="flex items-center gap-3 md:col-span-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-5 w-5 cursor-pointer rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                  />
                  <label
                    htmlFor="isActive"
                    className="cursor-pointer text-sm font-bold uppercase tracking-widest text-slate-900"
                  >
                    Kích hoạt Voucher (Cho phép sử dụng ngay)
                  </label>
                </div>
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
                  {isSubmitting ? "Đang xử lý..." : "Lưu Voucher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVouchers;
