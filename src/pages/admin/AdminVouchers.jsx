import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import { adminService } from "../../services/adminService";
import { Button, SearchInput, Modal, toast, Pagination } from "../../components/shared/AdminUI";

const AdminVouchers = () => {
  const { page } = useParams();
  const navigate = useNavigate();
  const currentPage = page ? parseInt(page, 10) : 1;
  const itemsPerPage = 5;

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

  useEffect(() => {
    if (searchTerm) navigate(`/admin/vouchers`);
  }, [searchTerm, navigate]);

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
        toast.success("Cập nhật mã khuyến mãi thành công!");
      } else {
        await adminService.createVoucher(payload);
        toast.success("Tạo mã khuyến mãi thành công!");
        navigate(`/admin/vouchers`);
      }

      handleCloseModal();
      fetchVouchers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi lưu Voucher.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa mã khuyến mãi này? Hành động này không thể hoàn tác!",
      )
    ) {
      try {
        await adminService.deleteVoucher(id);
        toast.success("Đã xóa mã khuyến mãi thành công!");
        fetchVouchers();
      } catch (error) {
        toast.error("Lỗi khi xóa mã khuyến mãi.");
      }
    }
  };

  const filteredVouchers = vouchers.filter((v) =>
    v.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredVouchers.length / itemsPerPage);
  const currentData = filteredVouchers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageChange = (newPage) => {
    navigate(`/admin/vouchers/page/${newPage}`);
  };

  return (
    <div className="animate-in fade-in min-h-screen bg-slate-50 p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-black uppercase tracking-widest text-slate-900">
          Quản lý Khuyến mãi
        </h1>
      </div>

      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Nhập mã voucher để tìm kiếm..."
        />
        <Button icon={Plus} onClick={() => handleOpenModal()}>
          Tạo mã mới
        </Button>
      </div>

      <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex-1 overflow-x-auto">
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
              ) : currentData.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="p-8 text-center font-bold uppercase tracking-widest text-slate-400"
                  >
                    Chưa có mã khuyến mãi nào
                  </td>
                </tr>
              ) : (
                currentData.map((voucher) => (
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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editId ? "Cập nhật Voucher" : "Tạo Voucher mới"}
      >
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
                placeholder={formData.discountType === "Percentage" ? "10" : "100000"}
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
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang xử lý..." : "Lưu Voucher"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminVouchers;
