import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CreditCard, Check, X as XIcon, Copy, CheckCircle2 } from "lucide-react";
import { cardService } from "../../services/cardService";
import { Button, Modal, toast, Pagination } from "../../components/shared/AdminUI";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const STATUS_LABELS = {
  pending: "Chờ duyệt",
  approved: "Chờ chuyển khoản",
  completed: "Hoàn tất",
  rejected: "Từ chối",
};

const AdminWithdrawals = () => {
  const { page } = useParams();
  const navigate = useNavigate();
  const currentPage = page ? parseInt(page, 10) : 1;
  const itemsPerPage = 5;

  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const [copiedId, setCopiedId] = useState(null);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const data = await cardService.getAllWithdrawals(activeTab);
      setWithdrawals(data.data);
    } catch (error) {
      toast.error("Lỗi tải danh sách");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate("/admin/withdrawals");
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Xác nhận duyệt yêu cầu này để chuẩn bị chuyển khoản?")) return;
    try {
      await cardService.approveWithdrawal(id, "Admin đã duyệt");
      toast.success("Đã duyệt yêu cầu!");
      fetchWithdrawals();
    } catch (error) {
      toast.error("Lỗi duyệt yêu cầu");
    }
  };

  const handleComplete = async (id) => {
    if (!window.confirm("Bạn xác nhận ĐÃ CHUYỂN TIỀN THÀNH CÔNG và muốn trừ tiền hệ thống?"))
      return;
    try {
      await cardService.completeWithdrawal(id);
      toast.success("Giao dịch hoàn tất!");
      fetchWithdrawals();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi hoàn tất");
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) return toast.error("Vui lòng nhập lý do");
    try {
      await cardService.rejectWithdrawal(rejectId, rejectReason);
      toast.success("Đã từ chối yêu cầu!");
      setIsRejectModalOpen(false);
      setRejectReason("");
      fetchWithdrawals();
    } catch (error) {
      toast.error("Lỗi từ chối");
    }
  };

  const totalPages = Math.ceil(withdrawals.length / itemsPerPage);
  const currentData = withdrawals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageChange = (newPage) => {
    navigate(`/admin/withdrawals/page/${newPage}`);
  };

  return (
    <div className="animate-in fade-in min-h-screen bg-slate-50 p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-black uppercase tracking-widest text-slate-900">
          Quản lý Rút tiền
        </h1>
      </div>

      <div className="mb-8 flex gap-8 border-b border-slate-200">
        {["pending", "approved", "completed", "rejected"].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`border-b-2 pb-4 text-sm font-bold uppercase tracking-widest transition-all ${
              activeTab === tab
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-900"
            }`}
          >
            {STATUS_LABELS[tab]}
          </button>
        ))}
      </div>

      <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-500">
              <tr>
                <th className="p-4">Khách hàng</th>
                <th className="p-4">Số tiền rút</th>
                <th className="p-4">Thông tin chuyển khoản (Dành cho Admin)</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-8 text-center font-bold uppercase tracking-widest text-slate-400"
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
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                currentData.map((w) => (
                  <tr key={w._id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <p className="font-bold text-slate-900">
                        {w.userId?.firstName} {w.userId?.lastName}
                      </p>
                      <p className="text-xs text-slate-500">{w.userId?.email}</p>
                    </td>
                    <td className="p-4 font-black text-red-500">
                      {w.amount.toLocaleString("vi-VN")} đ
                    </td>
                    <td className="p-4">
                      <div className="w-max rounded-lg bg-slate-100 p-3">
                        <p className="mb-1 text-xs font-bold uppercase text-slate-900">
                          {w.bankName}
                        </p>
                        <div
                          className="group flex cursor-pointer items-center gap-2"
                          onClick={() => handleCopy(w.accountNumber, w._id)}
                        >
                          <p className="font-mono text-lg font-bold tracking-wider text-slate-800">
                            {w.accountNumber}
                          </p>
                          {copiedId === w._id ? (
                            <CheckCircle2 size={16} className="text-green-500" />
                          ) : (
                            <Copy size={14} className="text-slate-400 group-hover:text-slate-900" />
                          )}
                        </div>
                        <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">
                          {w.accountName}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${STATUS_COLORS[w.status]}`}
                      >
                        {STATUS_LABELS[w.status]}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {w.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(w._id)}
                              className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() => {
                                setRejectId(w._id);
                                setIsRejectModalOpen(true);
                              }}
                              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold uppercase text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                            >
                              Từ chối
                            </button>
                          </>
                        )}
                        {w.status === "approved" && (
                          <button
                            onClick={() => handleComplete(w._id)}
                            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold uppercase text-white shadow-md transition-all hover:bg-slate-800"
                          >
                            Đã CK - Hoàn tất
                          </button>
                        )}
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
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Lý do từ chối"
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <textarea
            required
            autoFocus
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Nhập lý do từ chối (Sai STK, Ngân hàng bảo trì...)"
            className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 text-sm outline-none focus:border-red-500"
            rows="4"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsRejectModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="danger">
              Xác nhận Từ Chối
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminWithdrawals;
