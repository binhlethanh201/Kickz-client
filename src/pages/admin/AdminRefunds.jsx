import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Eye,
  Check,
  X,
  CreditCard,
  User as UserIcon,
  Receipt,
  RotateCcw,
  Package,
  AlertCircle,
} from "lucide-react";
import apiClient from "../../services/apiClient";
import { SearchInput, toast, Pagination, Button } from "../../components/shared/AdminUI";
import {
  getRefundStatusMeta,
  getRefundReasonLabel,
  REFUND_STATUSES,
  requiresReturn,
} from "../../utils/refundUtils";

const AdminRefunds = () => {
  const { page } = useParams();
  const navigate = useNavigate();
  const currentPage = page ? parseInt(page, 10) : 1;
  const itemsPerPage = 6;

  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [adminNote, setAdminNote] = useState("");
  const [acting, setActing] = useState(false);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await apiClient.get("/admin/refunds", { params });
      setRefunds(res.data.refunds || []);
    } catch {
      toast.error("Không thể tải danh sách hoàn tiền");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
    if (currentPage !== 1) {
      navigate(`/admin/refunds`);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (searchTerm && currentPage !== 1) {
      navigate(`/admin/refunds`);
    }
  }, [searchTerm, navigate, currentPage]);

  const openDetail = async (refundId) => {
    setModalOpen(true);
    setDetailLoading(true);
    try {
      const res = await apiClient.get(`/admin/refunds/${refundId}`);
      setSelected(res.data.refund);
    } catch {
      toast.error("Không thể tải chi tiết");
      setModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelected(null);
    setAdminNote("");
  };

  const runAction = async (actionType) => {
    if (actionType === "reject" && !adminNote.trim()) {
      toast.error("Cần ghi lý do từ chối để lưu hồ sơ");
      return;
    }

    try {
      setActing(true);
      const body = { adminNote: adminNote.trim() || undefined };

      const res = await apiClient.patch(`/admin/refunds/${selected._id}/${actionType}`, body);
      toast.success(res.data.message || "Xử lý thành công");
      setSelected(res.data.refund);
      fetchRefunds();
      setAdminNote("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Xử lý thất bại");
    } finally {
      setActing(false);
    }
  };

  const filtered = refunds.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      !q ||
      r.orderId?.orderCode?.toString().toLowerCase().includes(q) ||
      r.userId?.email?.toLowerCase().includes(q) ||
      `${r.userId?.firstName || ""} ${r.userId?.lastName || ""}`.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage) => {
    navigate(`/admin/refunds/page/${newPage}`);
  };

  const isReturnRequired = selected ? requiresReturn(selected.reason) : false;

  return (
    <div className="animate-in fade-in min-h-screen bg-slate-50 p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-black uppercase tracking-widest text-slate-900">
          Quản lý Hoàn tiền
        </h1>
      </div>
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <div className="flex-1">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo mã đơn, email, tên khách hàng..."
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="cursor-pointer rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-bold uppercase tracking-wider text-slate-700 outline-none focus:border-slate-900 focus:bg-white"
        >
          <option value="">Tất cả trạng thái</option>
          {REFUND_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-500">
              <tr>
                <th className="p-4">Mã đơn</th>
                <th className="p-4">Khách hàng</th>
                <th className="p-4">Lý do hoàn tiền</th>
                <th className="p-4">Số tiền hoàn</th>
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
                    Chưa có yêu cầu nào
                  </td>
                </tr>
              ) : (
                currentData.map((r) => {
                  const meta = getRefundStatusMeta(r.status);
                  return (
                    <tr key={r._id} className="transition-colors hover:bg-slate-50">
                      <td className="p-4">
                        <span className="font-mono font-black text-slate-900">
                          #{r.orderId?.orderCode || r._id.slice(-6)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                            <UserIcon size={20} />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-900">
                              {r.userId?.firstName} {r.userId?.lastName}
                            </span>
                            <span className="text-xs text-slate-500">{r.userId?.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-600">
                        {getRefundReasonLabel(r.reason)}
                      </td>
                      <td className="p-4 font-black text-slate-900">
                        {r.refundAmount?.toLocaleString("vi-VN")} đ
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${meta.color}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => openDetail(r._id)}
                            title="Xử lý / Xem chi tiết"
                            className="rounded-lg bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-900 hover:text-white"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="animate-in zoom-in-95 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl duration-200">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/90 p-6 backdrop-blur-md">
              <div>
                <h2 className="text-xl font-black uppercase tracking-widest text-slate-900">
                  Chi tiết & Xử lý Hoàn tiền
                </h2>
                <p className="mt-1 font-mono text-xs font-bold uppercase tracking-widest text-slate-400">
                  Mã đơn: #{selected?.orderId?.orderCode || selected?._id?.slice(-6)}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            <div className="p-6">
              {detailLoading || !selected ? (
                <div className="py-20 text-center">
                  <p className="animate-pulse font-bold uppercase tracking-widest text-slate-400">
                    Đang tải chi tiết...
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                      <div className="mb-3 flex items-center gap-2 text-slate-400">
                        <UserIcon size={16} />
                        <h3 className="text-xs font-bold uppercase tracking-widest">
                          Thông tin Khách hàng
                        </h3>
                      </div>
                      <p className="mb-1 text-base font-bold text-slate-900">
                        {selected.userId?.firstName} {selected.userId?.lastName}
                      </p>
                      <p className="mb-2 text-xs font-medium text-slate-500">
                        {selected.userId?.email}
                      </p>
                      <p className="text-xs font-medium text-slate-600">
                        <span className="font-bold text-slate-900">Số điện thoại:</span>{" "}
                        {selected.userId?.phone || "Chưa cập nhật"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                      <div className="mb-3 flex items-center gap-2 text-slate-400">
                        <Receipt size={16} />
                        <h3 className="text-xs font-bold uppercase tracking-widest">
                          Thông tin Đơn hàng
                        </h3>
                      </div>
                      <p className="mb-1 text-xs font-medium text-slate-600">
                        <span className="font-bold text-slate-900">Mã đơn:</span> #
                        {selected.orderId?.orderCode}
                      </p>
                      <p className="mb-3 text-xs font-medium text-slate-600">
                        <span className="font-bold text-slate-900">Thanh toán:</span>{" "}
                        <span className="rounded bg-slate-200/70 px-2 py-0.5 font-bold uppercase text-slate-700">
                          {selected.orderId?.paymentMethod || "—"}
                        </span>
                      </p>
                      <div className="border-t border-slate-200/60 pt-2">
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Số tiền yêu cầu hoàn
                        </span>
                        <p className="text-2xl font-black text-slate-900">
                          {selected.refundAmount?.toLocaleString("vi-VN")} đ
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 text-sm shadow-sm">
                    <div className="mb-4 flex items-center gap-2 text-slate-400">
                      <RotateCcw size={16} />
                      <h3 className="text-xs font-bold uppercase tracking-widest">
                        Chi tiết Yêu cầu
                      </h3>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-400">
                          Lý do
                        </span>
                        <p className="font-bold text-slate-900">
                          {getRefundReasonLabel(selected.reason)}
                        </p>
                      </div>

                      {selected.description && (
                        <div>
                          <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-400">
                            Mô tả bổ sung
                          </span>
                          <p className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
                            {selected.description}
                          </p>
                        </div>
                      )}

                      {selected.returnTrackingCode && (
                        <div className="flex items-center gap-2 pt-2">
                          <Package size={16} className="text-slate-400" />
                          <span className="font-bold text-slate-900">Vận đơn trả hàng:</span>
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-800">
                            {selected.returnTrackingCode}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            ({selected.returnCarrier || "—"})
                          </span>
                        </div>
                      )}

                      {selected.adminNote && (
                        <div className="mt-4 rounded-xl border border-amber-200/60 bg-amber-50/50 p-4 text-slate-700">
                          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-amber-800">
                            Ghi chú Admin gần nhất:
                          </span>
                          <p className="text-sm font-medium text-amber-900">{selected.adminNote}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-6">
                    {selected.status === "requested" && (
                      <div className="space-y-4">
                        <div>
                          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                            Ghi chú Admin{" "}
                            <span className="font-medium normal-case tracking-normal text-red-500">
                              *(Bắt buộc khi Từ chối)
                            </span>
                          </label>
                          <textarea
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            rows={3}
                            placeholder="Nhập ghi chú hoặc lý do từ chối..."
                            className="w-full resize-none rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-slate-900 focus:bg-white"
                          />
                        </div>
                        <div className="flex gap-4">
                          <Button
                            onClick={() => runAction("approve")}
                            disabled={acting}
                            className="flex-1 border-none bg-emerald-600 py-3.5 text-white hover:bg-emerald-700"
                          >
                            <Check size={18} className="mr-2 inline" />
                            Duyệt Yêu Cầu
                          </Button>
                          <button
                            onClick={() => runAction("reject")}
                            disabled={acting}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3.5 font-bold uppercase tracking-widest text-red-600 transition-all hover:bg-red-500 hover:text-white disabled:opacity-50"
                          >
                            <X size={18} />
                            Từ chối
                          </button>
                        </div>
                      </div>
                    )}

                    {((!isReturnRequired && selected.status === "approved") ||
                      (isReturnRequired &&
                        ["approved", "shipped_back", "received"].includes(selected.status))) && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6">
                        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
                            Xác nhận Hoàn tiền vào Ví
                          </h3>
                          {isReturnRequired && selected.status !== "received" && (
                            <button
                              onClick={() => runAction("received")}
                              disabled={acting}
                              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50"
                            >
                              Xác nhận đã nhận hàng trả về
                            </button>
                          )}
                        </div>

                        <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-200/80 bg-blue-50/70 p-4 text-xs font-medium text-blue-900">
                          <CreditCard className="mt-0.5 shrink-0 text-blue-600" size={18} />
                          <p className="leading-relaxed">
                            Khi bấm hoàn tiền, hệ thống sẽ tự động cộng{" "}
                            <b className="font-extrabold">
                              {selected.refundAmount?.toLocaleString("vi-VN")} ₫
                            </b>{" "}
                            trực tiếp vào <b className="font-extrabold">Số dư Ví (Card Balance)</b>{" "}
                            của khách hàng.
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                              Ghi chú Admin (Không bắt buộc)
                            </label>
                            <textarea
                              value={adminNote}
                              onChange={(e) => setAdminNote(e.target.value)}
                              placeholder="Ghi chú nội bộ..."
                              rows={3}
                              className="w-full resize-none rounded-xl border-2 border-slate-100 bg-white p-3 text-sm font-medium outline-none focus:border-slate-900"
                            />
                          </div>

                          <Button
                            onClick={() => runAction("refunded")}
                            disabled={acting}
                            className="w-full py-4 text-sm"
                          >
                            {acting ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Đang xử lý...
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <Check size={18} />
                                Hoàn tiền vào ví & Hủy đơn
                              </div>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRefunds;
