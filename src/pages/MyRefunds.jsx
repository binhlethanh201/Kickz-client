import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Package, XCircle } from "lucide-react";
import { refundService } from "../services/refundService";
import { getRefundStatusMeta, getRefundReasonLabel, canCancelRefund } from "../utils/refundUtils";
import { RefundStatusBadge } from "../components/refund/RefundRequestModal";
import { toast } from "../components/shared/AdminUI";

const ACTION_LABELS = {
  requested: "Đã gửi yêu cầu",
  approved: "Admin đã duyệt",
  rejected: "Admin đã từ chối",
  shipped_back: "Bạn đã gửi hàng về",
  received: "Shop đã nhận hàng trả về",
  refunded: "Đã hoàn tiền",
  cancelled: "Đã hủy yêu cầu",
};

const MyRefunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

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

  const handleCancel = async (refundId) => {
    if (!window.confirm("Hủy yêu cầu hoàn tiền này?")) return;
    try {
      setActing(true);
      await refundService.cancelRequest(refundId);
      toast.success("Đã hủy yêu cầu hoàn tiền");
      fetchRefunds();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi hủy yêu cầu");
    } finally {
      setActing(false);
    }
  };

  if (loading)
    return (
      <div className="animate-pulse py-24 text-center uppercase tracking-widest">Đang tải...</div>
    );

  return (
    <div className="mx-auto min-h-[75vh] max-w-5xl px-4 py-16">
      <Link
        to="/order"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft size={16} /> Quay lại đơn hàng
      </Link>

      <h1 className="mb-10 text-center text-3xl font-light uppercase tracking-widest text-slate-900">
        Yêu cầu hoàn tiền
      </h1>

      {refunds.length === 0 ? (
        <div className="rounded-2xl border border-white/60 bg-white/50 py-12 text-center">
          <Package size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="mb-4 text-slate-500">Bạn chưa có yêu cầu hoàn tiền nào.</p>
          <Link
            to="/order"
            className="text-sm font-bold uppercase tracking-widest text-slate-900 underline"
          >
            Xem đơn hàng
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {refunds.map((refund) => {
            const meta = getRefundStatusMeta(refund.status);
            const order = refund.orderId || {};
            return (
              <div
                key={refund._id}
                className="rounded-2xl border border-white/60 bg-white/60 p-6 shadow-sm backdrop-blur-md"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="mb-1 text-sm font-bold uppercase tracking-widest text-slate-900">
                      Đơn #{order.orderCode || "—"} •{" "}
                      {(refund.refundAmount ?? order.totalPrice)?.toLocaleString("vi-VN")} VNĐ
                    </p>
                    <p className="text-xs text-slate-500">
                      {getRefundReasonLabel(refund.reason)} •{" "}
                      {new Date(refund.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                    {refund.description && (
                      <p className="mt-2 text-sm text-slate-600">{refund.description}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <RefundStatusBadge status={refund.status} meta={meta} />
                  </div>
                </div>

                {refund.adminNote && (
                  <p className="mt-3 rounded-xl bg-slate-50 px-4 py-2 text-sm text-slate-600">
                    <span className="font-bold text-slate-900">Phản hồi shop: </span>
                    {refund.adminNote}
                  </p>
                )}

                {refund.history?.length > 0 && (
                  <div className="mt-4 space-y-1 border-t border-slate-100 pt-3">
                    {refund.history.map((h, idx) => (
                      <p key={idx} className="text-xs text-slate-500">
                        • {ACTION_LABELS[h.action] || h.action}
                        {h.note ? ` — ${h.note}` : ""} ({new Date(h.at).toLocaleString("vi-VN")})
                      </p>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
                  {refund.status === "approved" && (
                    <p className="text-xs text-slate-500">
                      Shop đã duyệt. Vui lòng chờ shop xác nhận và hoàn tiền.
                    </p>
                  )}
                  {canCancelRefund(refund) && (
                    <button
                      onClick={() => handleCancel(refund._id)}
                      disabled={acting}
                      className="flex items-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-red-600 hover:border-red-500 hover:bg-red-500 hover:text-white disabled:opacity-50"
                    >
                      <XCircle size={14} /> Hủy yêu cầu
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyRefunds;
