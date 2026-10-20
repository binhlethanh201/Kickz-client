import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Check, Clock } from "lucide-react";
import { orderService } from "../services/orderService";
import { refundService } from "../services/refundService";
import { canRequestRefund } from "../utils/refundUtils";
import RefundRequestModal from "../components/refund/RefundRequestModal";
import { toast } from "../components/shared/AdminUI";

const formatStatus = (status) => {
  const statusMap = {
    pending: { text: "Chờ thanh toán", style: "bg-yellow-100 text-yellow-700" },
    paid: { text: "Đã thanh toán", style: "bg-blue-100 text-blue-700" },
    processing: { text: "Đang xử lý", style: "bg-indigo-100 text-indigo-700" },
    shipped: { text: "Đang giao", style: "bg-purple-100 text-purple-700" },
    completed: { text: "Hoàn thành", style: "bg-green-100 text-green-700" },
    cancelled: { text: "Đã hủy", style: "bg-red-100 text-red-700" },
  };
  return statusMap[status] || { text: status, style: "bg-gray-100 text-gray-700" };
};

const OrderDetail = () => {
  const { id } = useParams();
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
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi gửi yêu cầu hoàn tiền");
      throw error;
    }
  };

  if (loading)
    return (
      <div className="animate-pulse py-24 text-center uppercase tracking-widest">Đang tải...</div>
    );
  if (!order) return <div className="py-24 text-center">Không tìm thấy đơn hàng.</div>;
  const initialTotal =
    order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) + order.shippingFee;

  return (
    <div className="mx-auto min-h-[75vh] max-w-3xl px-4 py-16">
      <Link
        to="/order"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft size={16} /> Quay lại danh sách
      </Link>

      <div className="rounded-2xl border border-white/60 bg-white/50 p-8 shadow-sm backdrop-blur-xl">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-widest text-slate-900">
              Đơn hàng #{order.orderCode}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Ngày đặt: {new Date(order.createdAt).toLocaleString("vi-VN")}
            </p>
          </div>
          <span
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider ${
              formatStatus(order.status).style
            }`}
          >
            {formatStatus(order.status).text}
          </span>
        </div>

        <div className="mb-8 space-y-6">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-6">
              <img
                src={item.productId?.img}
                alt={item.productId?.name}
                className="h-20 w-20 rounded-xl bg-gray-100 object-cover shadow-sm"
              />
              <div className="flex-grow">
                <p className="text-base font-bold text-slate-900">
                  {item.productId?.name || "Sản phẩm không tồn tại"}
                </p>
                <p className="mt-1 text-sm text-slate-500">Số lượng: {item.quantity}</p>
              </div>
              <p className="text-lg font-bold text-slate-900">
                {item.price.toLocaleString("vi-VN")} VNĐ
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-4 rounded-xl border border-white bg-white/80 p-6 text-sm shadow-sm">
          <div className="flex justify-between">
            <span className="font-medium text-slate-600">Thanh toán:</span>
            <span className="font-bold uppercase tracking-wider">
              {order.paymentMethod === "payos" && "PayOS (QR Code)"}
              {order.paymentMethod === "cod" && "COD (Trả tiền khi nhận)"}
              {order.paymentMethod === "wallet" && "Số dư trong hệ thống"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-slate-600">Vận chuyển:</span>
            <span className="font-bold capitalize">
              {order.shippingMethod === "express"
                ? `Hỏa tốc (+ ${order.shippingFee.toLocaleString("vi-VN")} VNĐ)`
                : "Tiêu chuẩn"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-slate-600">Giao tới:</span>
            <span className="max-w-[60%] text-right font-bold">{order.address}</span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 pt-4">
            <span className="font-medium text-slate-600">Trạng thái thanh toán:</span>
            {order.paidAt ? (
              <span className="flex items-center gap-1 font-bold text-green-600">
                <Check size={16} />
                {new Date(order.paidAt).toLocaleString("vi-VN")}
              </span>
            ) : (
              <span className="flex items-center gap-1 font-bold text-amber-600">
                <Clock size={16} />
                Chưa thanh toán
              </span>
            )}
          </div>
          <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
            <div className="flex justify-between text-slate-600">
              <span>Tạm tính:</span>
              <span>{initialTotal.toLocaleString("vi-VN")} VNĐ</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="font-medium">Mã giảm giá:</span>
                <span className="font-bold">-{order.discount.toLocaleString("vi-VN")} VNĐ</span>
              </div>
            )}

            {order.walletUsed > 0 && (
              <div className="flex justify-between text-blue-600">
                <span className="font-medium">Đã thanh toán qua ví:</span>
                <span className="font-bold">-{order.walletUsed.toLocaleString("vi-VN")} VNĐ</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="font-bold uppercase tracking-widest text-slate-900">
                Số tiền cần thanh toán:
              </span>
              <span className="text-2xl font-black text-slate-900">
                {order.totalPrice.toLocaleString("vi-VN")} VNĐ
              </span>
            </div>
          </div>
        </div>

        {isPendingUnpaid && (
          <div className="mt-8 space-y-4">
            <button
              onClick={handleCancelOrder}
              disabled={isCancelling}
              className="w-full rounded-xl border-2 border-red-200 bg-red-50 px-4 py-4 text-sm font-bold uppercase tracking-widest text-red-600 transition-all hover:border-red-500 hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCancelling ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Đang xử lý...
                </span>
              ) : (
                "Hủy đơn hàng (không hoàn tiền)"
              )}
            </button>
            <p className="text-center text-xs text-slate-500">
              Đơn hàng chờ thanh toán có thể hủy trực tiếp. Không phát sinh chi phí hoàn tiền.
            </p>
          </div>
        )}

        {isCancellable && isPaidOrder && (
          <div className="mt-8 space-y-4">
            <button
              onClick={handleCancelOrder}
              disabled={isCancelling}
              className="w-full rounded-xl bg-slate-900 px-4 py-4 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCancelling ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Đang xử lý...
                </span>
              ) : (
                "Hủy đơn hàng & hoàn tiền"
              )}
            </button>
            <p className="text-center text-xs text-slate-500">
              Đơn đã thanh toán nên khi hủy, hệ thống sẽ tạo yêu cầu hoàn tiền.{" "}
              <Link to="/refunds" className="font-bold underline">
                Xem yêu cầu của tôi
              </Link>
            </p>
          </div>
        )}

        {!isCancellable &&
          order.status !== "cancelled" &&
          (canRequestRefund(order) ? (
            <div className="mt-8 space-y-4">
              <button
                onClick={() => setIsRefundModalOpen(true)}
                className="w-full rounded-xl bg-slate-900 px-4 py-4 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-slate-800"
              >
                Yêu cầu hoàn tiền
              </button>
              <p className="text-center text-xs text-slate-500">
                Đơn ở trạng thái "{formatStatus(order.status).text}" cần yêu cầu hoàn tiền. Admin sẽ
                duyệt trong 3 ngày.{" "}
                <Link to="/refunds" className="font-bold underline">
                  Xem yêu cầu của tôi
                </Link>
              </p>
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-6">
              <p className="text-sm font-semibold text-yellow-900">Không thể hủy đơn hàng</p>
              <p className="mt-2 text-sm text-yellow-800">
                Trạng thái "{formatStatus(order.status).text}" không cho phép hủy hoặc yêu cầu hoàn
                tiền. Vui lòng liên hệ admin nếu cần hỗ trợ.
              </p>
            </div>
          ))}

        {order.status === "cancelled" && order.paidAt && (
          <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-6">
            <h3 className="mb-3 text-sm font-bold text-blue-900">💳 Thông tin hoàn tiền</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>
                <span className="font-semibold">Số tiền:</span>{" "}
                {(order.totalPrice + (order.walletUsed || 0)).toLocaleString("vi-VN")} VNĐ
              </p>
              <p>
                <span className="font-semibold">Trạng thái:</span> Chờ xử lý hoàn tiền
              </p>
              <p className="pt-2 text-xs">
                <Link to="/refunds" className="font-bold underline">
                  Xem chi tiết yêu cầu hoàn tiền →
                </Link>
              </p>
            </div>
          </div>
        )}

        {order.status === "cancelled" && !order.paidAt && (
          <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-700">Đơn hàng đã hủy</p>
            <p className="mt-2 text-sm text-slate-500">
              Đơn chưa thanh toán nên không phát sinh hoàn tiền.
            </p>
          </div>
        )}

        {order.status === "pending" && order.paymentMethod === "payos" && (
          <p className="mt-4 text-center text-xs text-slate-500">
            Đơn hàng đang chờ thanh toán qua PayOS. Vui lòng quét mã QR để hoàn tất thanh toán.
          </p>
        )}
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
