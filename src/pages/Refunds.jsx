import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Package, XCircle, RefreshCcw, ChevronRight, ChevronLeft } from "lucide-react";
import { refundService } from "../services/refundService";
import { getRefundStatusMeta, getRefundReasonLabel, canCancelRefund } from "../utils/refundUtils";
import { RefundStatusBadge } from "../components/refund/RefundRequestModal";
import { toast } from "../components/shared/AdminUI";

const ACTION_LABELS = {
  requested: "Đã gửi yêu cầu",
  approved: "Admin đã duyệt",
  rejected: "Admin đã từ chối",
  shipped_back: "Bạn đã gửi hàng về",
  received: "Shop đã nhận hàng",
  refunded: "Đã hoàn tiền",
  cancelled: "Đã hủy yêu cầu",
};

const MyRefunds = () => {
  const { page } = useParams();
  const navigate = useNavigate();
  const currentPage = page ? parseInt(page, 10) : 1;
  const itemsPerPage = 5;

  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const location = useLocation();
  const focusOrderCode = location.state?.focusOrderCode;

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const data = await refundService.getMyRequests();
      setRefunds(data.refunds || []);
    } catch {
      toast.error("Không thể tải danh sách hoàn tiền");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  useEffect(() => {
    if (focusOrderCode && refunds.length > 0) {
      const el = document.getElementById(`refund-card-${focusOrderCode}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-4", "ring-blue-400", "shadow-2xl", "scale-[1.02]");
        setTimeout(() => {
          el.classList.remove("ring-4", "ring-blue-400", "shadow-2xl", "scale-[1.02]");
        }, 3000);
      }
    }
  }, [refunds, focusOrderCode]);

  const handleCancel = async (refundId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy yêu cầu hoàn tiền này?")) return;
    try {
      setActing(true);
      await refundService.cancelRequest(refundId);
      toast.success("Đã hủy yêu cầu hoàn tiền");
      fetchRefunds();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi hủy yêu cầu");
    } finally {
      setActing(false);
    }
  };

  const totalPages = Math.ceil(refunds.length / itemsPerPage);
  const currentData = refunds.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage) => {
    navigate(`/refunds/page/${newPage}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
          <p className="animate-pulse text-sm font-bold uppercase tracking-widest text-slate-400">
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );

  return (
    <div className="animate-in fade-in mx-auto min-h-[75vh] max-w-5xl px-4 py-12 duration-500 md:py-20">
      <div className="mb-10 flex flex-col-reverse items-center justify-between gap-6 md:flex-row">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-slate-900">
            Yêu cầu hoàn tiền
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Theo dõi trạng thái các yêu cầu hoàn tiền và trả hàng của bạn
          </p>
        </div>
        <Link
          to="/order"
          className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-900 hover:text-white hover:ring-slate-900 md:w-auto"
        >
          <ArrowLeft
            size={16}
            strokeWidth={2.5}
            className="transition-transform group-hover:-translate-x-1"
          />
          Quay lại đơn hàng
        </Link>
      </div>

      {refunds.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white py-24 text-center shadow-sm">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50">
            <Package size={40} className="text-slate-300" strokeWidth={1.5} />
          </div>
          <h3 className="mb-2 text-lg font-bold text-slate-900">Chưa có yêu cầu nào</h3>
          <p className="mb-8 text-sm text-slate-500">
            Bạn không có yêu cầu hoàn tiền nào đang được xử lý.
          </p>
          <Link
            to="/order"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white transition-all hover:-translate-y-1 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20"
          >
            Xem đơn hàng của bạn
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-5">
            {currentData.map((refund) => {
              const meta = getRefundStatusMeta(refund.status);
              const order = refund.orderId || {};
              return (
                <div
                  key={refund._id}
                  id={`refund-card-${order.orderCode}`}
                  className="group flex flex-col gap-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-slate-200 hover:shadow-xl"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-5">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-colors duration-300 group-hover:bg-slate-900 group-hover:text-white">
                        <RefreshCcw size={24} strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="mb-1 text-sm font-black uppercase tracking-widest text-slate-900">
                          Đơn #{order.orderCode || "—"}
                        </p>
                        <p className="text-xs font-medium text-slate-500">
                          {new Date(refund.createdAt).toLocaleDateString("vi-VN")} •{" "}
                          <span className="text-slate-900">
                            {getRefundReasonLabel(refund.reason)}
                          </span>
                        </p>
                        {refund.description && (
                          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
                            {refund.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-start gap-3 border-t border-slate-50 pt-4 md:items-end md:border-none md:pt-0">
                      <p className="text-lg font-black text-slate-900">
                        {(refund.refundAmount ?? order.totalPrice)?.toLocaleString("vi-VN")}{" "}
                        <span className="text-sm">₫</span>
                      </p>
                      <div className="origin-left scale-90 md:origin-right">
                        <RefundStatusBadge status={refund.status} meta={meta} />
                      </div>
                    </div>
                  </div>

                  {refund.adminNote && (
                    <div className="mt-2 rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-700">
                        <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-900">
                          Shop phản hồi:
                        </span>
                        {refund.adminNote}
                      </p>
                    </div>
                  )}
                  <div className="flex flex-col gap-4 border-t border-slate-50 pt-5 md:flex-row md:items-end md:justify-between">
                    <div className="flex-1">
                      {refund.history?.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                            Tiến trình
                          </p>
                          {refund.history.map((h, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2 text-xs font-medium text-slate-500"
                            >
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300"></span>
                              <p>
                                <span className="text-slate-700">
                                  {ACTION_LABELS[h.action] || h.action}
                                </span>
                                {h.note && <span className="italic"> — {h.note}</span>}
                                <span className="ml-1 text-[10px] text-slate-400">
                                  ({new Date(h.at).toLocaleDateString("vi-VN")})
                                </span>
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div></div>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-3 md:min-w-[200px]">
                      {refund.status === "approved" && (
                        <p className="text-right text-xs font-medium text-slate-500">
                          * Đang chờ chuyển khoản hoàn tiền.
                        </p>
                      )}
                      {canCancelRefund(refund) && (
                        <button
                          onClick={() => handleCancel(refund._id)}
                          disabled={acting}
                          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-5 py-3 text-xs font-bold uppercase tracking-widest text-red-600 transition-all hover:bg-red-500 hover:text-white disabled:opacity-50 md:w-auto"
                        >
                          {acting ? (
                            <span className="animate-pulse">Đang xử lý...</span>
                          ) : (
                            <>
                              <XCircle
                                size={16}
                                className="transition-transform group-hover:rotate-90"
                              />
                              Hủy yêu cầu
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-500"
              >
                <ChevronLeft size={20} strokeWidth={2} />
              </button>

              <div className="flex items-center gap-2 max-md:hidden">
                {[...Array(totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold transition-all ${
                        currentPage === pageNum
                          ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-slate-900 hover:text-slate-900"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <div className="flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 font-bold text-slate-900 md:hidden">
                {currentPage} / {totalPages}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-500"
              >
                <ChevronRight size={20} strokeWidth={2} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyRefunds;
