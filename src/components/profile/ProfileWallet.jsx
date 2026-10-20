import { useState, useEffect } from "react";
import { Wallet, ArrowRightLeft, Clock, Info } from "lucide-react";
import { cardService } from "../../services/cardService";

const STATUS_MAP = {
  pending: { label: "Đang chờ duyệt", color: "bg-yellow-100 text-yellow-700" },
  approved: { label: "Đã duyệt - Chờ ck", color: "bg-blue-100 text-blue-700" },
  completed: { label: "Hoàn tất", color: "bg-green-100 text-green-700" },
  rejected: { label: "Bị từ chối", color: "bg-red-100 text-red-700" },
};

const ProfileWallet = () => {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [balRes, histRes] = await Promise.all([
        cardService.getMyBalance(),
        cardService.getMyWithdrawals(),
      ]);
      setBalance(balRes.balance);
      setHistory(histRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    const withdrawAmount = Number(amount);
    if (withdrawAmount < 10000) {
      return setError("Số tiền rút tối thiểu là 10.000 VNĐ");
    }
    if (withdrawAmount > balance) {
      return setError(`Số dư không đủ.`);
    }

    setIsSubmitting(true);
    try {
      await cardService.requestWithdrawal({
        amount: withdrawAmount,
        bankName,
        accountNumber,
        accountName,
      });
      setSuccessMsg("Đã gửi yêu cầu rút tiền thành công!");
      setAmount("");
      setBankName("");
      setAccountNumber("");
      setAccountName("");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi rút tiền");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="animate-pulse p-8 text-center font-bold uppercase tracking-widest text-slate-400">
        Đang tải...
      </div>
    );

  return (
    <div className="animate-in fade-in space-y-8">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <Wallet className="text-slate-900" size={24} />
        <h2 className="text-xl font-black uppercase tracking-widest text-slate-900">Ví của tôi</h2>
      </div>
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 p-8 opacity-10">
          <Wallet size={120} />
        </div>
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-slate-400">
          Số dư hiện tại
        </p>
        <p className="text-4xl font-black">{balance.toLocaleString("vi-VN")} VNĐ</p>
      </div>
      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-blue-900">
          <Info size={18} strokeWidth={2.5} className="text-blue-600" /> Quy định rút tiền
        </h3>
        <ul className="list-inside list-disc space-y-2 text-sm font-medium text-blue-800">
          <li>
            <strong>Hạn mức tối thiểu:</strong> 10.000 VNĐ cho mỗi lần rút.
          </li>
          <li>
            <strong>Tần suất an toàn:</strong> Chỉ được tạo{" "}
            <strong>1 lệnh rút tiền mỗi 24 giờ</strong>.
          </li>
          <li>
            <strong>Hàng đợi:</strong> Phải đợi lệnh rút tiền trước đó hoàn tất hoặc bị từ chối mới
            được tạo lệnh mới.
          </li>
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-900">
            <ArrowRightLeft size={16} /> Yêu cầu rút tiền
          </h3>
          {error && (
            <p className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-xs font-bold uppercase text-red-600">
              {error}
            </p>
          )}
          {successMsg && (
            <p className="mb-4 rounded-lg border border-green-100 bg-green-50 p-3 text-xs font-bold uppercase text-green-600">
              {successMsg}
            </p>
          )}

          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Số tiền rút (Tối thiểu 10.000đ)
              </label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 bg-white p-3 text-sm font-bold outline-none focus:border-slate-900"
                placeholder="VD: 100000"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Ngân hàng
              </label>
              <input
                type="text"
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 bg-white p-3 text-sm font-bold uppercase outline-none focus:border-slate-900"
                placeholder="VD: Vietcombank"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Số tài khoản
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 bg-white p-3 text-sm font-bold outline-none focus:border-slate-900"
                placeholder="VD: 1903..."
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Tên chủ tài khoản
              </label>
              <input
                type="text"
                required
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 bg-white p-3 text-sm font-bold uppercase outline-none focus:border-slate-900"
                placeholder="VD: NGUYEN VAN A"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-xl bg-slate-900 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
            >
              {isSubmitting ? "Đang gửi..." : "Rút tiền"}
            </button>
          </form>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-900">
            <Clock size={16} /> Lịch sử giao dịch
          </h3>
          <div className="max-h-[400px] space-y-4 overflow-y-auto pr-2">
            {history.length === 0 ? (
              <p className="mt-10 text-center text-xs italic text-slate-500">
                Chưa có giao dịch nào.
              </p>
            ) : (
              history.map((item) => (
                <div
                  key={item._id}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition-all hover:bg-white hover:shadow-md"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <span className="font-black text-slate-900">
                      {item.amount.toLocaleString("vi-VN")} đ
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${STATUS_MAP[item.status].color}`}
                    >
                      {STATUS_MAP[item.status].label}
                    </span>
                  </div>
                  <p className="mb-1 text-xs font-medium text-slate-600">
                    {item.bankName} - {item.accountNumber}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString("vi-VN")}{" "}
                    {new Date(item.createdAt).toLocaleTimeString("vi-VN")}
                  </p>
                  {item.adminNote && (
                    <p className="mt-2 rounded bg-red-50 p-2 text-xs text-red-500">
                      <span className="font-bold">Ghi chú:</span> {item.adminNote}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileWallet;
