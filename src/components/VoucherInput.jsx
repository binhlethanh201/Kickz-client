import { useState, useEffect } from "react";
import { Tag, Check, X } from "lucide-react";
import { voucherService } from "../services/voucherService";
import { toast } from "./shared/AdminUI";

const VoucherInput = ({ orderTotal, onApply, appliedVoucher, onRemove }) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeVouchers, setActiveVouchers] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchVouchers = async () => {
      const data = await voucherService.getActiveVouchers();
      setActiveVouchers(data.vouchers || []);
    };
    fetchVouchers();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      toast.error("Vui lòng nhập mã voucher");
      return;
    }

    setIsLoading(true);

    try {
      const result = await voucherService.validateVoucher(code, orderTotal);

      if (result.valid) {
        onApply(result.voucher, result.discount, result.newTotal);
        setCode("");
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Lỗi khi kiểm tra voucher");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickApply = async (voucherCode) => {
    setIsLoading(true);

    try {
      const result = await voucherService.validateVoucher(voucherCode, orderTotal);

      if (result.valid) {
        onApply(result.voucher, result.discount, result.newTotal);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Lỗi khi kiểm tra voucher");
    } finally {
      setIsLoading(false);
      setShowSuggestions(false);
    }
  };

  const formatVoucherDisplay = (voucher) => {
    if (voucher.discountType === "percent") {
      return `Giảm ${voucher.discountValue}%`;
    } else {
      return `Giảm ${voucher.discountValue.toLocaleString("vi-VN")} đ`;
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6">
      <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
        <Tag size={20} />
        Mã Khuyến Mãi
      </h3>
      {appliedVoucher && (
        <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Check className="text-green-600" size={20} />
              <div>
                <p className="font-bold text-green-900">{appliedVoucher.code}</p>
                <p className="text-sm text-green-700">
                  {appliedVoucher.description || "Mã khuyến mãi áp dụng thành công"}
                </p>
              </div>
            </div>
            <button
              onClick={onRemove}
              className="rounded-lg bg-green-200 p-2 text-green-700 transition-colors hover:bg-green-300"
              title="Bỏ mã khuyến mãi"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      {!appliedVoucher && (
        <form onSubmit={handleApply} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nhập mã voucher..."
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onFocus={() => setShowSuggestions(true)}
              className="flex-1 rounded-lg border-2 border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium outline-none focus:border-slate-900 focus:bg-white"
            />
            <button
              type="submit"
              disabled={isLoading || !code.trim()}
              className="rounded-lg bg-slate-900 px-6 py-2 font-bold text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "..." : "Áp dụng"}
            </button>
          </div>

          {showSuggestions && activeVouchers.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                💡 Mã Voucher có sẵn
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {activeVouchers.slice(0, 4).map((v) => (
                  <button
                    key={v._id}
                    type="button"
                    onClick={() => handleQuickApply(v.code)}
                    disabled={isLoading}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-left transition-all hover:border-slate-900 hover:bg-slate-100 disabled:opacity-50"
                  >
                    <p className="text-sm font-bold text-slate-900">{v.code}</p>
                    <p className="text-xs text-slate-600">{formatVoucherDisplay(v)}</p>
                    {v.minOrderValue > 0 && (
                      <p className="mt-1 text-xs text-slate-500">
                        Min: {v.minOrderValue.toLocaleString("vi-VN")} đ
                      </p>
                    )}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowSuggestions(false)}
                className="w-full text-xs text-slate-500 hover:text-slate-900"
              >
                Ẩn gợi ý
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default VoucherInput;
