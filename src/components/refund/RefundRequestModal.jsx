import { useState } from "react";
import { REFUND_REASONS } from "../../utils/refundUtils";
import { toast } from "../shared/AdminUI";

export const RefundStatusBadge = ({ status, meta }) => (
  <span
    className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${meta.color}`}
  >
    {meta.label}
  </span>
);

const RefundRequestModal = ({ isOpen, order, onClose, onSubmit }) => {
  const [reason, setReason] = useState("damaged");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (description && description.length > 500) {
      toast.error("Mô tả không vượt quá 500 ký tự");
      return;
    }
    try {
      setSubmitting(true);
      await onSubmit({ reason, description: description || undefined });
      setReason("damaged");
      setDescription("");
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-xl font-black uppercase tracking-widest text-slate-900">
            Yêu cầu hoàn tiền
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          >
            ✕
          </button>
        </div>

        <p className="mb-6 text-sm text-slate-600">
          Đơn hàng <span className="font-bold text-slate-900">#{order?.orderCode}</span> •{" "}
          {order?.totalPrice?.toLocaleString("vi-VN")} VNĐ. Admin sẽ xem xét trong 3 ngày.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
              Lý do hoàn tiền
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-slate-900"
            >
              {REFUND_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
              Mô tả thêm (tối đa 500 ký tự)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Mô tả tình trạng sản phẩm, ảnh hưởng của lỗi..."
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
            />
            <p className="mt-1 text-right text-xs text-slate-400">{description.length}/500</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-200"
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold uppercase tracking-widest text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RefundRequestModal;
