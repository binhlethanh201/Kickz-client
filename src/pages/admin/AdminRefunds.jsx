import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Eye, Check, X } from "lucide-react";
import apiClient from "../../services/apiClient";
import { SearchInput, toast, Pagination } from "../../components/shared/AdminUI";
import {
  getRefundStatusMeta,
  getRefundReasonLabel,
  getRefundMethodLabel,
  REFUND_STATUSES,
  REFUND_METHODS,
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
  const [refundMethod, setRefundMethod] = useState("bank_transfer");
  const [refundReference, setRefundReference] = useState("");
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
      setRefundMethod(
        res.data.refund?.orderId?.paymentMethod === "payos" ? "payos_reversal" : "bank_transfer",
      );
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
    setRefundMethod("bank_transfer");
    setRefundReference("");
  };

  const runAction = async (actionType) => {
    if (actionType === "reject" && !adminNote.trim()) {
      toast.error("Cần ghi lý do từ chối để lưu hồ sơ");
      return;
    }
    if (actionType === "refunded" && refundMethod === "bank_transfer" && !refundReference.trim()) {
      toast.error("Chuyển khoản cần mã tham chiếu");
      return;
    }

    try {
      setActing(true);
      const body =
        actionType === "refunded"
          ? {
              adminNote: adminNote || undefined,
              refundMethod,
              refundReference: refundReference || undefined,
            }
          : { adminNote: adminNote || undefined };

      const res = await apiClient.patch(`/admin/refunds/${selected._id}/${actionType}`, body);
      toast.success(res.data.message || "Xử lý thành công");
      setSelected(res.data.refund);
      fetchRefunds();
      setAdminNote("");
      setRefundReference("");
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
            placeholder="Tìm theo mã đơn, email, tên khách hàng..."
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-slate-700 outline-none hover:bg-slate-100"
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
                <th className="p-4">Lý do</th>
                <th className="p-4">Số tiền</th>
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
                      <td className="p-4 font-black uppercase text-slate-900">
                        #{r.orderId?.orderCode || r._id.slice(-6)}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900">
                          {r.userId?.firstName} {r.userId?.lastName}
                        </p>
                        <p className="text-xs text-slate-500">{r.userId?.email}</p>
                      </td>
                      <td className="p-4 text-slate-600">{getRefundReasonLabel(r.reason)}</td>
                      <td className="p-4 font-black">
                        {r.refundAmount?.toLocaleString("vi-VN")} đ
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${meta.color}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
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
                <p className="mt-1 text-sm font-medium uppercase tracking-widest text-slate-500">
                  Mã đơn: #{selected?.orderId?.orderCode || selected?._id?.slice(-6)}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
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
                <div className="space-y-8">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                      <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                        Khách hàng
                      </h3>
                      <p className="mb-1 font-bold text-slate-900">
                        {selected.userId?.firstName} {selected.userId?.lastName}
                      </p>
                      <p className="mb-1 text-sm text-slate-600">{selected.userId?.email}</p>
                      <p className="mt-4 text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">SĐT:</span>{" "}
                        {selected.userId?.phone || "Chưa cập nhật"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                      <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                        Thông tin Đơn
                      </h3>
                      <p className="mb-1 text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">Mã đơn:</span> #
                        {selected.orderId?.orderCode}
                      </p>
                      <p className="mb-1 text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">Thanh toán bằng:</span>{" "}
                        <span className="uppercase">{selected.orderId?.paymentMethod || "—"}</span>
                      </p>
                      <p className="mt-4 text-xl font-black text-slate-900">
                        Hoàn: {selected.refundAmount?.toLocaleString("vi-VN")} đ
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-6 text-sm">
                    <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                      Chi tiết Yêu cầu
                    </h3>
                    <p className="mb-3">
                      <span className="font-bold text-slate-900">Lý do: </span>
                      {getRefundReasonLabel(selected.reason)}
                    </p>
                    {selected.description && (
                      <p className="mb-3 text-slate-600">{selected.description}</p>
                    )}
                    {selected.returnTrackingCode && (
                      <p className="mb-3">
                        <span className="font-bold text-slate-900">Vận đơn trả hàng: </span>
                        <span className="rounded bg-slate-100 px-2 py-1 font-mono">
                          {selected.returnTrackingCode}
                        </span>{" "}
                        ({selected.returnCarrier || "—"})
                      </p>
                    )}
                    {selected.refundMethod && (
                      <p className="mb-3">
                        <span className="font-bold text-slate-900">Hình thức hoàn: </span>
                        {getRefundMethodLabel(selected.refundMethod)}
                        {selected.refundReference && (
                          <span className="ml-1 font-mono text-indigo-600">
                            — {selected.refundReference}
                          </span>
                        )}
                      </p>
                    )}
                    {selected.adminNote && (
                      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4 text-slate-700">
                        <span className="mb-1 block font-bold text-slate-900">
                          Ghi chú Admin lần trước:{" "}
                        </span>
                        {selected.adminNote}
                      </div>
                    )}
                  </div>
                  <div className="mt-8 border-t border-slate-100 pt-8">
                    {selected.status === "requested" && (
                      <div className="space-y-6">
                        <div>
                          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-600">
                            Ghi chú Admin <span className="text-sm text-red-500">*</span>{" "}
                            <span className="font-medium normal-case tracking-normal text-slate-400">
                              (Bắt buộc khi Từ chối)
                            </span>
                          </label>
                          <textarea
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            rows={4}
                            placeholder="Nhập lý do từ chối hoặc ghi chú nội bộ..."
                            className="w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-sm outline-none transition-all focus:border-slate-400 focus:ring-4 focus:ring-slate-50"
                          />
                        </div>
                        <div className="flex gap-4">
                          <button
                            onClick={() => runAction("approve")}
                            disabled={acting}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3.5 font-bold uppercase tracking-widest text-white transition-all hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Check size={18} />
                            Duyệt Yêu Cầu
                          </button>
                          <button
                            onClick={() => runAction("reject")}
                            disabled={acting}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3.5 font-bold uppercase tracking-widest text-red-600 transition-all hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <X size={18} />
                            Từ chối
                          </button>
                        </div>
                      </div>
                    )}
                    {["approved", "shipped_back", "received"].includes(selected.status) && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">
                            Bước Tiếp Theo
                          </h3>
                          {selected.status !== "received" && (
                            <button
                              onClick={() => runAction("received")}
                              disabled={acting}
                              className="rounded-lg bg-indigo-100 px-4 py-2 text-xs font-bold uppercase tracking-widest text-indigo-700 transition-all hover:bg-indigo-600 hover:text-white disabled:opacity-50"
                            >
                              Đã nhận hàng / Đủ điều kiện
                            </button>
                          )}
                        </div>

                        {selected.orderId?.paymentMethod === "payos" && (
                          <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                            <strong>Lưu ý:</strong> Đơn PayOS sẽ được hoàn vào số dư của khách.
                          </div>
                        )}

                        <div className="space-y-5">
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-600">
                                Hình thức hoàn tiền
                              </label>
                              <select
                                value={refundMethod}
                                onChange={(e) => setRefundMethod(e.target.value)}
                                disabled={selected.orderId?.paymentMethod === "payos"}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none disabled:bg-slate-100 disabled:text-slate-500"
                              >
                                {REFUND_METHODS.map((m) => (
                                  <option key={m.value} value={m.value}>
                                    {m.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-600">
                                Mã giao dịch / Tham chiếu{" "}
                                {refundMethod === "bank_transfer" && (
                                  <span className="text-sm text-red-500">*</span>
                                )}
                              </label>
                              <input
                                value={refundReference}
                                onChange={(e) => setRefundReference(e.target.value)}
                                placeholder="VD: FT2310... (Bắt buộc nếu CK)"
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-slate-400 focus:ring-4 focus:ring-slate-50"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-600">
                              Ghi chú Admin (Không bắt buộc)
                            </label>
                            <textarea
                              value={adminNote}
                              onChange={(e) => setAdminNote(e.target.value)}
                              placeholder="Nhập ghi chú cho lần xử lý này..."
                              rows={3}
                              className="w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-sm outline-none transition-all focus:border-slate-400 focus:ring-4 focus:ring-slate-50"
                            />
                          </div>

                          <button
                            onClick={() => runAction("refunded")}
                            disabled={acting}
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-4 font-bold uppercase tracking-widest text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {acting ? (
                              <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                Đang xử lý...
                              </>
                            ) : (
                              <>
                                <Check size={18} />
                                Xác nhận Hoàn tiền & Hủy Đơn
                              </>
                            )}
                          </button>
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
