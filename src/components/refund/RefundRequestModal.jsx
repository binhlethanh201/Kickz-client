import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { REFUND_REASONS } from "../../utils/refundUtils";
import { toast } from "../shared/AdminUI";

export const RefundStatusBadge = ({ status, meta }) => (
  <span
    className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm ${meta.color}`}
  >
    {meta.label}
  </span>
);

const RefundRequestModal = ({ isOpen, order, onClose, onSubmit }) => {
  const [reason, setReason] = useState("damaged");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReason("damaged");
      setDescription("");
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (description && description.length > 500) {
      toast.error("Mô tả không được vượt quá 500 ký tự");
      return;
    }
    try {
      setSubmitting(true);
      await onSubmit({ reason, description: description.trim() || undefined });
      onClose();
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm transition-all">
      <div className="animate-in zoom-in-95 fade-in w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-100 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-6">
          <div>
            <h2 className="text-xl font-black uppercase tracking-widest text-slate-900">
              Yêu cầu hoàn tiền
            </h2>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Vui lòng cung cấp lý do chính xác để shop hỗ trợ nhanh nhất.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-900 hover:text-white hover:ring-slate-900"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <AlertCircle size={20} className="shrink-0 text-blue-600" />
            <div className="text-sm text-blue-900">
              <p>
                Đơn hàng <span className="font-bold">#{order?.orderCode}</span> • Trị giá{" "}
                <span className="font-bold text-blue-700">
                  {order?.totalPrice?.toLocaleString("vi-VN")} ₫
                </span>
              </p>
              <p className="mt-1 text-xs text-blue-700/80">
                Admin sẽ xem xét và phản hồi yêu cầu của bạn trong vòng tối đa 3 ngày làm việc.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-600">
                Lý do hoàn tiền / Trả hàng <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium outline-none transition-all focus:border-slate-400 focus:ring-4 focus:ring-slate-50"
                >
                  {REFUND_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                  ▼
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-600">
                <span>Mô tả chi tiết</span>
                <span
                  className={`${description.length > 500 ? "text-red-500" : "text-slate-400"} font-medium`}
                >
                  {description.length}/500
                </span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Vui lòng mô tả rõ tình trạng sản phẩm, hoặc lý do bạn muốn hoàn tiền..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none transition-all focus:border-slate-400 focus:ring-4 focus:ring-slate-50"
              />
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold uppercase tracking-widest text-slate-600 transition-all hover:border-slate-900 hover:text-slate-900"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-xl shadow-slate-900/20 transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Đang gửi...
                  </span>
                ) : (
                  "Gửi yêu cầu"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RefundRequestModal;
