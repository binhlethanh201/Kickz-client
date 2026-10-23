import { useState } from "react";
import { X, Truck } from "lucide-react";
import { RETURN_CARRIERS } from "../../utils/refundUtils";
import { refundService } from "../../services/refundService";
import { toast } from "../shared/AdminUI";

const ReturnShippingModal = ({ isOpen, refund, onClose, onSuccess }) => {
  const [carrier, setCarrier] = useState("ghn");
  const [trackingCode, setTrackingCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !refund) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!trackingCode.trim()) {
      toast.error("Vui lòng nhập mã vận đơn");
      return;
    }

    try {
      setSubmitting(true);
      await refundService.submitReturnShipping(refund._id, {
        returnTrackingCode: trackingCode.trim(),
        returnCarrier: carrier,
      });
      toast.success("Đã cập nhật thông tin gửi hàng trả về thành công!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật mã vận đơn");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-6">
          <div>
            <h2 className="text-xl font-black uppercase tracking-widest text-slate-900">
              Gửi hàng trả về
            </h2>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Cung cấp mã vận đơn để shop xác nhận nhận hàng và hoàn tiền.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-900 hover:text-white"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-600">
              Hãng vận chuyển <span className="text-red-500">*</span>
            </label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium outline-none transition-all focus:border-slate-400"
            >
              {RETURN_CARRIERS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-600">
              Mã vận đơn (Tracking Code) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="Ví dụ: ZZ123456789"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 pl-11 text-sm font-medium outline-none transition-all focus:border-slate-400"
              />
              <Truck size={18} className="absolute left-4 top-4 text-slate-400" />
            </div>
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
              className="flex-1 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-xl shadow-slate-900/20 transition-all hover:bg-slate-800 disabled:opacity-50"
            >
              {submitting ? "Đang gửi..." : "Xác nhận gửi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnShippingModal;
