import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Clock,
  MapPin,
  CreditCard,
  Truck,
  ShieldAlert,
  Receipt,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";
import { orderService } from "../services/orderService";
import { refundService } from "../services/refundService";
import { canRequestRefund } from "../utils/refundUtils";
import RefundRequestModal from "../components/refund/RefundRequestModal";
import { toast } from "../components/shared/AdminUI";

const formatStatus = (status) => {
  const statusMap = {
    pending: { text: "Chờ thanh toán", style: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    paid: { text: "Đã thanh toán", style: "bg-blue-100 text-blue-700 border-blue-200" },
    processing: { text: "Đang xử lý", style: "bg-indigo-100 text-indigo-700 border-indigo-200" },
    shipped: { text: "Đang giao", style: "bg-purple-100 text-purple-700 border-purple-200" },
    completed: { text: "Hoàn thành", style: "bg-green-100 text-green-700 border-green-200" },
    cancelled: { text: "Đã hủy", style: "bg-red-100 text-red-700 border-red-200" },
  };
  return (
    statusMap[status] || { text: status, style: "bg-slate-100 text-slate-700 border-slate-200" }
  );
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  const fetchOrder = async () => {
    try {
      const data = await orderService.getOrderDetail(id);
      setOrder(data.order);
    } catch (error) {
      console.error("Lỗi:", error);
      toast.error("Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const isPaidOrder = !!order?.paidAt;
  const isPendingUnpaid = order?.status === "pending" && !order?.paidAt;
  const isCancellable = order && ["pending", "paid"].includes(order.status);

  const handleCancelOrder = async () => {
    if (!isCancellable) {
      toast.error("Không thể hủy đơn hàng ở trạng thái này");
      return;
    }

    const confirmed = window.confirm(
      isPaidOrder
        ? "Hủy đơn hàng này? Đơn đã thanh toán nên hệ thống sẽ tạo yêu cầu hoàn tiền."
        : "Hủy đơn hàng này? Đơn chưa thanh toán nên hủy trực tiếp, không phát sinh hoàn tiền.",
    );
    if (!confirmed) return;

    try {
      setIsCancelling(true);
      const result = await orderService.cancelOrder(order._id);
      toast.success(result.message || "Đã hủy đơn hàng");
      setOrder(result.order);
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi hủy đơn hàng");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRefundSubmit = async ({ reason, description }) => {
    try {
      const result = await refundService.createRequest(order._id, {
        reason,
        description,
      });
      toast.success(result.message || "Đã gửi yêu cầu hoàn tiền");
      setIsRefundModalOpen(false);
      fetchOrder();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi gửi yêu cầu hoàn tiền");
      throw error;
    }
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

  if (!order)
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <AlertCircle size={48} className="text-slate-300" />
        <div className="text-lg font-bold text-slate-900">Không tìm thấy đơn hàng.</div>
        <button
          onClick={() => navigate("/order")}
          className="text-sm font-bold text-slate-500 underline"
        >
          Quay lại danh sách
        </button>
      </div>
    );

  const initialTotal =
    order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) + order.shippingFee;
  const statusData = formatStatus(order.status);

  return (
    <div className="animate-in fade-in mx-auto min-h-[75vh] max-w-4xl px-4 py-12 duration-500 md:py-20">
      <Link
        to="/order"
        className="group mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        Quay lại danh sách
      </Link>

      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-xl">
        <div className="border-b border-slate-100 bg-slate-50/50 p-6 md:p-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-widest text-slate-900">
                Đơn hàng #{order.orderCode}
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Ngày đặt: {new Date(order.createdAt).toLocaleString("vi-VN")}
              </p>
            </div>
            <span
              className={`inline-flex shrink-0 items-center justify-center rounded-full border px-4 py-1.5 text-xs font-black uppercase tracking-wider ${statusData.style}`}
            >
              {statusData.text}
            </span>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="mb-10 space-y-6">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-900">
              <Receipt size={18} /> Sản phẩm
            </h3>
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="group flex flex-col items-center gap-6 rounded-2xl border border-transparent p-2 transition-colors hover:bg-slate-50 md:flex-row"
              >
                <img
                  src={item.productId?.img}
                  alt={item.productId?.name}
                  className="h-24 w-24 shrink-0 rounded-2xl bg-white object-cover shadow-sm ring-1 ring-slate-100"
                />
                <div className="flex-grow text-center md:text-left">
                  <p className="text-base font-bold text-slate-900">
                    {item.productId?.name || "Sản phẩm không tồn tại"}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Số lượng: {item.quantity}
                  </p>
                </div>
                <p className="text-lg font-black text-slate-900">
                  {item.price.toLocaleString("vi-VN")} <span className="text-xs">₫</span>
                </p>
              </div>
            ))}
          </div>

          <div className="mb-10 grid grid-cols-1 gap-6 rounded-2xl bg-slate-50 p-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex gap-3">
                <MapPin className="shrink-0 text-slate-400" size={20} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Giao tới
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{order.address}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Truck className="shrink-0 text-slate-400" size={20} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Vận chuyển
                  </p>
                  <p className="mt-1 text-sm font-medium capitalize text-slate-900">
                    {order.shippingMethod === "express"
                      ? `Hỏa tốc (+ ${order.shippingFee.toLocaleString("vi-VN")} ₫)`
                      : "Tiêu chuẩn"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <CreditCard className="shrink-0 text-slate-400" size={20} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Thanh toán
                  </p>
                  <p className="mt-1 text-sm font-medium uppercase text-slate-900">
                    {order.paymentMethod === "payos" && "PayOS (Chuyển khoản QR)"}
                    {order.paymentMethod === "cod" && "Thanh toán khi nhận hàng (COD)"}
                    {order.paymentMethod === "wallet" && "Số dư ví hệ thống"}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                {order.paidAt ? (
                  <Check className="shrink-0 text-green-500" size={20} />
                ) : (
                  <Clock className="shrink-0 text-amber-500" size={20} />
                )}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Trạng thái TT
                  </p>
                  <p
                    className={`mt-1 text-sm font-bold ${order.paidAt ? "text-green-600" : "text-amber-600"}`}
                  >
                    {order.paidAt
                      ? `Đã thanh toán lúc ${new Date(order.paidAt).toLocaleString("vi-VN")}`
                      : "Chưa thanh toán"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-100 pt-8 text-sm">
            <div className="flex justify-between text-slate-600">
              <span className="font-medium">Tạm tính:</span>
              <span>{initialTotal.toLocaleString("vi-VN")} ₫</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="font-medium">Mã giảm giá:</span>
                <span className="font-bold">-{order.discount.toLocaleString("vi-VN")} ₫</span>
              </div>
            )}

            {order.walletUsed > 0 && (
              <div className="flex justify-between text-blue-600">
                <span className="font-medium">Đã thanh toán qua ví:</span>
                <span className="font-bold">-{order.walletUsed.toLocaleString("vi-VN")} ₫</span>
              </div>
            )}

            <div className="flex items-end justify-between pt-4">
              <span className="text-sm font-bold uppercase tracking-widest text-slate-900">
                Tổng cộng:
              </span>
              <span className="text-3xl font-black text-slate-900">
                {order.totalPrice.toLocaleString("vi-VN")} <span className="text-lg">₫</span>
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/50 p-6 md:p-8">
          {isPendingUnpaid && (
            <div className="space-y-4">
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-4 text-sm font-bold uppercase tracking-widest text-red-600 transition-all hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCancelling ? (
                  <span className="animate-pulse">Đang xử lý...</span>
                ) : (
                  "Hủy đơn hàng (Không hoàn tiền)"
                )}
              </button>
              <p className="text-center text-xs font-medium text-slate-500">
                Đơn hàng chờ thanh toán có thể hủy trực tiếp không phát sinh chi phí.
              </p>
            </div>
          )}

          {isCancellable && isPaidOrder && (
            <div className="space-y-4">
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-4 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCancelling ? (
                  <span className="animate-pulse">Đang xử lý...</span>
                ) : (
                  "Hủy đơn hàng & Hoàn tiền"
                )}
              </button>
              <p className="text-center text-xs font-medium text-slate-500">
                Đơn đã thanh toán. Khi hủy hệ thống sẽ tạo yêu cầu hoàn tiền.{" "}
                <Link
                  to="/refunds"
                  state={{ focusOrderCode: order.orderCode }}
                  className="font-bold text-slate-900 underline hover:text-blue-600"
                >
                  Xem yêu cầu của tôi
                </Link>
              </p>
            </div>
          )}

          {!isCancellable &&
            order.status !== "cancelled" &&
            (canRequestRefund(order) ? (
              <div className="space-y-4">
                <button
                  onClick={() => setIsRefundModalOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-4 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20"
                >
                  Yêu cầu hoàn tiền / Trả hàng
                </button>
                <p className="text-center text-xs font-medium text-slate-500">
                  Shop sẽ duyệt yêu cầu trong vòng 3 ngày làm việc.{" "}
                  <Link
                    to="/refunds"
                    state={{ focusOrderCode: order.orderCode }}
                    className="font-bold text-slate-900 underline hover:text-blue-600"
                  >
                    Xem yêu cầu của tôi
                  </Link>
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
                <ShieldAlert className="shrink-0 text-yellow-600" size={24} />
                <div>
                  <p className="text-sm font-bold text-yellow-900">Không thể thao tác</p>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-yellow-800">
                    Trạng thái <b>{formatStatus(order.status).text}</b> không cho phép hủy hoặc yêu
                    cầu hoàn tiền. Vui lòng liên hệ Admin nếu bạn cần hỗ trợ thêm.
                  </p>
                </div>
              </div>
            ))}

          {order.status === "cancelled" && order.paidAt && (
            <div className="flex items-start gap-4 rounded-2xl border border-blue-200 bg-blue-50/50 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <RefreshCcw size={24} />
              </div>
              <div className="space-y-1 text-sm text-blue-900">
                <h3 className="font-bold uppercase tracking-widest">Thông tin hoàn tiền</h3>
                <p className="font-medium text-blue-800">
                  Số tiền:{" "}
                  <b className="text-blue-900">
                    {(order.totalPrice + (order.walletUsed || 0)).toLocaleString("vi-VN")} ₫
                  </b>
                </p>
                <p className="font-medium text-blue-800">Trạng thái: Đang xử lý hoàn tiền</p>
                <Link
                  to="/refunds"
                  state={{ focusOrderCode: order.orderCode }}
                  className="mt-2 inline-block font-bold text-blue-700 underline hover:text-blue-900"
                >
                  Xem chi tiết yêu cầu hoàn tiền &rarr;
                </Link>
              </div>
            </div>
          )}

          {order.status === "cancelled" && !order.paidAt && (
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5">
              <AlertCircle className="shrink-0 text-slate-400" size={24} />
              <div>
                <p className="text-sm font-bold text-slate-700">Đơn hàng đã hủy</p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Đơn chưa thanh toán nên không phát sinh giao dịch hoàn tiền.
                </p>
              </div>
            </div>
          )}

          {order.status === "pending" && order.paymentMethod === "payos" && (
            <p className="mt-4 text-center text-xs font-medium text-slate-500">
              * Đơn hàng đang chờ thanh toán qua PayOS. Vui lòng quét mã QR trên ứng dụng ngân hàng
              để hoàn tất.
            </p>
          )}
        </div>
      </div>

      <RefundRequestModal
        isOpen={isRefundModalOpen}
        order={order}
        onClose={() => setIsRefundModalOpen(false)}
        onSubmit={handleRefundSubmit}
      />
    </div>
  );
};

export default OrderDetail;
