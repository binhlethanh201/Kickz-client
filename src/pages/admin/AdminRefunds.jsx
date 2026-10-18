import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Eye, Check, X } from "lucide-react";
import apiClient from "../../services/apiClient";
import { SearchInput, toast, Pagination, Modal, Button } from "../../components/shared/AdminUI";
import {
  getRefundStatusMeta,
  getRefundReasonLabel,
  getRefundMethodLabel,
  REFUND_STATUSES,
  REFUND_METHODS,
} from "../../utils/refundUtils";

const AdminRefunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [action, setAction] = useState(null);
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
    setPage(1);
  }, [statusFilter]);

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
    setAction(null);
    setAdminNote("");
    setRefundMethod("bank_transfer");
    setRefundReference("");
  };

  const runAction = async () => {
    if (action === "reject" && !adminNote.trim()) {
      toast.error("Cần ghi lý do từ chối để lưu hồ sơ");
      return;
    }
    if (action === "refunded" && refundMethod === "bank_transfer" && !refundReference.trim()) {
      toast.error("Chuyển khoản cần mã tham chiếu");
      return;
    }
    try {
      setActing(true);
      const body =
        action === "refunded"
          ? {
              adminNote: adminNote || undefined,
              refundMethod,
              refundReference: refundReference || undefined,
            }
          : { adminNote: adminNote || undefined };
      const res = await apiClient.patch(`/admin/refunds/${selected._id}/${action}`, body);
      toast.success(res.data.message || "Xử lý thành công");
      setSelected(res.data.refund);
      fetchRefunds();
      setAction(null);
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
  const currentData = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const actionButtons = (refund) => {
    const btns = [];
    if (refund.status === "requested") {
      btns.push(
        <button
          key="approve"
          onClick={() => setAction("approve")}
          title="Duyệt"
          className="rounded-lg bg-green-50 p-2 text-green-600 hover:bg-green-500 hover:text-white"
        >
          <Check size={16} />
        </button>,
        <button
          key="reject"
          onClick={() => setAction("reject")}
          title="Từ chối"
          className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-500 hover:text-white"
        >
          <X size={16} />
        </button>,
      );
    }
    if (["approved", "shipped_back", "received"].includes(refund.status)) {
      btns.push(
        <button
          key="received"
          onClick={() => setAction("received")}
          title="Xác nhận đủ điều kiện hoàn tiền"
          className="rounded-lg bg-indigo-50 p-2 text-indigo-600 hover:bg-indigo-500 hover:text-white"
        >
          <Check size={16} />
        </button>,
      );
    }
    if (["approved", "shipped_back", "received"].includes(refund.status)) {
      btns.push(
        <button
          key="refunded"
          onClick={() => setAction("refunded")}
          title="Hoàn tiền"
          className="rounded-lg bg-slate-900 p-2 text-white hover:bg-slate-700"
        >
          <Check size={16} />
        </button>,
      );
    }
    return btns;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-black uppercase tracking-widest text-slate-900">
          Quản lý Hoàn tiền
        </h1>
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm theo mã đơn, email, tên khách..."
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-slate-600 outline-none"
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
                          className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${meta.color}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openDetail(r._id)}
                            title="Xem chi tiết"
                            className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-900 hover:text-white"
                          >
                            <Eye size={16} />
                          </button>
                          {actionButtons(r)}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title="Chi tiết hoàn tiền">
        {detailLoading || !selected ? (
          <p className="animate-pulse py-10 text-center font-bold uppercase tracking-widest text-slate-400">
            Đang tải chi tiết...
          </p>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                  Khách hàng
                </h3>
                <p className="font-bold text-slate-900">
                  {selected.userId?.firstName} {selected.userId?.lastName}
                </p>
                <p className="text-sm text-slate-600">{selected.userId?.email}</p>
                <p className="text-sm text-slate-600">{selected.userId?.phone}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                  Đơn hàng
                </h3>
                <p className="font-bold text-slate-900">#{selected.orderId?.orderCode}</p>
                <p className="text-sm text-slate-600">
                  Tổng: {selected.refundAmount?.toLocaleString("vi-VN")} đ
                </p>
                <p className="text-sm text-slate-600">
                  Thanh toán: {selected.orderId?.paymentMethod || "—"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 p-5 text-sm">
              <p className="mb-2">
                <span className="font-bold">Lý do: </span>
                {getRefundReasonLabel(selected.reason)}
              </p>
              {selected.description && (
                <p className="mb-2 text-slate-600">{selected.description}</p>
              )}
              {selected.returnTrackingCode && (
                <p className="mb-2">
                  <span className="font-bold">Vận đơn trả hàng: </span>
                  {selected.returnTrackingCode} ({selected.returnCarrier || "—"})
                </p>
              )}
              {selected.refundMethod && (
                <p className="mb-2">
                  <span className="font-bold">Hình thức hoàn: </span>
                  {getRefundMethodLabel(selected.refundMethod)}
                  {selected.refundReference ? ` — ${selected.refundReference}` : ""}
                </p>
              )}
              {selected.adminNote && (
                <p className="rounded-xl bg-slate-50 px-4 py-2 text-slate-600">
                  <span className="font-bold text-slate-900">Ghi chú admin: </span>
                  {selected.adminNote}
                </p>
              )}
            </div>

            {!action ? (
              <div className="flex flex-wrap gap-3">
                {selected.status === "requested" && (
                  <>
                    <Button variant="primary" icon={Check} onClick={() => setAction("approve")}>
                      Duyệt
                    </Button>
                    <Button variant="danger" icon={X} onClick={() => setAction("reject")}>
                      Từ chối
                    </Button>
                  </>
                )}
                {["approved", "shipped_back", "received"].includes(selected.status) && (
                  <Button variant="primary" icon={Check} onClick={() => setAction("received")}>
                    Xác nhận đủ điều kiện
                  </Button>
                )}
                {["approved", "shipped_back", "received"].includes(selected.status) && (
                  <Button variant="primary" icon={Check} onClick={() => setAction("refunded")}>
                    Hoàn tiền
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4 rounded-2xl border border-slate-200 p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  {action === "approve" && "Duyệt yêu cầu"}
                  {action === "reject" && "Từ chối yêu cầu (bắt buộc ghi lý do)"}
                  {action === "received" && "Xác nhận đủ điều kiện hoàn tiền"}
                  {action === "refunded" && "Hoàn tiền (cập nhật kho + hủy đơn)"}
                </h3>
                {action === "refunded" && selected.orderId?.paymentMethod === "payos" && (
                  <p className="rounded-xl bg-blue-50 px-4 py-2 text-sm text-blue-800">
                    Đơn PayOS sẽ được hoàn vào số dư của khách. Vui lòng chọn Hoàn vào số dư.
                  </p>
                )}
                {action === "refunded" && (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <select
                      value={refundMethod}
                      onChange={(e) => setRefundMethod(e.target.value)}
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none"
                    >
                      {REFUND_METHODS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <input
                      value={refundReference}
                      onChange={(e) => setRefundReference(e.target.value)}
                      placeholder="Mã tham chiếu (bắt buộc với chuyển khoản)"
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none"
                    />
                  </div>
                )}
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder={
                    action === "reject" ? "Lý do từ chối..." : "Ghi chú (không bắt buộc)..."
                  }
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                />
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setAction(null)}>
                    Hủy
                  </Button>
                  <Button variant="primary" disabled={acting} onClick={runAction}>
                    {acting ? "Đang xử lý..." : "Xác nhận"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminRefunds;
